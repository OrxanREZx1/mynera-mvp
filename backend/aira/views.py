from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import ChatMessageLog, RoadmapPlan
from .serializers import (
    ChatMessageLogSerializer,
    ChatRequestSerializer,
    GenerateRoadmapRequestSerializer,
    RoadmapPlanSerializer,
)
from .services import AIServiceError, chat_reply, generate_roadmap


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


class GenerateRoadmapView(APIView):
    """
    POST /api/aira/generate-roadmap/
    Body: {"founder", "idea", "differentiation", "target", "resources"}
    Aira-nın 5 sualdan topladığı cavablara əsasən FƏRDİ roadmap yaradır və
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
