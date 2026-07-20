from rest_framework import serializers

from .models import Choice, Question, UserAssessment


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        # score_weights qəsdən gizlədilir (scoring internals frontendə getmir)
        fields = ["id", "text"]


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ["id", "text", "order", "choices"]


class SubmitAnswersSerializer(serializers.Serializer):
    session_id = serializers.UUIDField(required=False)
    answers = serializers.DictField(
        child=serializers.IntegerField(),
        help_text='{"<question_id>": <choice_id>}',
    )

    def validate_answers(self, value):
        if not value:
            raise serializers.ValidationError("Ən azı bir cavab tələb olunur.")
        return value


class UserAssessmentSerializer(serializers.ModelSerializer):
    """
    Doğrulanmış istifadəçinin öz nəticə tarixçəsini görməsi üçün
    (GET /api/my-assessments/). raw_answers qəsdən gizlədilir — scoring
    internals frontendə getmir (QuestionSerializer-dəki eyni qayda).
    """

    class Meta:
        model = UserAssessment
        fields = ["id", "session_id", "final_result", "created_at"]
        read_only_fields = fields