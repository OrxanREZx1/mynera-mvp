import uuid

from rest_framework import generics, status
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from analytics.events import EventName
from analytics.services import track_event

from .models import Question, UserAssessment
from .serializers import (
    QuestionSerializer,
    SubmitAnswersSerializer,
    UserAssessmentSerializer,
)
from .services import AIServiceError, analyze_assessment


class QuestionListView(generics.ListAPIView):
    """GET /api/questions/ — aktiv suallar, nested choices ilə, sıralı."""

    serializer_class = QuestionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            Question.objects.filter(is_active=True)
            .order_by("order", "id")
            .prefetch_related("choices")
        )


class SubmitAnswersView(APIView):
    """
    POST /api/submit-answers/ — analiz et, saxla, JSON qaytar.

    Avtomatik eventlər: assessment_completed → roadmap_generation_started →
    roadmap_generated (hamısı server tərəfdə, dublikatsız).

    OpenAI çağırışı bahalı olduğu üçün endpoint scoped throttle ilə qorunur
    (config/settings.py → DEFAULT_THROTTLE_RATES["submit-answers"]).
    """

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "submit-answers"

    def post(self, request):
        serializer = SubmitAnswersSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        raw_answers = data["answers"]
        session_id = data.get("session_id") or uuid.uuid4()

        track_event(
            EventName.ASSESSMENT_COMPLETED,
            request=request,
            session_id=session_id,
            metadata={"answer_count": len(raw_answers)},
        )
        track_event(
            EventName.ROADMAP_GENERATION_STARTED, request=request, session_id=session_id
        )

        try:
            final_result = analyze_assessment(raw_answers)
        except AIServiceError as exc:
            return Response(
                {"error": "ai_service_error", "detail": str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        assessment = UserAssessment.objects.create(
            session_id=session_id,
            user=request.user if request.user.is_authenticated else None,
            raw_answers=raw_answers,
            final_result=final_result,
        )

        track_event(
            EventName.ROADMAP_GENERATED,
            request=request,
            session_id=session_id,
            metadata={
                "assessment_id": assessment.id,
                "recommended_branch": final_result.get("recommended_branch"),
            },
        )

        return Response(
            {
                "session_id": str(assessment.session_id),
                "assessment_id": assessment.id,
                "result": final_result,
            },
            status=status.HTTP_200_OK,
        )


class AssessmentResultView(APIView):
    """
    GET /api/assessments/<uuid:session_id>/ — nəticə səhifəsi yenidən
    yüklənəndə roadmap-ı çəkmək üçün. Session UUID təxminedilməz olduğu
    üçün anonim giriş təhlükəsizdir; qeyd bir istifadəçiyə bağlıdırsa,
    yalnız həmin istifadəçi (və ya staff) baxa bilər.

    Avtomatik event: roadmap_viewed.
    """

    permission_classes = [AllowAny]

    def get(self, request, session_id):
        assessment = (
            UserAssessment.objects.filter(session_id=session_id)
            .order_by("-created_at")
            .first()
        )
        if assessment is None:
            raise NotFound("Assessment tapılmadı.")

        if assessment.user_id is not None:
            if not request.user.is_authenticated or (
                request.user.pk != assessment.user_id and not request.user.is_staff
            ):
                # Mövcudluğu sızdırmamaq üçün 404
                raise NotFound("Assessment tapılmadı.")

        track_event(
            EventName.ROADMAP_VIEWED,
            request=request,
            session_id=assessment.session_id,
            metadata={"assessment_id": assessment.id},
        )
        return Response(UserAssessmentSerializer(assessment).data)


class MyAssessmentsView(generics.ListAPIView):
    """
    GET /api/my-assessments/ — doğrulanmış istifadəçinin bütün keçmiş
    test/roadmap nəticələri (ən yenidən köhnəyə). Yalnız JWT ilə giriş
    etmiş istifadəçilər üçün əlçatandır.
    """

    serializer_class = UserAssessmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserAssessment.objects.filter(user=self.request.user).order_by(
            "-created_at"
        )
