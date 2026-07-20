from django.db import transaction
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Lesson, Module, Roadmap, UserLessonProgress
from .serializers import RoadmapSerializer


def _roadmap_queryset():
    lesson_queryset = Lesson.objects.order_by("order", "id")
    module_queryset = Module.objects.order_by("order", "id").prefetch_related(
        Prefetch("lessons", queryset=lesson_queryset)
    )
    return Roadmap.objects.order_by("id").prefetch_related(
        Prefetch("modules", queryset=module_queryset)
    )


def _first_roadmap():
    roadmap = _roadmap_queryset().first()
    if roadmap is None:
        raise NotFound("Hələ heç bir roadmap yaradılmayıb.")
    return roadmap


def _lesson_pk(lesson_id):
    value = str(lesson_id)
    if value.lower().startswith("l"):
        value = value[1:]
    try:
        return int(value)
    except (TypeError, ValueError) as exc:
        raise NotFound("Dərs tapılmadı.") from exc


class MyRoadmapView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        roadmap = _first_roadmap()
        return Response(RoadmapSerializer(roadmap, context={"request": request}).data)


class ToggleLessonView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, lesson_id):
        roadmap = _first_roadmap()
        lesson = get_object_or_404(
            Lesson.objects.select_related("module__roadmap"),
            pk=_lesson_pk(lesson_id),
            module__roadmap=roadmap,
        )

        progress, _ = UserLessonProgress.objects.select_for_update().get_or_create(
            user=request.user,
            lesson=lesson,
        )
        progress.is_completed = not progress.is_completed
        progress.save(update_fields=["is_completed"])

        updated_roadmap = _first_roadmap()
        serializer = RoadmapSerializer(
            updated_roadmap,
            context={"request": request},
        )
        return Response(serializer.data)
