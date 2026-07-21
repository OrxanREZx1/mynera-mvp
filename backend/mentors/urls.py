from django.urls import path
from rest_framework.routers import SimpleRouter

from .views import (
    MentorDetailView,
    MentorApplicationViewSet,
    MentorListView,
    MentorRequestCreateView,
    MyMentorRequestsView,
)

router = SimpleRouter()
router.register("applications", MentorApplicationViewSet, basename="mentor-application")

urlpatterns = [
    path("", MentorListView.as_view(), name="mentor-list"),
    path("requests/", MentorRequestCreateView.as_view(), name="mentor-request-create"),
    path("my-requests/", MyMentorRequestsView.as_view(), name="mentor-my-requests"),
    path("<int:pk>/", MentorDetailView.as_view(), name="mentor-detail"),
] + router.urls
