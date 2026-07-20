from django.db.models import Avg, Count
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from analytics.events import EventName
from analytics.services import track_event

from .models import Mentor, MentorRequest
from .serializers import MentorRequestSerializer, MentorSerializer


def marketplace_mentor_queryset():
    return (
        Mentor.objects.filter(active=True)
        .prefetch_related("tags", "skills")
        .annotate(
            average_rating=Avg("reviews__rating"),
            review_count=Count("reviews", distinct=True),
        )
    )


class MentorListView(generics.ListAPIView):
    """
    GET /api/mentors/ — aktiv mentor kartları (mentor səhifəsi).
    Səhifə açılışında frontend datanı buradan çəkdiyi üçün
    `mentor_page_viewed` eventi avtomatik loglanır.
    """

    serializer_class = MentorSerializer
    permission_classes = [AllowAny]
    queryset = Mentor.objects.filter(active=True)

    def get_queryset(self):
        queryset = marketplace_mentor_queryset()
        category = self.request.query_params.get("category")
        if category and category != "all":
            queryset = queryset.filter(category=category)
        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        track_event(EventName.MENTOR_PAGE_VIEWED, request=request)
        return response


class MentorDetailView(generics.RetrieveAPIView):
    """GET /api/mentors/<id>/ — bir mentorun detalları."""

    serializer_class = MentorSerializer
    permission_classes = [AllowAny]
    queryset = marketplace_mentor_queryset()


class MentorRequestCreateView(generics.CreateAPIView):
    """
    POST /api/mentors/requests/ — "Request mentor help" formasının göndərilməsi.
    Anonim istifadəçilər də göndərə bilər (contact_info məcburidir).
    `mentor_request_submitted` eventi avtomatik loglanır.
    """

    serializer_class = MentorRequestSerializer
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "mentor-request"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mentor_request = serializer.save()

        track_event(
            EventName.MENTOR_REQUEST_SUBMITTED,
            request=request,
            metadata={
                "mentor_request_id": mentor_request.id,
                "mentor_id": mentor_request.mentor_id,
                "preferred_format": mentor_request.preferred_format,
                "willingness_to_pay": mentor_request.willingness_to_pay,
                "recommended_it_branch": mentor_request.recommended_it_branch,
            },
        )
        return Response(
            self.get_serializer(mentor_request).data, status=status.HTTP_201_CREATED
        )


class MyMentorRequestsView(generics.ListAPIView):
    """GET /api/mentors/my-requests/ — doğrulanmış istifadəçinin sorğu tarixçəsi."""

    serializer_class = MentorRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MentorRequest.objects.filter(user=self.request.user).select_related(
            "mentor"
        )
