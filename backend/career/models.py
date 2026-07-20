import uuid

from django.conf import settings
from django.db import models


class Question(models.Model):
    """Test sualları."""
    text = models.TextField(help_text="Sualın tam mətni")
    order = models.PositiveIntegerField(default=0, help_text="Göstərilmə sırası")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Sual"
        verbose_name_plural = "Suallar"

    def __str__(self):
        return f"[{self.order}] {self.text[:60]}"


class Choice(models.Model):
    """Sualın cavab variantları."""
    question = models.ForeignKey(
        Question, related_name="choices", on_delete=models.CASCADE
    )
    text = models.CharField(max_length=500)
    # Məs: {"Backend": 2, "Frontend": 0, "Data": 1}
    score_weights = models.JSONField(
        default=dict,
        help_text='Çəkilər, məs: {"Backend": 2, "Frontend": 0, "Data": 1}',
    )

    class Meta:
        verbose_name = "Variant"
        verbose_name_plural = "Variantlar"

    def __str__(self):
        return f"{self.text[:50]} → {self.score_weights}"


class UserAssessment(models.Model):
    """İstifadəçinin keçdiyi test və AI nəticəsi."""
    session_id = models.UUIDField(default=uuid.uuid4, editable=False, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assessments",
    )
    raw_answers = models.JSONField(
        default=dict, help_text='{"<question_id>": <choice_id>}'
    )
    final_result = models.JSONField(
        null=True, blank=True, help_text="Aurora-nın yekun analizi"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "İstifadəçi Testi"
        verbose_name_plural = "İstifadəçi Testləri"

    def __str__(self):
        return f"Assessment {self.session_id} @ {self.created_at:%Y-%m-%d %H:%M}"