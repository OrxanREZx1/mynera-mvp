"""
Sprint 1 başlanğıc datası:
- 9 assessment sualı (sprint §5.3 — məqsəd, maraqlar, İT biliyi, vaxt,
  ingilis dili, riyaziyyat, öyrənmə tərzi, çaşqınlıq, əvvəlki cəhdlər),
  hər variantın çəkiləri 8 İT sahəsi (sprint §6) üzərində paylanıb.
- 2 mentor (sprint §10 — "For Beta, 2 mentors are enough").

İdempotentdir: mövcud data varsa dublikat yaratmır.

İstifadə: python manage.py seed_sprint_data
"""
from django.core.management.base import BaseCommand
from django.db import transaction

from career.models import Choice, Question
from mentors.models import Mentor

# Qısaltmalar — career.services.SKILL_DOMAINS ilə DƏQİQ eyni açarlar
FE = "Frontend Development"
BE = "Backend Development"
UX = "UI/UX Design"
DA = "Data Analytics"
CY = "Cybersecurity"
MO = "Mobile Development"
QA = "QA / Software Testing"
PM = "Product Management"

QUESTIONS = [
    {
        "text": "İT-də əsas məqsədin nədir?",
        "choices": [
            ("Vebsaytlar və vizual məhsullar yaratmaq", {FE: 3, UX: 2}),
            ("Sistemlərin 'arxa tərəfini' — server və məlumat məntiqini qurmaq", {BE: 3, DA: 1}),
            ("Data ilə işləyib qərarlar üçün nəticə çıxarmaq", {DA: 3, BE: 1}),
            ("Sistemləri hücumlardan qorumaq", {CY: 3, BE: 1}),
            ("Mobil tətbiqlər hazırlamaq", {MO: 3, FE: 1}),
            ("Komanda və məhsulu idarə etmək", {PM: 3, QA: 1}),
        ],
    },
    {
        "text": "Hansı iş növü səni daha çox cəlb edir?",
        "choices": [
            ("Dizayn etmək — istifadəçi üçün rahat və gözəl interfeys düşünmək", {UX: 3, FE: 2}),
            ("Kod yazıb dərhal ekranda nəticəsini görmək", {FE: 3, MO: 2}),
            ("Mürəkkəb məntiqi problemləri həll etmək", {BE: 3, CY: 1, DA: 1}),
            ("Qaydaları pozub sistemin zəif yerini tapmaq", {CY: 3, QA: 1}),
            ("Səhvləri tapıb keyfiyyəti yoxlamaq", {QA: 3, CY: 1}),
            ("Cədvəllər, qrafiklər və trendlərlə işləmək", {DA: 3, PM: 1}),
        ],
    },
    {
        "text": "Hazırkı İT səviyyən necədir?",
        "choices": [
            ("Heç nə bilmirəm — sıfırdan başlayıram", {FE: 1, UX: 1, QA: 1}),
            ("Əvvəl öyrənməyə cəhd etmişəm, amma dayandırmışam", {FE: 1, BE: 1, MO: 1}),
            ("Əsasları bilirəm (dəyişənlər, sadə proqramlar)", {BE: 2, DA: 1, MO: 1}),
            ("Sahəmi seçmişəm, sadəcə yol xəritəsi lazımdır", {BE: 1, FE: 1, DA: 1, CY: 1}),
        ],
    },
    {
        "text": "Həftədə öyrənməyə nə qədər vaxt ayıra bilərsən?",
        "choices": [
            ("5 saatdan az", {QA: 2, UX: 1, PM: 1}),
            ("5–10 saat", {FE: 2, DA: 1, MO: 1}),
            ("10–20 saat", {BE: 2, FE: 1, CY: 1}),
            ("20+ saat — tam ciddi başlamağa hazıram", {BE: 2, CY: 2, DA: 1}),
        ],
    },
    {
        "text": "İngilis dili səviyyən necədir?",
        "choices": [
            ("Zəif — texniki mətnləri çətin başa düşürəm", {QA: 2, UX: 1, FE: 1}),
            ("Orta — sənədləri lüğətlə oxuya bilirəm", {FE: 2, MO: 1, DA: 1}),
            ("Yaxşı — texniki sənədləri sərbəst oxuyuram", {BE: 2, CY: 2, DA: 1}),
        ],
    },
    {
        "text": "Riyaziyyatla aran necədir?",
        "choices": [
            ("Riyaziyyatı sevmirəm — mümkün qədər az olsun", {UX: 3, FE: 2, QA: 1}),
            ("Ortabab — lazım olanda öyrənərəm", {FE: 1, MO: 2, BE: 1, PM: 1}),
            ("Yaxşıdır — məntiq və hesablamalar xoşuma gəlir", {BE: 2, CY: 1, DA: 2}),
            ("Çox güclüdür — statistika/analiz cəlb edir", {DA: 3, BE: 1}),
        ],
    },
    {
        "text": "Öyrənməyi necə xoşlayırsan?",
        "choices": [
            ("Video izləyib təkrar etməklə", {FE: 2, MO: 1, UX: 1}),
            ("Sənəd oxuyub özüm sınaqdan keçirməklə", {BE: 2, CY: 1, DA: 1}),
            ("Praktik layihələr qurub səhvlərimdən öyrənməklə", {FE: 1, BE: 1, MO: 2}),
            ("İnsanlarla müzakirə edib komandada işləməklə", {PM: 3, QA: 1, UX: 1}),
        ],
    },
    {
        "text": "Səni İT-də ən çox nə çaşdırır?",
        "choices": [
            ("Sahələrin çox olması — hansını seçəcəyimi bilmirəm", {FE: 1, BE: 1, DA: 1, UX: 1}),
            ("Kodlaşdırmanın çətin olub-olmayacağı", {UX: 2, QA: 2, PM: 1}),
            ("Haradan başlayacağımı bilməmək", {FE: 2, MO: 1, BE: 1}),
            ("İş tapa bilib-bilməyəcəyim", {QA: 1, DA: 1, PM: 1, CY: 1}),
        ],
    },
    {
        "text": "Əvvəllər hansı sahələri nəzərdən keçirmisən və ya sınamısan?",
        "choices": [
            ("Veb səhifə/HTML-CSS sınamışam", {FE: 3, UX: 1}),
            ("Python/proqramlaşdırma sınamışam", {BE: 2, DA: 2}),
            ("Dizayn (Figma, Photoshop) sınamışam", {UX: 3, FE: 1}),
            ("Excel/data ilə işləmişəm", {DA: 3, PM: 1}),
            ("Heç birini — tam yeniyəm", {FE: 1, QA: 1, MO: 1}),
        ],
    },
]

MENTORS = [
    {
        "name": "Aysel Məmmədova",
        "expertise": "Frontend Development",
        "bio": (
            "5 illik frontend təcrübəsi (React, Next.js). Yüzlərlə başlanğıc "
            "səviyyəli tələbəyə ilk layihələrini qurmaqda kömək edib. "
            "Sıfırdan başlayanlar üçün səbirli və addım-addım izah tərzi."
        ),
        "available_topics": [
            "Roadmap sualları",
            "Frontend-ə haradan başlamaq",
            "İlk portfolio layihəsi",
            "Sahə seçimində tərəddüd",
        ],
    },
    {
        "name": "Tural Əliyev",
        "expertise": "Backend Development & Data",
        "bio": (
            "7 illik backend və data mühəndisliyi təcrübəsi (Python, Django, SQL). "
            "Karyera dəyişənlərlə işləməyi sevir — motivasiya, öyrənmə strategiyası "
            "və real iş bazarına hazırlıq üzrə praktik məsləhətlər verir."
        ),
        "available_topics": [
            "Backend vs Data seçimi",
            "Roadmap addımlarının izahı",
            "Öyrənmə strategiyası",
            "Motivasiya və davamlılıq",
        ],
    },
]


class Command(BaseCommand):
    help = "Sprint 1 başlanğıc datasını (9 sual + 2 mentor) yaradır. İdempotentdir."

    @transaction.atomic
    def handle(self, *args, **options):
        created_q = 0
        for order, q in enumerate(QUESTIONS, start=1):
            question, was_created = Question.objects.get_or_create(
                text=q["text"], defaults={"order": order, "is_active": True}
            )
            if was_created:
                created_q += 1
                Choice.objects.bulk_create(
                    [
                        Choice(question=question, text=text, score_weights=weights)
                        for text, weights in q["choices"]
                    ]
                )

        created_m = 0
        for m in MENTORS:
            _, was_created = Mentor.objects.get_or_create(
                name=m["name"],
                defaults={
                    "expertise": m["expertise"],
                    "bio": m["bio"],
                    "available_topics": m["available_topics"],
                    "active": True,
                },
            )
            if was_created:
                created_m += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed tamamlandı: {created_q} yeni sual, {created_m} yeni mentor "
                f"(cəmi: {Question.objects.count()} sual, {Mentor.objects.count()} mentor)."
            )
        )
