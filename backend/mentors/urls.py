from django.urls import path

from .views import (
    MentorDetailView,
    MentorListView,
    MentorRequestCreateView,
    MyMentorRequestsView,
)

urlpatterns = [
    path("", MentorListView.as_view(), name="mentor-list"),
    path("requests/", MentorRequestCreateView.as_view(), name="mentor-request-create"),
    path("my-requests/", MyMentorRequestsView.as_view(), name="mentor-my-requests"),
    path("<int:pk>/", MentorDetailView.as_view(), name="mentor-detail"),
]
