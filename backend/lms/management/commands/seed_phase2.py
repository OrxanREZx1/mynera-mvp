"""Seed Phase 2 mentor marketplace and LMS data for local UI testing."""

from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from lms.models import Lesson, Module, Roadmap, UserLessonProgress
from mentors.models import Mentor, Review, Tag


ROADMAP_MODULES = [
    {
        "title": "Başlanğıc anlayışlar",
        "duration": "1-2 həftə",
        "lessons": [
            "Süni intellekt nədir?",
            "Maşın öyrənməsinin növləri",
        ],
    },
    {
        "title": "Data ilə işləmək",
        "duration": "1-2 həftə",
        "lessons": [
            "NumPy və Pandas",
            "Data təmizləmə və vizuallaşdırma",
        ],
    },
]

MENTORS = [
    {
        "name": "Aysel Məmmədova",
        "expertise": "UX/UI Design",
        "title": "UX/UI Designer",
        "company": "Kapital Bank",
        "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces",
        "cover_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=500&fit=crop",
        "category": Mentor.Category.UX_UI,
        "bio": (
            "İstifadəçi yönümlü məhsullar, prototiplər və design system-lər "
            "üzrə 6 illik təcrübəyə sahib UX/UI dizaynerəm."
        ),
        "available_topics": [
            "UX/UI roadmap",
            "Portfolio yoxlanışı",
            "Figma və prototipləmə",
        ],
        "price": Decimal("100.00"),
        "discount_price": Decimal("120.00"),
        "stat_sessions": 120,
        "stat_years": 6,
        "stat_students": 90,
        "stat_satisfaction": 96,
        "tags": ["Figma", "UX", "Prototyping"],
        "skills": ["Figma", "UX Research", "Design System", "Wireframing"],
        "ratings": [5, 5, 5, 5, 4],
    },
    {
        "name": "Tural Əliyev",
        "expertise": "Backend Development",
        "title": "Backend Developer",
        "company": "Azercell",
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces",
        "cover_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=500&fit=crop",
        "category": Mentor.Category.BACKEND,
        "bio": (
            "Python, Django, PostgreSQL və sistem dizaynı üzrə 7 illik "
            "təcrübəyə sahib backend mühəndisiyəm."
        ),
        "available_topics": [
            "Backend roadmap",
            "Django və REST API",
            "İş müsahibəsinə hazırlıq",
        ],
        "price": Decimal("100.00"),
        "discount_price": None,
        "stat_sessions": 96,
        "stat_years": 7,
        "stat_students": 84,
        "stat_satisfaction": 94,
        "tags": ["Python", "Django", "Backend"],
        "skills": ["Python", "Django", "PostgreSQL", "Docker"],
        "ratings": [5, 5, 4],
    },
]


class Command(BaseCommand):
    help = "Phase 2 üçün mentor marketplace və LMS test datasını yaradır."

    @transaction.atomic
    def handle(self, *args, **options):
        user = self._seed_user()
        roadmap = self._seed_roadmap(user)
        mentors = [self._seed_mentor(data) for data in MENTORS]

        self.stdout.write(
            self.style.SUCCESS(
                "Phase 2 seed completed: "
                f"user={user.email}, roadmap_id={roadmap.pk}, "
                f"modules={roadmap.modules.count()}, "
                f"lessons={Lesson.objects.filter(module__roadmap=roadmap).count()}, "
                f"mentors={len(mentors)}."
            )
        )

    def _seed_user(self):
        User = get_user_model()
        user, _ = User.objects.get_or_create(
            email="test@mynera.az",
            defaults={
                "full_name": "Mynera Test User",
                "is_active": True,
            },
        )
        if not user.full_name:
            user.full_name = "Mynera Test User"
        user.set_password("password123")
        user.is_active = True
        user.save(update_fields=["full_name", "password", "is_active"])
        return user

    def _seed_roadmap(self, user):
        # Roadmaps are shared curriculum records. UserLessonProgress provides
        # the user-specific association, completion percentage, and lock state.
        roadmap, _ = Roadmap.objects.get_or_create(
            title="Süni intellekt və maşın öyrənməsi",
            defaults={"recommended_field": "AI/ML"},
        )
        if roadmap.recommended_field != "AI/ML":
            roadmap.recommended_field = "AI/ML"
            roadmap.save(update_fields=["recommended_field"])

        seeded_lessons = []
        for module_order, module_data in enumerate(ROADMAP_MODULES, start=1):
            module, _ = Module.objects.get_or_create(
                roadmap=roadmap,
                order=module_order,
                defaults={
                    "title": module_data["title"],
                    "duration": module_data["duration"],
                },
            )
            changed_fields = []
            for field in ("title", "duration"):
                value = module_data[field]
                if getattr(module, field) != value:
                    setattr(module, field, value)
                    changed_fields.append(field)
            if changed_fields:
                module.save(update_fields=changed_fields)

            for lesson_order, title in enumerate(module_data["lessons"], start=1):
                lesson, _ = Lesson.objects.get_or_create(
                    module=module,
                    order=lesson_order,
                    defaults={"title": title},
                )
                if lesson.title != title:
                    lesson.title = title
                    lesson.save(update_fields=["title"])
                seeded_lessons.append(lesson)

        for index, lesson in enumerate(seeded_lessons):
            progress, _ = UserLessonProgress.objects.get_or_create(
                user=user,
                lesson=lesson,
                defaults={"is_completed": index == 0},
            )
            expected_completion = index == 0
            if progress.is_completed != expected_completion:
                progress.is_completed = expected_completion
                progress.save(update_fields=["is_completed"])

        return roadmap

    def _seed_mentor(self, data):
        model_fields = {
            "expertise": data["expertise"],
            "title": data["title"],
            "company": data["company"],
            "avatar_url": data["avatar_url"],
            "cover_url": data["cover_url"],
            "country": "Azərbaycan",
            "country_flag": "🇦🇿",
            "price": data["price"],
            "price_unit": "₼/həftəlik",
            "category": data["category"],
            "is_free": False,
            "discount_price": data["discount_price"],
            "stat_sessions": data["stat_sessions"],
            "stat_years": data["stat_years"],
            "stat_students": data["stat_students"],
            "stat_satisfaction": data["stat_satisfaction"],
            "bio": data["bio"],
            "available_topics": data["available_topics"],
            "active": True,
        }
        mentor, _ = Mentor.objects.get_or_create(
            name=data["name"],
            defaults=model_fields,
        )

        changed_fields = []
        for field, value in model_fields.items():
            if getattr(mentor, field) != value:
                setattr(mentor, field, value)
                changed_fields.append(field)
        if changed_fields:
            mentor.save(update_fields=changed_fields)

        mentor.tags.set(self._tags(data["tags"]))
        mentor.skills.set(self._tags(data["skills"]))
        self._seed_reviews(mentor, data["ratings"])
        return mentor

    @staticmethod
    def _tags(names):
        return [Tag.objects.get_or_create(name=name)[0] for name in names]

    @staticmethod
    def _seed_reviews(mentor, ratings):
        for index, rating in enumerate(ratings, start=1):
            author_name = f"Test Tələbə {index}"
            review, _ = Review.objects.get_or_create(
                mentor=mentor,
                author_name=author_name,
                topic="Karyera və portfolio məsləhəti",
                defaults={
                    "author_title": "Frontend Developer",
                    "author_avatar_url": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=faces",
                    "rating": rating,
                    "comment": "Sessiya faydalı və praktik idi.",
                },
            )
            if review.rating != rating:
                review.rating = rating
                review.save(update_fields=["rating"])
