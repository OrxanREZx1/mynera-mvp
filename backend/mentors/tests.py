from decimal import Decimal
import uuid

from rest_framework.test import APITestCase

from accounts.models import User
from accounts.serializers import UserSerializer

from analytics.events import EventName
from analytics.models import Event

from .models import Mentor, MentorApplication, Review, Tag


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


class MentorApplicationApiTests(APITestCase):
    endpoint = "/api/mentors/applications/"

    def setUp(self):
        self.user = User.objects.create_user(
            email="applicant@example.com",
            password="StrongPass!123",
            full_name="Aysel Applicant",
        )
        self.other_user = User.objects.create_user(
            email="other@example.com",
            password="StrongPass!123",
            full_name="Other Applicant",
        )
        self.payload = {
            "avatar": "https://images.example.com/aysel.jpg",
            "professionalField": "Frontend Development",
            "seniority": "Senior",
            "experienceYears": 7,
            "skills": ["React", "TypeScript"],
            "linkedin": "https://www.linkedin.com/in/aysel",
            "country": "Azərbaycan",
            "motivation": "Yeni mütəxəssislərin inkişafına dəstək olmaq istəyirəm.",
            "targetMenteeTypes": ["Tələbələr", "Junior developers"],
            "offeredServices": ["Career guidance", "Code review"],
            "sessionTypes": ["Video call", "Chat"],
            "paymentPreference": "Paid",
            "status": MentorApplication.Status.APPROVED,
        }

    def test_authenticated_user_can_submit_application(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(self.endpoint, self.payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["fullName"], self.user.full_name)
        self.assertEqual(response.data["email"], self.user.email)
        self.assertEqual(response.data["professionalField"], "Frontend Development")
        self.assertEqual(response.data["skills"], ["React", "TypeScript"])
        self.assertEqual(response.data["status"], MentorApplication.Status.SUBMITTED)
        application = MentorApplication.objects.get(user=self.user)
        self.assertEqual(application.status, MentorApplication.Status.SUBMITTED)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_staff)
        self.assertFalse(self.user.is_superuser)

    def test_anonymous_user_cannot_submit_application(self):
        response = self.client.post(self.endpoint, self.payload, format="json")

        self.assertEqual(response.status_code, 401)
        self.assertFalse(MentorApplication.objects.exists())

    def test_user_cannot_submit_a_second_application(self):
        MentorApplication.objects.create(
            user=self.user,
            professional_field="QA",
            seniority="Middle",
            experience_years=4,
            skills=["API testing"],
            linkedin="https://www.linkedin.com/in/aysel",
            country="Azərbaycan",
            motivation="I want to mentor.",
            target_mentee_types=["Junior QA"],
            offered_services=["Mock interview"],
            session_types=["Video call"],
            payment_preference="Free",
        )
        self.client.force_authenticate(self.user)

        response = self.client.post(self.endpoint, self.payload, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(MentorApplication.objects.filter(user=self.user).count(), 1)

    def test_only_admin_approval_changes_the_derived_mentor_role(self):
        self.client.force_authenticate(self.user)
        create_response = self.client.post(self.endpoint, self.payload, format="json")
        application = MentorApplication.objects.get(user=self.user)

        patch_response = self.client.patch(
            f"{self.endpoint}{application.pk}/",
            {"status": MentorApplication.Status.APPROVED},
            format="json",
        )

        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(patch_response.status_code, 200)
        application.refresh_from_db()
        self.assertEqual(application.status, MentorApplication.Status.SUBMITTED)
        self.assertEqual(UserSerializer(self.user).data["role"], "student")

        application.status = MentorApplication.Status.APPROVED
        application.save(update_fields=["status"])
        self.assertEqual(UserSerializer(self.user).data["role"], "mentor")

    def test_list_and_me_only_expose_current_users_application(self):
        own = MentorApplication.objects.create(
            user=self.user,
            professional_field="Frontend",
            seniority="Senior",
            experience_years=7,
            skills=["React"],
            linkedin="https://www.linkedin.com/in/aysel",
            country="Azərbaycan",
            motivation="I want to mentor.",
            target_mentee_types=["Students"],
            offered_services=["Code review"],
            session_types=["Video call"],
            payment_preference="Paid",
        )
        MentorApplication.objects.create(
            user=self.other_user,
            professional_field="Data",
            seniority="Middle",
            experience_years=4,
            skills=["Python"],
            linkedin="https://www.linkedin.com/in/other",
            country="Azərbaycan",
            motivation="I want to mentor.",
            target_mentee_types=["Students"],
            offered_services=["Career guidance"],
            session_types=["Chat"],
            payment_preference="Free",
        )
        self.client.force_authenticate(self.user)

        list_response = self.client.get(self.endpoint)
        me_response = self.client.get(f"{self.endpoint}me/")

        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]["id"], str(own.pk))
        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(me_response.data["id"], str(own.pk))
