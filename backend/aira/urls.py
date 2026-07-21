from django.urls import path

from .views import (
    ChatView,
    GenerateRoadmapView,
    GuestDiagnosticView,
    GuestRoadmapView,
    MyRoadmapView,
    ToggleGuestLessonView,
    ToggleLessonView,
)

urlpatterns = [
    path("chat/", ChatView.as_view(), name="aira-chat"),
    path("guest-onboarding/", GuestDiagnosticView.as_view(), name="aira-guest-onboarding"),
    path("guest-roadmap/", GuestRoadmapView.as_view(), name="aira-guest-roadmap"),
    path(
        "guest-roadmap/lessons/<str:lesson_id>/toggle/",
        ToggleGuestLessonView.as_view(),
        name="aira-toggle-guest-lesson",
    ),
    path("generate-roadmap/", GenerateRoadmapView.as_view(), name="aira-generate-roadmap"),
    path("my-roadmap/", MyRoadmapView.as_view(), name="aira-my-roadmap"),
    path(
        "my-roadmap/lessons/<str:lesson_id>/toggle/",
        ToggleLessonView.as_view(),
        name="aira-toggle-lesson",
    ),
]
