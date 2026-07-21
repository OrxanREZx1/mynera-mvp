from django.conf import settings
from django.db import models


class GuestDiagnosticSession(models.Model):
    """Anonymous three-question Aira onboarding, keyed by the browser session."""

    session_id = models.UUIDField(unique=True, db_index=True)
    status = models.CharField(max_length=120, blank=True, default="")
    it_level = models.CharField(max_length=120, blank=True, default="")
    goal = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    @property
    def next_step(self):
        if not self.status:
            return "status"
        if not self.it_level:
            return "it_level"
        if not self.goal:
            return "goal"
        return "complete"

    def __str__(self):
        return f"Guest diagnostic {self.session_id} ({self.next_step})"


class RoadmapPlan(models.Model):
    """
    Aira ilə söhbətdən sonra AI tərəfindən yaradılan, istifadəçiyə məxsus
    FƏRDİ roadmap. Hər istifadəçinin yalnız bir aktiv planı olur (yenisi
    yaradılanda köhnəsi əvəz olunmur, sadəcə ən yenisi "aktiv" sayılır —
    bax get_active_for_user).

    `modules` strukturu frontend-in Roadmap tipinə tam uyğundur:
    [
      {
        "id": "m1", "index": 1, "title": "...", "duration": "1-2 həftə",
        "lessons": [
          {"id": "m1-l1", "title": "...", "completed": false, "locked": false}
        ]
      }, ...
    ]
    Heç bir dərs başlanğıcda "completed": true kimi qondarma işarələnmir —
    tərəqqi yalnız istifadəçi öz LessonProgress qeydlərini yaratdıqca artır.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="roadmap_plans",
        null=True,
        blank=True,
    )
    session_id = models.UUIDField(null=True, blank=True, db_index=True)
    title = models.CharField(max_length=255)
    recommended_field = models.CharField(max_length=120, blank=True, default="")
    source_answers = models.JSONField(
        default=dict,
        help_text="Aira-nın fərdi roadmap qurmaq üçün istifadə etdiyi diaqnostik cavablar",
    )
    modules = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Roadmap planı"
        verbose_name_plural = "Roadmap planları"

    def __str__(self):
        owner = self.user or self.session_id
        return f"{self.title} — {owner}"

    @classmethod
    def get_active_for_user(cls, user):
        return cls.objects.filter(user=user, is_active=True).order_by("-created_at").first()

    @classmethod
    def get_active_for_session(cls, session_id):
        return (
            cls.objects.filter(user__isnull=True, session_id=session_id, is_active=True)
            .order_by("-created_at")
            .first()
        )

    def total_lessons(self):
        return sum(len(m.get("lessons", [])) for m in self.modules)

    def completed_lessons(self):
        return sum(
            1
            for m in self.modules
            for lesson in m.get("lessons", [])
            if lesson.get("completed")
        )

    def toggle_lesson(self, lesson_id: str):
        """Flip a single lesson's `completed` flag in place. Returns True if found."""
        for module in self.modules:
            for lesson in module.get("lessons", []):
                if lesson.get("id") == lesson_id:
                    lesson["completed"] = not lesson.get("completed", False)
                    return True
        return False


class ChatMessageLog(models.Model):
    """Aira ilə sərbəst (freeform) söhbətin tarixçəsi — audit və davamlılıq üçün."""

    ROLE_CHOICES = [("user", "user"), ("assistant", "assistant")]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="aira_messages",
        null=True,
        blank=True,
    )
    session_id = models.UUIDField(null=True, blank=True, db_index=True)
    role = models.CharField(max_length=16, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        verbose_name = "Aira mesajı"
        verbose_name_plural = "Aira mesajları"

    def __str__(self):
        return f"[{self.role}] {self.content[:50]}"
