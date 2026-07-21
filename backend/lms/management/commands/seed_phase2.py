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

RATING_PATTERN = (5, 5, 5, 5, 5, 5, 5, 5, 5, 4)

REVIEWERS = [
    {
        "name": "Lalə Qasımova",
        "title": "Junior Frontend Developer",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&h=240&q=85&crop=faces",
        "comment": "Sessiya konkret nümunələr və aydın növbəti addımlarla çox faydalı oldu.",
    },
    {
        "name": "Orxan İbrahimli",
        "title": "Software Engineering Student",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&h=240&q=85&crop=faces",
        "comment": "Mentor mürəkkəb mövzuları sadə izah etdi və mənə praktik plan verdi.",
    },
    {
        "name": "Aynur Həsənova",
        "title": "Product Design Intern",
        "avatar_url": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&h=240&q=85&crop=faces",
        "comment": "Portfolio və karyera hədəflərim üçün çox dəqiq rəy aldım.",
    },
    {
        "name": "Emil Rzayev",
        "title": "Junior Backend Developer",
        "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&h=240&q=85&crop=faces",
        "comment": "Real layihə təcrübəsinə əsaslanan məsləhətlər dərhal işimə yaradı.",
    },
    {
        "name": "Nərgiz Hüseynli",
        "title": "Data Analytics Student",
        "avatar_url": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=240&h=240&q=85&crop=faces",
        "comment": "Öyrənmə yolumu prioritetlərə bölüb daha aydın hala gətirdi.",
    },
    {
        "name": "Fərid Kərimov",
        "title": "QA Engineer",
        "avatar_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=240&h=240&q=85&crop=faces",
        "comment": "Sual-cavab hissəsi detallı idi və bütün qeyri-müəyyənlikləri aradan qaldırdı.",
    },
    {
        "name": "Səbinə Məlikova",
        "title": "Computer Science Graduate",
        "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&h=240&q=85&crop=faces",
        "comment": "Müsahibəyə hazırlıq üçün ölçülə bilən və real hədəflər müəyyən etdik.",
    },
    {
        "name": "Cavid Nəcəfov",
        "title": "DevOps Intern",
        "avatar_url": "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=240&h=240&q=85&crop=faces",
        "comment": "Texniki boşluqlarımı düzgün müəyyənləşdirib uyğun resurslar tövsiyə etdi.",
    },
    {
        "name": "Ülviyyə Babayeva",
        "title": "Associate Product Manager",
        "avatar_url": "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=240&h=240&q=85&crop=faces",
        "comment": "Sessiya strukturlaşdırılmış, peşəkar və nəticə yönümlü keçdi.",
    },
    {
        "name": "Rəşad Ağayev",
        "title": "Full-Stack Developer",
        "avatar_url": "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=240&h=240&q=85&crop=faces",
        "comment": "Güclü tərəflərimi və inkişaf etdirməli olduğum mövzuları dəqiq göstərdi.",
    },
]

MENTORS = [
    {
        "name": "Aysel Məmmədova",
        "expertise": "UX/UI Design",
        "title": "Lead Product Designer",
        "company": "Kapital Bank",
        "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&h=800&q=90&crop=faces",
        "cover_url": "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=85",
        "category": Mentor.Category.UX_UI,
        "bio": (
            "Fintech məhsulları, UX strategiyası və miqyaslana bilən design system-lər "
            "üzrə 9 illik təcrübəyə sahib məhsul dizayneriyəm."
        ),
        "available_topics": [
            "UX/UI karyera yol xəritəsi",
            "Portfolio və case study auditi",
            "Figma və design system mentorluğu",
        ],
        "price": Decimal("110.00"),
        "discount_price": Decimal("135.00"),
        "stat_sessions": 684,
        "stat_years": 9,
        "stat_students": 512,
        "stat_satisfaction": 99,
        "tags": ["Figma", "UX", "Product Design"],
        "skills": ["Figma", "UX Research", "Design Systems", "Prototyping"],
        "ratings": RATING_PATTERN,
    },
    {
        "name": "Tural Əliyev",
        "expertise": "Backend Development",
        "title": "Staff Backend Engineer",
        "company": "Azercell",
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&h=800&q=90&crop=faces",
        "cover_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=85",
        "category": Mentor.Category.BACKEND,
        "bio": (
            "Python, Django, paylanmış sistemlər və yüksək yüklü API-lər üzrə "
            "10 illik təcrübəyə sahib backend mühəndisiyəm."
        ),
        "available_topics": [
            "Backend engineering yol xəritəsi",
            "Django və REST API arxitekturası",
            "System design müsahibəsinə hazırlıq",
        ],
        "price": Decimal("125.00"),
        "discount_price": Decimal("150.00"),
        "stat_sessions": 742,
        "stat_years": 10,
        "stat_students": 568,
        "stat_satisfaction": 99,
        "tags": ["Python", "Django", "System Design"],
        "skills": ["Python", "Django REST Framework", "PostgreSQL", "Redis", "Docker"],
        "ratings": RATING_PATTERN,
    },
    {
        "name": "Kamran Həsənli",
        "expertise": "Cloud & DevOps Engineering",
        "title": "Senior DevOps Engineer",
        "company": "PASHA Technology",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&h=800&q=90&crop=faces",
        "cover_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=85",
        "category": Mentor.Category.SECURITY,
        "bio": (
            "Cloud infrastrukturu, CI/CD, Kubernetes və platform engineering üzrə "
            "8 illik istehsalat təcrübəsinə sahib DevOps mühəndisiyəm."
        ),
        "available_topics": [
            "DevOps karyera yol xəritəsi",
            "Docker və Kubernetes praktikası",
            "Cloud və CI/CD layihə auditi",
        ],
        "price": Decimal("120.00"),
        "discount_price": Decimal("145.00"),
        "stat_sessions": 618,
        "stat_years": 8,
        "stat_students": 447,
        "stat_satisfaction": 98,
        "tags": ["DevOps", "Cloud", "Kubernetes"],
        "skills": ["AWS", "Docker", "Kubernetes", "Terraform", "GitHub Actions"],
        "ratings": RATING_PATTERN,
    },
    {
        "name": "Nigar Rzayeva",
        "expertise": "Product Management",
        "title": "Senior Product Manager",
        "company": "Birbank",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&h=800&q=90&crop=faces",
        "cover_url": "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=85",
        "category": Mentor.Category.UX_UI,
        "bio": (
            "Məhsul strategiyası, discovery, analitika və cross-functional komandaların "
            "idarə edilməsi üzrə 9 illik təcrübəyə sahib Product Managerəm."
        ),
        "available_topics": [
            "Product Management karyera keçidi",
            "Product case müsahibəsi",
            "MVP, discovery və prioritetləndirmə",
        ],
        "price": Decimal("115.00"),
        "discount_price": Decimal("140.00"),
        "stat_sessions": 589,
        "stat_years": 9,
        "stat_students": 431,
        "stat_satisfaction": 98,
        "tags": ["Product", "Strategy", "Discovery"],
        "skills": ["Product Strategy", "User Research", "Analytics", "Agile", "Roadmapping"],
        "ratings": RATING_PATTERN,
    },
    {
        "name": "Murad Quliyev",
        "expertise": "Quality Assurance",
        "title": "Lead QA Automation Engineer",
        "company": "ABB Tech",
        "avatar_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&h=800&q=90&crop=faces",
        "cover_url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85",
        "category": Mentor.Category.BACKEND,
        "bio": (
            "Web və mobil məhsullar üçün test strategiyası, API testing və automation "
            "framework-ləri üzrə 8 illik təcrübəyə sahib QA lideriyəm."
        ),
        "available_topics": [
            "Manual QA-dan Automation-a keçid",
            "Test strategiyası və portfolio layihəsi",
            "QA müsahibəsinə hazırlıq",
        ],
        "price": Decimal("95.00"),
        "discount_price": Decimal("120.00"),
        "stat_sessions": 536,
        "stat_years": 8,
        "stat_students": 398,
        "stat_satisfaction": 98,
        "tags": ["QA", "Automation", "Testing"],
        "skills": ["Playwright", "Selenium", "Postman", "Pytest", "CI/CD"],
        "ratings": RATING_PATTERN,
    },
    {
        "name": "Leyla İsmayılova",
        "expertise": "Frontend Engineering",
        "title": "Principal Frontend Engineer",
        "company": "EPAM",
        "avatar_url": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&h=800&q=90&crop=faces",
        "cover_url": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=85",
        "category": Mentor.Category.FRONTEND,
        "bio": (
            "React, TypeScript, frontend arxitekturası və performans optimizasiyası "
            "üzrə 11 illik təcrübəyə sahib frontend mühəndisiyəm."
        ),
        "available_topics": [
            "Frontend karyera yol xəritəsi",
            "React portfolio və code review",
            "Senior frontend müsahibəsinə hazırlıq",
        ],
        "price": Decimal("130.00"),
        "discount_price": Decimal("160.00"),
        "stat_sessions": 701,
        "stat_years": 11,
        "stat_students": 529,
        "stat_satisfaction": 99,
        "tags": ["React", "TypeScript", "Frontend"],
        "skills": ["React", "TypeScript", "Next.js", "Web Performance", "Testing Library"],
        "ratings": RATING_PATTERN,
    },
    {
        "name": "Elvin Cəfərov",
        "expertise": "Data Science",
        "title": "Lead Data Scientist",
        "company": "SOCAR Digital",
        "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&h=800&q=90&crop=faces",
        "cover_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85",
        "category": Mentor.Category.DATA,
        "bio": (
            "Machine learning, analitik modellər və data məhsullarının production-a "
            "çıxarılması üzrə 10 illik təcrübəyə sahib Data Scientistəm."
        ),
        "available_topics": [
            "Data Science karyera yol xəritəsi",
            "ML portfolio layihəsinin qurulması",
            "Data və ML müsahibəsinə hazırlıq",
        ],
        "price": Decimal("135.00"),
        "discount_price": Decimal("165.00"),
        "stat_sessions": 655,
        "stat_years": 10,
        "stat_students": 486,
        "stat_satisfaction": 99,
        "tags": ["Data Science", "Machine Learning", "Python"],
        "skills": ["Python", "Pandas", "scikit-learn", "SQL", "MLOps"],
        "ratings": RATING_PATTERN,
    },
    {
        "name": "Zəhra Hüseynova",
        "expertise": "Artificial Intelligence",
        "title": "Senior AI/ML Engineer",
        "company": "PASHA AI Lab",
        "avatar_url": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&h=800&q=90&crop=faces",
        "cover_url": "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=1200&q=85",
        "category": Mentor.Category.AI_ML,
        "bio": (
            "Generative AI, NLP və production ML sistemləri üzrə 8 illik təcrübəyə "
            "sahib AI mühəndisiyəm."
        ),
        "available_topics": [
            "AI/ML karyera yol xəritəsi",
            "LLM və NLP portfolio layihəsi",
            "Machine Learning system design",
        ],
        "price": Decimal("140.00"),
        "discount_price": Decimal("170.00"),
        "stat_sessions": 577,
        "stat_years": 8,
        "stat_students": 416,
        "stat_satisfaction": 99,
        "tags": ["AI", "Machine Learning", "Generative AI"],
        "skills": ["Python", "PyTorch", "LLMs", "NLP", "MLOps"],
        "ratings": RATING_PATTERN,
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
        self._seed_reviews(
            mentor,
            ratings=data["ratings"],
            topics=data["available_topics"],
        )
        return mentor

    @staticmethod
    def _tags(names):
        return [Tag.objects.get_or_create(name=name)[0] for name in names]

    @staticmethod
    def _seed_reviews(mentor, ratings, topics):
        """Create deterministic reviews so MentorSerializer returns a 4.9 rating."""
        for index, (reviewer, rating) in enumerate(
            zip(REVIEWERS, ratings, strict=True),
            start=1,
        ):
            topic = topics[(index - 1) % len(topics)]

            # Reuse reviews produced by the original two-mentor seed instead of
            # leaving duplicate placeholder reviews in an already-seeded DB.
            review = Review.objects.filter(
                mentor=mentor,
                author_name=f"Test Tələbə {index}",
                topic="Karyera və portfolio məsləhəti",
            ).first()
            if review is None:
                review, _ = Review.objects.get_or_create(
                    mentor=mentor,
                    author_name=reviewer["name"],
                    topic=topic,
                    defaults={
                        "author_title": reviewer["title"],
                        "author_avatar_url": reviewer["avatar_url"],
                        "rating": rating,
                        "comment": reviewer["comment"],
                    },
                )

            review_fields = {
                "author_name": reviewer["name"],
                "author_title": reviewer["title"],
                "author_avatar_url": reviewer["avatar_url"],
                "topic": topic,
                "rating": rating,
                "comment": reviewer["comment"],
            }
            changed_fields = []
            for field, value in review_fields.items():
                if getattr(review, field) != value:
                    setattr(review, field, value)
                    changed_fields.append(field)
            if changed_fields:
                review.save(update_fields=changed_fields)
