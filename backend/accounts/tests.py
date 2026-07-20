import uuid
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from analytics.events import EventName
from analytics.models import Event


@override_settings(GOOGLE_OAUTH_CLIENT_ID="web-client.apps.googleusercontent.com")
class GoogleAuthViewTests(APITestCase):
    endpoint = "/api/auth/google/"

    def google_payload(self, **overrides):
        payload = {
            "sub": "google-user-123",
            "email": "visitor@gmail.com",
            "email_verified": True,
            "name": "Stand Visitor",
            "picture": "https://lh3.googleusercontent.com/avatar/photo.jpg",
            "iss": "https://accounts.google.com",
            "aud": "web-client.apps.googleusercontent.com",
        }
        payload.update(overrides)
        return payload

    @patch("accounts.services.id_token.verify_oauth2_token")
    def test_google_signup_creates_user_claims_session_and_returns_jwt(self, verify):
        verify.return_value = self.google_payload()
        session_id = uuid.uuid4()
        anonymous_event = Event.objects.create(
            session_id=session_id,
            event_name=EventName.LANDING_PAGE_VIEWED,
        )

        response = self.client.post(
            self.endpoint,
            {
                "credential": "signed-google-id-token",
                "session_id": str(session_id),
                "status": "university_student",
                "it_level": "know_basics",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["is_new_user"])
        self.assertIn("access", response.data["tokens"])
        self.assertIn("refresh", response.data["tokens"])

        user = get_user_model().objects.get(email="visitor@gmail.com")
        self.assertEqual(user.google_sub, "google-user-123")
        self.assertEqual(user.status, "university_student")
        self.assertEqual(user.it_level, "know_basics")
        self.assertEqual(response.data["user"]["avatar_url"], self.google_payload()["picture"])
        self.assertFalse(user.has_usable_password())

        anonymous_event.refresh_from_db()
        self.assertEqual(anonymous_event.user, user)
        verify.assert_called_once()
        self.assertEqual(verify.call_args.args[0], "signed-google-id-token")
        self.assertEqual(verify.call_args.args[2], "web-client.apps.googleusercontent.com")

    @patch("accounts.services.id_token.verify_oauth2_token")
    def test_google_signin_links_an_existing_verified_email_without_duplicate(self, verify):
        user = get_user_model().objects.create_user(
            email="visitor@gmail.com",
            password="existing-password-123",
            full_name="Existing Visitor",
        )
        verify.return_value = self.google_payload()

        response = self.client.post(
            self.endpoint,
            {"credential": "signed-google-id-token"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["is_new_user"])
        self.assertEqual(get_user_model().objects.count(), 1)
        user.refresh_from_db()
        self.assertEqual(user.google_sub, "google-user-123")
        self.assertTrue(user.check_password("existing-password-123"))

    @patch("accounts.services.id_token.verify_oauth2_token", side_effect=ValueError)
    def test_rejects_an_invalid_google_token(self, _verify):
        response = self.client.post(
            self.endpoint,
            {"credential": "invalid-token"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["code"], "google_invalid_credential")
        self.assertFalse(get_user_model().objects.exists())

    @patch("accounts.services.id_token.verify_oauth2_token")
    def test_rejects_an_unverified_google_email(self, verify):
        verify.return_value = self.google_payload(email_verified=False)

        response = self.client.post(
            self.endpoint,
            {"credential": "signed-google-id-token"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(get_user_model().objects.exists())

    @patch("accounts.services.id_token.verify_oauth2_token")
    def test_rejects_email_already_linked_to_another_google_account(self, verify):
        get_user_model().objects.create_user(
            email="visitor@gmail.com",
            password=None,
            full_name="Existing Visitor",
            google_sub="different-google-user",
        )
        verify.return_value = self.google_payload()

        response = self.client.post(
            self.endpoint,
            {"credential": "signed-google-id-token"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.data["code"], "google_account_conflict")


class GoogleAuthConfigurationTests(APITestCase):
    @override_settings(GOOGLE_OAUTH_CLIENT_ID="")
    def test_missing_server_client_id_returns_service_unavailable(self):
        response = self.client.post(
            "/api/auth/google/",
            {"credential": "signed-google-id-token"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertEqual(response.data["code"], "google_not_configured")


class RegistrationTests(APITestCase):
    endpoint = "/api/auth/register/"

    def valid_payload(self, **overrides):
        payload = {
            "email": "fresh.visitor@example.com",
            "full_name": "Fresh Visitor",
            "status": "university_student",
            "it_level": "know_basics",
            "password": "StandDemo!2026",
            "password2": "StandDemo!2026",
        }
        payload.update(overrides)
        return payload

    def test_registration_returns_jwt_and_claims_anonymous_session(self):
        session_id = uuid.uuid4()
        anonymous_event = Event.objects.create(
            session_id=session_id,
            event_name=EventName.LANDING_PAGE_VIEWED,
        )
        payload = self.valid_payload(session_id=str(session_id))

        response = self.client.post(self.endpoint, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data["tokens"])
        self.assertIn("refresh", response.data["tokens"])
        anonymous_event.refresh_from_db()
        self.assertEqual(anonymous_event.user.email, payload["email"])

    def test_duplicate_email_returns_clear_validation_message(self):
        get_user_model().objects.create_user(
            email="fresh.visitor@example.com",
            password="StandDemo!2026",
        )

        response = self.client.post(self.endpoint, self.valid_payload(), format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["email"][0], "Bu email artıq qeydiyyatdan keçib.")

    def test_common_password_returns_clear_validation_message(self):
        response = self.client.post(
            self.endpoint,
            self.valid_payload(password="password123", password2="password123"),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["password"][0],
            "Bu şifrə çox geniş istifadə olunur. Daha güclü şifrə seç.",
        )
