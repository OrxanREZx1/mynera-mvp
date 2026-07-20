from django.conf import settings
from django.db import models


class Roadmap(models.Model):
    title = models.CharField(max_length=255)
    recommended_field = models.CharField(max_length=150, blank=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.title

    def ordered_lessons(self):
        """Return lessons in the same order in which the frontend renders them."""
        return [
            lesson
            for module in self.modules.all()
            for lesson in module.lessons.all()
        ]

    def progress_snapshot_for(self, user):
        """Calculate frontend progress and lock state for one user."""
        lesson_ids = [lesson.pk for lesson in self.ordered_lessons()]
        completed_ids = set()

        if user is not None and user.is_authenticated and lesson_ids:
            completed_ids = set(
                UserLessonProgress.objects.filter(
                    user=user,
                    lesson_id__in=lesson_ids,
                    is_completed=True,
                ).values_list("lesson_id", flat=True)
            )

        locked_ids = set()
        previous_lessons_completed = True
        for lesson_id in lesson_ids:
            is_completed = lesson_id in completed_ids
            if not previous_lessons_completed and not is_completed:
                locked_ids.add(lesson_id)
            if not is_completed:
                previous_lessons_completed = False

        total = len(lesson_ids)
        completed = len(completed_ids)
        return {
            "completed_ids": completed_ids,
            "locked_ids": locked_ids,
            "progress_percent": round(completed / total * 100) if total else 0,
            "completed_stages": completed,
            "total_stages": total,
        }


class Module(models.Model):
    roadmap = models.ForeignKey(
        Roadmap,
        on_delete=models.CASCADE,
        related_name="modules",
    )
    title = models.CharField(max_length=255)
    duration = models.CharField(max_length=100)
    order = models.IntegerField()

    class Meta:
        ordering = ["order", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["roadmap", "order"],
                name="unique_module_order_per_roadmap",
            )
        ]

    def __str__(self):
        return f"{self.roadmap}: {self.order}. {self.title}"


class Lesson(models.Model):
    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name="lessons",
    )
    title = models.CharField(max_length=255)
    order = models.IntegerField()

    class Meta:
        ordering = ["order", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["module", "order"],
                name="unique_lesson_order_per_module",
            )
        ]

    def __str__(self):
        return f"{self.module}: {self.order}. {self.title}"


class UserLessonProgress(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="lesson_progress",
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name="user_progress",
    )
    is_completed = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "lesson"],
                name="unique_lesson_progress_per_user",
            )
        ]

    def __str__(self):
        state = "completed" if self.is_completed else "incomplete"
        return f"{self.user} · {self.lesson} · {state}"
