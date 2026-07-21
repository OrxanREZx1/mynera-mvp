import uuid

from django.db import transaction
from rest_framework import status
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import ChatMessageLog, GuestDiagnosticSession, RoadmapPlan
from .serializers import (
    ChatMessageLogSerializer,
    ChatRequestSerializer,
    GenerateRoadmapRequestSerializer,
    GuestDiagnosticAnswerSerializer,
    RoadmapPlanSerializer,
)
from .services import AIServiceError, chat_reply, generate_roadmap


GUEST_QUESTIONS = {
    "status": "Hazırkı vəziyyətiniz nədir? (Tələbə, İşləyən, İşsiz)",
    "it_level": "İT səviyyəniz nədir? (Senior, Middle, Junior, Təcrübəsiz)",
    "goal": "Məqsədiniz nədir?",
}


def _anonymous_session_id(request):
    """Return the stable UUID supplied by the shared frontend API client."""

    raw_session_id = request.headers.get("X-Session-Id", "")
    try:
        return uuid.UUID(str(raw_session_id))
    except (ValueError, TypeError, AttributeError) as exc:
        raise ValidationError(
            {"session_id": "Anonim demo sessiyası tapılmadı. Səhifəni yenilə və yenidən cəhd et."}
        ) from exc


def _guest_messages(session_id):
    return ChatMessageLog.objects.filter(
        user__isnull=True,
        session_id=session_id,
    ).order_by("created_at")


def _guest_response(session, *, message=None, roadmap=None):
    payload = {
        "step": session.next_step,
        "roadmap": RoadmapPlanSerializer(roadmap).data if roadmap else None,
    }
    if message is not None:
        payload.update(
            {
                "reply": message.content,
                "message": ChatMessageLogSerializer(message).data,
            }
        )
    else:
        payload["messages"] = ChatMessageLogSerializer(
            _guest_messages(session.session_id), many=True
        ).data
    return payload


class ChatView(APIView):
    """
    GET /api/aira/chat/
    Returns the authenticated user's latest 100 messages in chronological order.

    POST /api/aira/chat/
    Body: {"message": "...", "history": [{"role": "user"|"assistant", "content": "..."}]}
    Sərbəst Aira söhbəti — hər mesaj OpenAI-a real vaxtda göndərilir.
    Giriş tələb olunur, çünki tarixçə istifadəçiyə bağlı saxlanılır.
    """

    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "aira-chat"

    def get(self, request):
        latest_messages = list(
            ChatMessageLog.objects.filter(user=request.user).order_by("-created_at")[:100]
        )
        latest_messages.reverse()
        return Response(ChatMessageLogSerializer(latest_messages, many=True).data)

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.validated_data["message"]
        history = serializer.validated_data.get("history", [])

        ChatMessageLog.objects.create(user=request.user, role="user", content=message)

        openai_history = [{"role": h["role"], "content": h["content"]} for h in history]
        openai_history.append({"role": "user", "content": message})

        try:
            reply = chat_reply(openai_history)
        except AIServiceError as exc:
            return Response(
                {"error": "ai_service_error", "detail": str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        assistant_message = ChatMessageLog.objects.create(
            user=request.user,
            role="assistant",
            content=reply,
        )
        return Response(
            {
                "reply": reply,
                "message": ChatMessageLogSerializer(assistant_message).data,
            },
            status=status.HTTP_200_OK,
        )


class GuestDiagnosticView(APIView):
    """
    Registration-free Aira demo, isolated by ``X-Session-Id``.

    The first three replies are handled as a deterministic state machine so
    Aira always asks exactly one diagnostic question at a time. The third
    answer is sent to the real roadmap generator and persisted for this guest.
    """

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "aira-chat"

    def get(self, request):
        session_id = _anonymous_session_id(request)
        diagnostic, _ = GuestDiagnosticSession.objects.get_or_create(session_id=session_id)

        if not _guest_messages(session_id).exists():
            ChatMessageLog.objects.create(
                session_id=session_id,
                role="assistant",
                content=GUEST_QUESTIONS["status"],
            )

        roadmap = RoadmapPlan.get_active_for_session(session_id)
        return Response(_guest_response(diagnostic, roadmap=roadmap))

    def post(self, request):
        input_serializer = GuestDiagnosticAnswerSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        answer = input_serializer.validated_data["message"]
        session_id = _anonymous_session_id(request)
        diagnostic, _ = GuestDiagnosticSession.objects.get_or_create(session_id=session_id)

        if diagnostic.next_step == "status":
            diagnostic.status = answer
            diagnostic.save(update_fields=["status", "updated_at"])
            ChatMessageLog.objects.create(session_id=session_id, role="user", content=answer)
            assistant_message = ChatMessageLog.objects.create(
                session_id=session_id,
                role="assistant",
                content=GUEST_QUESTIONS["it_level"],
            )
            return Response(_guest_response(diagnostic, message=assistant_message))

        if diagnostic.next_step == "it_level":
            diagnostic.it_level = answer
            diagnostic.save(update_fields=["it_level", "updated_at"])
            ChatMessageLog.objects.create(session_id=session_id, role="user", content=answer)
            assistant_message = ChatMessageLog.objects.create(
                session_id=session_id,
                role="assistant",
                content=GUEST_QUESTIONS["goal"],
            )
            return Response(_guest_response(diagnostic, message=assistant_message))

        if diagnostic.next_step == "goal":
            answers = {
                "status": diagnostic.status,
                "it_level": diagnostic.it_level,
                "goal": answer,
            }
            try:
                result = generate_roadmap(answers)
            except AIServiceError as exc:
                return Response(
                    {"error": "ai_service_error", "detail": str(exc)},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

            with transaction.atomic():
                diagnostic.goal = answer
                diagnostic.save(update_fields=["goal", "updated_at"])
                ChatMessageLog.objects.create(session_id=session_id, role="user", content=answer)
                RoadmapPlan.objects.filter(
                    user__isnull=True, session_id=session_id, is_active=True
                ).update(is_active=False)
                roadmap = RoadmapPlan.objects.create(
                    session_id=session_id,
                    title=result["title"],
                    recommended_field=result["recommended_field"],
                    source_answers=answers,
                    modules=result["modules"],
                    is_active=True,
                )
                assistant_message = ChatMessageLog.objects.create(
                    session_id=session_id,
                    role="assistant",
                    content=(
                        f"Cavablarınıza əsasən “{roadmap.title}” adlı fərdi yol xəritənizi "
                        "hazırladım. İndi modullara və dərslərə baxa bilərsiniz."
                    ),
                )
            return Response(
                _guest_response(diagnostic, message=assistant_message, roadmap=roadmap),
                status=status.HTTP_201_CREATED,
            )

        # The diagnostic is complete. Keep the demo conversational without
        # forcing registration, while preserving session-scoped history.
        ChatMessageLog.objects.create(session_id=session_id, role="user", content=answer)
        history = [
            {"role": item.role, "content": item.content}
            for item in _guest_messages(session_id).order_by("created_at")
        ][-20:]
        try:
            reply = chat_reply(history)
        except AIServiceError as exc:
            return Response(
                {"error": "ai_service_error", "detail": str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        assistant_message = ChatMessageLog.objects.create(
            session_id=session_id,
            role="assistant",
            content=reply,
        )
        return Response(
            _guest_response(
                diagnostic,
                message=assistant_message,
                roadmap=RoadmapPlan.get_active_for_session(session_id),
            )
        )


class GuestRoadmapView(APIView):
    """Read or update the current anonymous visitor's generated roadmap."""

    permission_classes = [AllowAny]

    def get(self, request):
        session_id = _anonymous_session_id(request)
        roadmap = RoadmapPlan.get_active_for_session(session_id)
        if roadmap is None:
            raise NotFound("Hələ heç bir demo roadmap yaradılmayıb.")
        return Response(RoadmapPlanSerializer(roadmap).data)


class ToggleGuestLessonView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, lesson_id):
        session_id = _anonymous_session_id(request)
        roadmap = RoadmapPlan.get_active_for_session(session_id)
        if roadmap is None:
            raise NotFound("Hələ heç bir demo roadmap yaradılmayıb.")
        if not roadmap.toggle_lesson(lesson_id):
            raise NotFound("Dərs tapılmadı.")
        roadmap.save(update_fields=["modules"])
        return Response(RoadmapPlanSerializer(roadmap).data)


class GenerateRoadmapView(APIView):
    """
    POST /api/aira/generate-roadmap/
    Body: istifadəçinin diaqnostik cavabları.
    Aira-nın topladığı cavablara əsasən FƏRDİ roadmap yaradır və
    istifadəçinin aktiv planı kimi saxlayır (əvvəlki planlar deaktiv olunur).
    """

    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "aira-generate-roadmap"

    def post(self, request):
        serializer = GenerateRoadmapRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        answers = serializer.validated_data

        try:
            result = generate_roadmap(answers)
        except AIServiceError as exc:
            return Response(
                {"error": "ai_service_error", "detail": str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        RoadmapPlan.objects.filter(user=request.user, is_active=True).update(is_active=False)
        plan = RoadmapPlan.objects.create(
            user=request.user,
            title=result["title"],
            recommended_field=result["recommended_field"],
            source_answers=answers,
            modules=result["modules"],
            is_active=True,
        )
        return Response(RoadmapPlanSerializer(plan).data, status=status.HTTP_201_CREATED)


class MyRoadmapView(APIView):
    """
    GET /api/aira/my-roadmap/
    İstifadəçinin aktiv roadmap planını qaytarır. Heç bir plan yoxdursa 404
    qaytarılır — frontend bunu "hələ roadmap seçilməyib" boş vəziyyəti kimi
    göstərməlidir, HEÇ VAXT qondarma faiz/mərhələ ilə doldurmamalıdır.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        plan = RoadmapPlan.get_active_for_user(request.user)
        if plan is None:
            raise NotFound("Hələ heç bir roadmap yaradılmayıb.")
        return Response(RoadmapPlanSerializer(plan).data)


class ToggleLessonView(APIView):
    """POST /api/aira/my-roadmap/lessons/<lesson_id>/toggle/"""

    permission_classes = [IsAuthenticated]

    def post(self, request, lesson_id):
        plan = RoadmapPlan.get_active_for_user(request.user)
        if plan is None:
            raise NotFound("Hələ heç bir roadmap yaradılmayıb.")
        found = plan.toggle_lesson(lesson_id)
        if not found:
            raise NotFound("Dərs tapılmadı.")
        plan.save(update_fields=["modules"])
        return Response(RoadmapPlanSerializer(plan).data)
