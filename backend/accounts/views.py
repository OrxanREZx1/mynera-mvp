import uuid

from django.conf import settings
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from analytics.events import EventName
from analytics.models import Event
from analytics.services import track_event
from aira.models import ChatMessageLog, GuestDiagnosticSession, RoadmapPlan
from career.models import UserAssessment
from payments.models import WillingnessToPay

from .serializers import (
    GoogleAuthSerializer,
    LoginSerializer,
    LogoutSerializer,
    RegisterSerializer,
    UserSerializer,
)
from .services import (
    GoogleAccountConflictError,
    GoogleProviderUnavailableError,
    GoogleSignInConfigurationError,
    InvalidGoogleCredentialError,
    get_or_create_google_user,
    verify_google_credential,
)


def _claim_anonymous_records(user, session_id):
    """
    İstifadəçi qeydiyyatdan keçməzdən/daxil olmazdan əvvəl anonim (session_id
    ilə) yaratdığı qeydlər varsa — assessment, willingness-to-pay VƏ analitik
    eventlər — onları həmin istifadəçiyə bağlayır. Bununla "Saving assessment
    ownership to users" və funnel analitikasının user-səviyyəsində bütövlüyü
    anonim → identifikasiya olunmuş keçid ssenarisi üçün də təmin olunur.
    """
    if not session_id:
        return 0
    try:
        session_uuid = uuid.UUID(str(session_id))
    except (ValueError, TypeError, AttributeError):
        return 0

    claimed = UserAssessment.objects.filter(
        session_id=session_uuid, user__isnull=True
    ).update(user=user)
    WillingnessToPay.objects.filter(
        session_id=session_uuid, user__isnull=True
    ).update(user=user)
    Event.objects.filter(session_id=session_uuid, user__isnull=True).update(user=user)
    ChatMessageLog.objects.filter(session_id=session_uuid, user__isnull=True).update(
        user=user, session_id=None
    )
    RoadmapPlan.objects.filter(session_id=session_uuid, user__isnull=True).update(
        user=user, session_id=None
    )
    GuestDiagnosticSession.objects.filter(session_id=session_uuid).delete()
    return claimed


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Qeydiyyat — uğurlu olduqda JWT access/refresh cütü birbaşa qaytarılır
    (istifadəçi ayrıca login etməyə ehtiyac duymur).

    Body-də istəyə bağlı `session_id` göndərilərsə, həmin session_id ilə
    əvvəl anonim yaradılmış UserAssessment qeydləri bu istifadəçiyə bağlanır.
    """

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        claimed = _claim_anonymous_records(user, request.data.get("session_id"))
        refresh = RefreshToken.for_user(user)

        track_event(
            EventName.SIGNUP_COMPLETED,
            request=request,
            user=user,
            metadata={"status": user.status, "it_level": user.it_level},
        )

        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
                "claimed_assessments": claimed,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Body: {"email": "...", "password": "...", "session_id": "<optional>"}
    JWT access/refresh cütü + istifadəçi profili qaytarır.
    """

    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tokens = serializer.validated_data
        user = serializer.user

        claimed = _claim_anonymous_records(user, request.data.get("session_id"))

        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": {
                    "access": str(tokens["access"]),
                    "refresh": str(tokens["refresh"]),
                },
                "claimed_assessments": claimed,
            },
            status=status.HTTP_200_OK,
        )


class GoogleAuthView(APIView):
    """POST /api/auth/google/ — verify a Google ID token and issue app JWTs."""

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth-google"

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            payload = verify_google_credential(
                data["credential"],
                settings.GOOGLE_OAUTH_CLIENT_ID,
            )
            user, created = get_or_create_google_user(
                payload,
                status=data.get("status", ""),
                it_level=data.get("it_level", ""),
            )
        except GoogleSignInConfigurationError as exc:
            return Response(
                {"code": "google_not_configured", "detail": str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except InvalidGoogleCredentialError as exc:
            return Response(
                {"code": "google_invalid_credential", "detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except GoogleProviderUnavailableError as exc:
            return Response(
                {"code": "google_provider_unavailable", "detail": str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except GoogleAccountConflictError as exc:
            return Response(
                {"code": "google_account_conflict", "detail": str(exc)},
                status=status.HTTP_409_CONFLICT,
            )

        claimed = _claim_anonymous_records(user, data.get("session_id"))
        refresh = RefreshToken.for_user(user)

        if created:
            track_event(
                EventName.SIGNUP_COMPLETED,
                request=request,
                user=user,
                metadata={
                    "provider": "google",
                    "status": user.status,
                    "it_level": user.it_level,
                },
            )

        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
                "claimed_assessments": claimed,
                "is_new_user": created,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Body: {"refresh": "<refresh_token>"}
    Refresh tokeni blacklist edir — access token öz müddəti bitənə qədər
    (qısa ömürlü olduğu üçün) etibarlı qalır, lakin refresh artıq yenilənə
    bilməz, beləliklə sessiya faktiki bağlanır.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.token

        token_user_id = token.payload.get(api_settings.USER_ID_CLAIM)
        if str(token_user_id) != str(request.user.pk):
            return Response(
                {"detail": "Bu refresh token cari istifadəçiyə aid deyil."},
                status=status.HTTP_403_FORBIDDEN,
            )

        token.blacklist()
        return Response({"detail": "Çıxış edildi."}, status=status.HTTP_205_RESET_CONTENT)


class MeView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/auth/me/ — cari doğrulanmış istifadəçinin profili (user identification).
    PATCH /api/auth/me/ — profili qismən yeniləmək.
    """

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
