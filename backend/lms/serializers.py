from rest_framework import serializers

from .models import Lesson, Module, Roadmap


class LessonSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    completed = serializers.SerializerMethodField()
    locked = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ["id", "title", "completed", "locked"]

    def get_id(self, obj):
        return f"l{obj.pk}"

    def get_completed(self, obj):
        return obj.pk in self.context.get("completed_lesson_ids", set())

    def get_locked(self, obj):
        return obj.pk in self.context.get("locked_lesson_ids", set())


class ModuleSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    index = serializers.IntegerField(source="order", read_only=True)
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ["id", "index", "title", "duration", "lessons"]

    def get_id(self, obj):
        return f"m{obj.pk}"


class RoadmapSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    progressPercent = serializers.SerializerMethodField()
    completedStages = serializers.SerializerMethodField()
    totalStages = serializers.SerializerMethodField()
    modules = serializers.SerializerMethodField()

    class Meta:
        model = Roadmap
        fields = [
            "id",
            "title",
            "recommended_field",
            "progressPercent",
            "completedStages",
            "totalStages",
            "modules",
        ]

    def get_id(self, obj):
        return str(obj.pk)

    def _progress_snapshot(self, obj):
        cache = getattr(self, "_progress_cache", {})
        if obj.pk not in cache:
            request = self.context.get("request")
            user = getattr(request, "user", None)
            cache[obj.pk] = obj.progress_snapshot_for(user)
            self._progress_cache = cache
        return cache[obj.pk]

    def get_progressPercent(self, obj):
        return self._progress_snapshot(obj)["progress_percent"]

    def get_completedStages(self, obj):
        return self._progress_snapshot(obj)["completed_stages"]

    def get_totalStages(self, obj):
        return self._progress_snapshot(obj)["total_stages"]

    def get_modules(self, obj):
        snapshot = self._progress_snapshot(obj)
        context = {
            **self.context,
            "completed_lesson_ids": snapshot["completed_ids"],
            "locked_lesson_ids": snapshot["locked_ids"],
        }
        return ModuleSerializer(obj.modules.all(), many=True, context=context).data
