from django.urls import path

from .views import DashboardMetricsView, EventCountsView, EventListView, TrackEventView

urlpatterns = [
    path("track/", TrackEventView.as_view(), name="analytics-track"),
    path("dashboard/", DashboardMetricsView.as_view(), name="analytics-dashboard"),
    path("events/", EventListView.as_view(), name="analytics-event-list"),
    path("events/summary/", EventCountsView.as_view(), name="analytics-event-summary"),
]
