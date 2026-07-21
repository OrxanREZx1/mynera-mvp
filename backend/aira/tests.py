import uuid
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase
from rest_framework import status
from rest_framework.test import APITestCase

from .models import ChatMessageLog, GuestDiagnosticSession, RoadmapPlan
from .services import (
    AIRA_CHAT_SYSTEM_PROMPT,
    ROADMAP_SYSTEM_PROMPT,
    AIServiceError,
    _validated_roadmap_payload,
)


class AiraPromptContractTests(SimpleTestCase):
    def test_chat_prompt_requires_one_question_at_a_time_before_advice(self):
        self.assertIn("dərhal məsləhət VERMƏ", AIRA_CHAT_SYSTEM_PROMPT)
        self.assertIn("hər mesajda yalnız birini soruş", AIRA_CHAT_SYSTEM_PROMPT)
        self.assertIn("Hazırkı vəziyyətiniz", AIRA_CHAT_SYSTEM_PROMPT)
        self.assertIn("İT səviyyəniz", AIRA_CHAT_SYSTEM_PROMPT)
        self.assertIn("Məqsədiniz nədir?", AIRA_CHAT_SYSTEM_PROMPT)

    def test_roadmap_prompt_requires_investor_demo_depth(self):
        self.assertIn("Tam olaraq 4 və ya 5 modul", ROADMAP_SYSTEM_PROMPT)
        self.assertIn("Hər modulda tam olaraq 4 və ya 5 dərs", ROADMAP_SYSTEM_PROMPT)
        self.assertIn("yüksək peşəkarlıq səviyyəsində", ROADMAP_SYSTEM_PROMPT)


class AiraRoadmapPayloadValidationTests(SimpleTestCase):
    @staticmethod
    def valid_payload(module_count=4, lesson_count=4):
        return {
            "title": "Frontend Engineering yol xəritəsi",
            "recommended_field": "Frontend Engineering",
            "modules": [
                {
                    "title": f"Modul {module_index}",
                    "duration": "1-2 həftə",
                    "lessons": [
                        f"Peşəkar dərs {module_index}.{lesson_index}"
                        for lesson_index in range(1, lesson_count + 1)
                    ],
                }
                for module_index in range(1, module_count + 1)
            ],
        }

    def test_accepts_and_normalizes_four_by_four_roadmap(self):
        result = _validated_roadmap_payload(self.valid_payload())

        self.assertEqual(len(result["modules"]), 4)
        self.assertEqual(len(result["modules"][0]["lessons"]), 4)
        self.assertEqual(result["modules"][0]["lessons"][0]["id"], "m1-l1")
        self.assertFalse(result["modules"][0]["lessons"][0]["completed"])

    def test_rejects_wrong_module_or_lesson_counts(self):
        with self.assertRaises(AIServiceError):
            _validated_roadmap_payload(self.valid_payload(module_count=3))
        with self.assertRaises(AIServiceError):
            _validated_roadmap_payload(self.valid_payload(lesson_count=6))

    def test_rejects_malformed_model_items(self):
        payload = self.valid_payload()
        payload["modules"][0] = "not-an-object"

        with self.assertRaises(AIServiceError):
            _validated_roadmap_payload(payload)


class ChatViewTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="aira-test@mynera.az",
            password="test-password-123",
            full_name="Aira Test",
        )
        self.client.force_authenticate(self.user)

    def test_get_returns_only_authenticated_users_history(self):
        other_user = get_user_model().objects.create_user(
            email="other@mynera.az",
            password="test-password-123",
            full_name="Other User",
        )
        ChatMessageLog.objects.create(user=self.user, role="user", content="Salam")
        ChatMessageLog.objects.create(user=self.user, role="assistant", content="Salam!")
        ChatMessageLog.objects.create(user=other_user, role="user", content="Gizli mesaj")

        response = self.client.get("/api/aira/chat/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([message["content"] for message in response.data], ["Salam", "Salam!"])
        self.assertIn("createdAt", response.data[0])

    @patch("aira.views.chat_reply", return_value="Backend-dən real AI cavabı")
    def test_post_persists_both_messages_and_returns_assistant_message(self, chat_reply_mock):
        response = self.client.post(
            "/api/aira/chat/",
            {
                "message": "Backend öyrənmək istəyirəm",
                "history": [{"role": "assistant", "content": "Nə öyrənmək istəyirsən?"}],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["reply"], "Backend-dən real AI cavabı")
        self.assertEqual(response.data["message"]["role"], "assistant")
        self.assertEqual(ChatMessageLog.objects.filter(user=self.user).count(), 2)
        chat_reply_mock.assert_called_once()


class GuestDiagnosticViewTests(APITestCase):
    def setUp(self):
        self.session_id = uuid.uuid4()
        self.client.credentials(HTTP_X_SESSION_ID=str(self.session_id))

    def test_get_starts_with_exact_status_question_and_is_session_scoped(self):
        response = self.client.get("/api/aira/guest-onboarding/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["step"], "status")
        self.assertEqual(
            response.data["messages"][0]["content"],
            "Hazırkı vəziyyətiniz nədir? (Tələbə, İşləyən, İşsiz)",
        )
        message = ChatMessageLog.objects.get(session_id=self.session_id)
        self.assertIsNone(message.user)

        other_client = self.client_class()
        other_client.credentials(HTTP_X_SESSION_ID=str(uuid.uuid4()))
        other_response = other_client.get("/api/aira/guest-onboarding/")
        self.assertEqual(len(other_response.data["messages"]), 1)

    def test_missing_session_header_is_rejected(self):
        self.client.credentials()
        response = self.client.get("/api/aira/guest-onboarding/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("aira.views.generate_roadmap")
    def test_three_answers_generate_dynamic_guest_roadmap(self, generate_roadmap_mock):
        generate_roadmap_mock.return_value = {
            "title": "Frontend Engineering yol xəritəsi",
            "recommended_field": "Frontend Engineering",
            "modules": [
                {
                    "id": "m1",
                    "index": 1,
                    "title": "Veb əsasları",
                    "duration": "1 həftə",
                    "lessons": [
                        {
                            "id": "m1-l1",
                            "title": "Semantik HTML",
                            "completed": False,
                            "locked": False,
                        }
                    ],
                }
            ],
        }
        self.client.get("/api/aira/guest-onboarding/")

        status_response = self.client.post(
            "/api/aira/guest-onboarding/", {"message": "İşləyən"}, format="json"
        )
        self.assertEqual(status_response.data["step"], "it_level")
        self.assertEqual(
            status_response.data["message"]["content"],
            "İT səviyyəniz nədir? (Senior, Middle, Junior, Təcrübəsiz)",
        )

        level_response = self.client.post(
            "/api/aira/guest-onboarding/", {"message": "Junior"}, format="json"
        )
        self.assertEqual(level_response.data["step"], "goal")
        self.assertEqual(level_response.data["message"]["content"], "Məqsədiniz nədir?")

        goal_response = self.client.post(
            "/api/aira/guest-onboarding/",
            {"message": "Frontend developer olmaq istəyirəm"},
            format="json",
        )

        self.assertEqual(goal_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(goal_response.data["step"], "complete")
        self.assertEqual(goal_response.data["roadmap"]["title"], "Frontend Engineering yol xəritəsi")
        generate_roadmap_mock.assert_called_once_with(
            {
                "status": "İşləyən",
                "it_level": "Junior",
                "goal": "Frontend developer olmaq istəyirəm",
            }
        )

        diagnostic = GuestDiagnosticSession.objects.get(session_id=self.session_id)
        self.assertEqual(diagnostic.goal, "Frontend developer olmaq istəyirəm")
        roadmap = RoadmapPlan.get_active_for_session(self.session_id)
        self.assertIsNotNone(roadmap)
        self.assertIsNone(roadmap.user)

        roadmap_response = self.client.get("/api/aira/guest-roadmap/")
        self.assertEqual(roadmap_response.status_code, status.HTTP_200_OK)
        toggle_response = self.client.post(
            "/api/aira/guest-roadmap/lessons/m1-l1/toggle/", format="json"
        )
        self.assertTrue(toggle_response.data["modules"][0]["lessons"][0]["completed"])

    def test_registration_claims_guest_chat_and_roadmap_without_leaking_session_id(self):
        ChatMessageLog.objects.create(
            session_id=self.session_id,
            role="assistant",
            content="Demo mesajı",
        )
        RoadmapPlan.objects.create(
            session_id=self.session_id,
            title="Dinamik roadmap",
            recommended_field="QA Engineering",
            source_answers={"goal": "QA olmaq"},
            modules=[],
        )
        GuestDiagnosticSession.objects.create(session_id=self.session_id, status="Tələbə")

        response = self.client.post(
            "/api/auth/register/",
            {
                "email": "guest-claim@mynera.az",
                "password": "Strong-demo-pass-2026!",
                "password2": "Strong-demo-pass-2026!",
                "full_name": "Guest Claim",
                "status": "university_student",
                "it_level": "know_basics",
                "session_id": str(self.session_id),
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        claimed_message = ChatMessageLog.objects.get(content="Demo mesajı")
        claimed_roadmap = RoadmapPlan.objects.get(title="Dinamik roadmap")
        self.assertEqual(claimed_message.user.email, "guest-claim@mynera.az")
        self.assertEqual(claimed_roadmap.user, claimed_message.user)
        self.assertIsNone(claimed_message.session_id)
        self.assertIsNone(claimed_roadmap.session_id)
        self.assertFalse(GuestDiagnosticSession.objects.filter(session_id=self.session_id).exists())
