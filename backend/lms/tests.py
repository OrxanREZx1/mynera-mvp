from rest_framework.test import APITestCase

from accounts.models import User

from .models import Lesson, Module, Roadmap, UserLessonProgress


class LmsApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="student@example.com",
            password="test-password-123",
            full_name="Test Student",
        )
        self.roadmap = Roadmap.objects.create(
            title="Backend Development",
            recommended_field="backend",
        )
        self.module = Module.objects.create(
            roadmap=self.roadmap,
            title="Foundations",
            duration="1-2 həftə",
            order=1,
        )
        self.lessons = [
            Lesson.objects.create(
                module=self.module,
                title=f"Lesson {order}",
                order=order,
            )
            for order in range(1, 5)
        ]
        self.client.force_authenticate(self.user)

    def test_my_roadmap_matches_frontend_contract(self):
        response = self.client.get("/api/lms/my-roadmap/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            list(response.data),
            [
                "id",
                "title",
                "recommended_field",
                "progressPercent",
                "completedStages",
                "totalStages",
                "modules",
            ],
        )
        self.assertEqual(response.data["id"], str(self.roadmap.pk))
        self.assertEqual(response.data["progressPercent"], 0)
        self.assertEqual(response.data["completedStages"], 0)
        self.assertEqual(response.data["totalStages"], 4)
        self.assertEqual(response.data["modules"][0]["id"], f"m{self.module.pk}")
        self.assertEqual(response.data["modules"][0]["index"], 1)
        self.assertEqual(
            response.data["modules"][0]["lessons"][0]["id"],
            f"l{self.lessons[0].pk}",
        )
        self.assertFalse(response.data["modules"][0]["lessons"][0]["locked"])
        self.assertTrue(response.data["modules"][0]["lessons"][1]["locked"])

    def test_toggle_lesson_updates_progress_and_unlocks_next_lesson(self):
        lesson = self.lessons[0]
        response = self.client.post(f"/api/lms/lessons/l{lesson.pk}/toggle/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["progressPercent"], 25)
        self.assertEqual(response.data["completedStages"], 1)
        self.assertTrue(response.data["modules"][0]["lessons"][0]["completed"])
        self.assertFalse(response.data["modules"][0]["lessons"][1]["locked"])
        self.assertTrue(
            UserLessonProgress.objects.get(user=self.user, lesson=lesson).is_completed
        )
