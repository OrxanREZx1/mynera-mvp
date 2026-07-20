from django.urls import path

from .views import MyRoadmapView, ToggleLessonView


urlpatterns = [
    path("my-roadmap/", MyRoadmapView.as_view(), name="lms-my-roadmap"),
    path(
        "lessons/<str:lesson_id>/toggle/",
        ToggleLessonView.as_view(),
        name="lms-toggle-lesson",
    ),
]
