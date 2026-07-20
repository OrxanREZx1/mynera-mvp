from decimal import Decimal
import uuid

from rest_framework.test import APITestCase

from analytics.events import EventName
from analytics.models import Event

from .models import Mentor, Review, Tag


class MentorMarketplaceApiTests(APITestCase):
    def setUp(self):
        self.mentor = Mentor.objects.create(
            name="Cahan Abdullazadə",
            expertise="Product Design",
            title="UX/UI Designer",
            company="Mynera",
            avatar_url="https://example.com/avatar.jpg",
            cover_url="https://example.com/cover.jpg",
            country="Azərbaycan",
            country_flag="🇦🇿",
            price=Decimal("100.00"),
            price_unit="₼/həftəlik",
            category=Mentor.Category.UX_UI,
            bio="Product designer and mentor.",
            discount_price=Decimal("120.00"),
            stat_sessions=120,
            stat_years=6,
            stat_students=90,
            stat_satisfaction=95,
        )
        figma = Tag.objects.create(name="Figma")
        ux = Tag.objects.create(name="UX")
        self.mentor.tags.add(figma, ux)
        self.mentor.skills.add(figma)

        Review.objects.create(
            mentor=self.mentor,
            author_name="Aysel Məmmədli",
            author_title="Frontend Developer",
            author_avatar_url="https://example.com/student.jpg",
            topic="Portfolio review",
            rating=4,
            comment="Very useful session.",
        )
        Review.objects.create(
            mentor=self.mentor,
            author_name="Kamran Əliyev",
            author_title="Student",
            topic="Career guidance",
            rating=5,
            comment="Excellent mentor.",
        )

        self.backend_mentor = Mentor.objects.create(
            name="Backend Mentor",
            expertise="Backend Development",
            bio="Backend mentor.",
            category=Mentor.Category.BACKEND,
        )

    def test_list_returns_frontend_contract(self):
        response = self.client.get("/api/mentors/?category=ux-ui")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        mentor = response.data[0]
        self.assertEqual(mentor["id"], str(self.mentor.pk))
        self.assertEqual(mentor["fullName"], "Cahan Abdullazadə")
        self.assertEqual(mentor["avatarUrl"], "https://example.com/avatar.jpg")
        self.assertEqual(mentor["rating"], 4.5)
        self.assertEqual(mentor["reviewCount"], 2)
        self.assertEqual(mentor["price"], 100.0)
        self.assertEqual(mentor["discountPrice"], 120.0)
        self.assertEqual(set(mentor["tags"]), {"Figma", "UX"})
        self.assertEqual(mentor["skills"], ["Figma"])
        self.assertEqual(
            mentor["stats"],
            {
                "sessions": 120,
                "years": 6,
                "students": 90,
                "satisfaction": 95,
            },
        )

    def test_category_all_returns_all_active_mentors(self):
        response = self.client.get("/api/mentors/?category=all")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_anonymous_session_header_is_used_for_marketplace_tracking(self):
        session_id = uuid.uuid4()

        response = self.client.get(
            "/api/mentors/",
            HTTP_X_SESSION_ID=str(session_id),
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            Event.objects.filter(
                event_name=EventName.MENTOR_PAGE_VIEWED,
                session_id=session_id,
                user__isnull=True,
            ).exists()
        )

    def test_mentor_without_reviews_uses_default_rating(self):
        response = self.client.get(f"/api/mentors/{self.backend_mentor.pk}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["rating"], 5.0)
        self.assertEqual(response.data["reviewCount"], 0)
        self.assertEqual(response.data["title"], "Backend Development")
