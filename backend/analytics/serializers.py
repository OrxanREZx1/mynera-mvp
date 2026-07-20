from rest_framework import serializers

from .events import CLIENT_TRACKABLE_EVENTS, EventName, SERVER_AUTHORITATIVE_EVENTS
from .models import Event


class TrackEventSerializer(serializers.Serializer):
    """
    POST /api/analytics/track/ — frontend-in göndərdiyi səhifə-baxışı /
    klik eventləri. Server tərəfdə avtomatik loglanan eventlər buradan
    qəbul edilmir (dublikat qarşısı).
    """

    event_name = serializers.ChoiceField(choices=EventName.choices)
    session_id = serializers.UUIDField(required=False, allow_null=True)
    metadata = serializers.DictField(required=False, default=dict)

    def validate_event_name(self, value):
        if value in SERVER_AUTHORITATIVE_EVENTS:
            raise serializers.ValidationError(
                "Bu event server tərəfindən avtomatik loglanır — frontend göndərməməlidir."
            )
        if value not in CLIENT_TRACKABLE_EVENTS:
            raise serializers.ValidationError("Naməlum və ya icazə verilməyən event adı.")
        return value

    def validate_metadata(self, value):
        # Sadə DoS/şişirtmə qorunması — metadata həcmini məhdudlaşdırırıq.
        if len(str(value)) > 2000:
            raise serializers.ValidationError("metadata çox böyükdür (maks ~2000 simvol).")
        return value


class EventSerializer(serializers.ModelSerializer):
    """Admin siyahı endpointi üçün (yalnız staff)."""

    user_email = serializers.EmailField(source="user.email", read_only=True, default=None)

    class Meta:
        model = Event
        fields = ["id", "event_name", "user", "user_email", "session_id", "metadata", "timestamp"]
        read_only_fields = fields
