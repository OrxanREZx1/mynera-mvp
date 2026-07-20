from django.urls import path

from .views import (
    AssessmentResultView,
    MyAssessmentsView,
    QuestionListView,
    SubmitAnswersView,
)

urlpatterns = [
    path("questions/", QuestionListView.as_view(), name="question-list"),
    path("submit-answers/", SubmitAnswersView.as_view(), name="submit-answers"),
    path(
        "assessments/<uuid:session_id>/",
        AssessmentResultView.as_view(),
        name="assessment-result",
    ),
    path("my-assessments/", MyAssessmentsView.as_view(), name="my-assessments"),
]
