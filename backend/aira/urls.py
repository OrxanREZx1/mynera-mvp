from django.urls import path

from .views import ChatView, GenerateRoadmapView, MyRoadmapView, ToggleLessonView

urlpatterns = [
    path("chat/", ChatView.as_view(), name="aira-chat"),
    path("generate-roadmap/", GenerateRoadmapView.as_view(), name="aira-generate-roadmap"),
    path("my-roadmap/", MyRoadmapView.as_view(), name="aira-my-roadmap"),
    path(
        "my-roadmap/lessons/<str:lesson_id>/toggle/",
        ToggleLessonView.as_view(),
        name="aira-toggle-lesson",
    ),
]
