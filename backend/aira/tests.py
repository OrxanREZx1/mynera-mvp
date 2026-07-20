from unittest.mock import patch

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import ChatMessageLog


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
