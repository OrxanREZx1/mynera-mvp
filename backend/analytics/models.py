"""
Sprint 1 — Part B: miqyaslana bilən analitik event sistemi.

Hər bir istifadəçi davranışı (səhifə baxışı, klik, funnel addımı) tək
`Event` cədvəlində saxlanılır. Sorğu performansı üçün ən çox filtrlənən
sahələr (event_name, session_id, timestamp) indekslənib.
"""
import uuid

from django.conf import settings
from django.db import models

from .events import EventName


class Event(models.Model):
    """Tək analitik event qeydi (append-only — heç vaxt yenilənmir)."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="events",
        help_text="Doğrulanmış istifadəçidirsə bağlanır; anonim eventlərdə boşdur.",
    )
    session_id = models.UUIDField(
        null=True,
        blank=True,
        db_index=True,
        help_text="Anonim istifadəçini funnel boyunca izləmək üçün frontend session UUID-i.",
    )
    event_name = models.CharField(
        max_length=64, choices=EventName.choices, db_index=True
    )
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text='Əlavə kontekst, məs: {"selected_plan": "30_days", "source": "server"}',
    )
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-timestamp"]
        verbose_name = "Event"
        verbose_name_plural = "Events"
        indexes = [
            models.Index(fields=["event_name", "timestamp"]),
        ]

    def __str__(self):
        who = self.user or self.session_id or "anon"
        return f"{self.event_name} · {who} · {self.timestamp:%Y-%m-%d %H:%M:%S}"
