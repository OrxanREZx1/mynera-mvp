from rest_framework import serializers

from .models import ChatMessageLog, RoadmapPlan


class ChatMessageLogSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = ChatMessageLog
        fields = ["id", "role", "content", "createdAt"]
        read_only_fields = fields


class ChatMessageInSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=["user", "assistant"])
    content = serializers.CharField()


class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(allow_blank=False, trim_whitespace=True)
    history = ChatMessageInSerializer(many=True, required=False, default=list)


class GenerateRoadmapRequestSerializer(serializers.Serializer):
    founder = serializers.CharField(allow_blank=True, required=False, default="")
    idea = serializers.CharField(allow_blank=True, required=False, default="")
    differentiation = serializers.CharField(allow_blank=True, required=False, default="")
    target = serializers.CharField(allow_blank=True, required=False, default="")
    resources = serializers.CharField(allow_blank=True, required=False, default="")


class RoadmapPlanSerializer(serializers.ModelSerializer):
    """
    Frontend-in Roadmap tipinə uyğun şəkil qaytarır. progressPercent və
    completedStages/totalStages heç vaxt qondarma deyil — birbaşa
    modules[].lessons[].completed-dən hesablanır.
    """

    progressPercent = serializers.SerializerMethodField()
    completedStages = serializers.SerializerMethodField()
    totalStages = serializers.SerializerMethodField()

    class Meta:
        model = RoadmapPlan
        fields = [
            "id",
            "title",
            "recommended_field",
            "modules",
            "progressPercent",
            "completedStages",
            "totalStages",
            "created_at",
        ]

    def get_completedStages(self, obj):
        return obj.completed_lessons()

    def get_totalStages(self, obj):
        return obj.total_lessons()

    def get_progressPercent(self, obj):
        total = obj.total_lessons()
        if not total:
            return 0
        return round(obj.completed_lessons() / total * 100)
