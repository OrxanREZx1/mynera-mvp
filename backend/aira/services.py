"""
Aira — AI karyera assistenti. career/services.py-dəki Aurora ilə eyni
naxışı izləyir (OpenAI çağırışı, JSON validasiyası, mərkəzləşdirilmiş xəta).

İki funksiya:
- chat_reply(): sərbəst söhbət üçün adi mətn cavabı.
- generate_roadmap(): diaqnostik cavablara əsasən strukturlaşdırılmış
  roadmap (modullar + dərslər) qurur.
"""
import json
import logging

from django.conf import settings
from openai import OpenAI

# Mərkəzləşdirilmiş OpenAI köməkçisi (career/services.py ilə eyni). Temperature-i
# modelə görə idarə edir — gpt-5 reasoning modelləri temperature qəbul etmir.
# AIServiceError buradan re-export olunur ki, `from aira.services import
# AIServiceError` (views.py) dəyişmədən işləsin.
from config.openai_helpers import AIServiceError, create_completion

logger = logging.getLogger(__name__)

# Model .env-dəki OPENAI_MODEL dəyərindən oxunur (bax: config/settings.py).
# API açarı/layihəsi bu modelə giriş tapmadıqda (403 model_not_found),
# OPENAI_FALLBACK_MODELS siyahısındakı modellər ardıcıl sınanır.
OPENAI_MODEL = settings.OPENAI_MODEL
OPENAI_FALLBACK_MODELS = settings.OPENAI_FALLBACK_MODELS

# Model əlçatan olmadıqda sınanacaq bütün modellərin sırası (təkrarsız).
_MODEL_CANDIDATES = list(dict.fromkeys([OPENAI_MODEL, *OPENAI_FALLBACK_MODELS]))

AIRA_CHAT_SYSTEM_PROMPT = """\
Sən Mynera platformasının Senior Principal Mentor və istifadəçinin sağ əlisən.
Həmişə qısa, lakin əhatəli və peşəkar cavablar ver. Oxunaqlılığı artırmaq üçün
siyahılardan (bullet points) istifadə et.

ƏN VACİB QAYDA: Əgər istifadəçi karyera məsləhəti və ya yol xəritəsi istəyirsə
və sən onun kim olduğunu bilmirsənsə, dərhal məsləhət VERMƏ. Əvəzində ardıcıl
olaraq bu 3 sualı ver (hər mesajda yalnız birini soruş):
1. Hazırkı vəziyyətiniz (Tələbəyəm, İşləyirəm, İşsizəm)?
2. İT səviyyəniz (Senior, Middle, Junior, Təcrübəsiz)?
3. Məqsədiniz nədir?

İstifadəçi bu 3 suala cavab verdikdən sonra ona detallı bir plan/yol xəritəsi
təqdim et.
"""

ROADMAP_SYSTEM_PROMPT = """\
Sən "Aira" adlı Senior Tech Career Counselor-san. İstifadəçinin hazırkı
vəziyyəti, İT səviyyəsi və məqsədi daxil olmaqla təqdim edilən diaqnostik
cavablara əsasən ona FƏRDİ bir IT öyrənmə roadmap-ı qurmalısan. Sahəni heç
vaxt əvvəlcədən fərz etmə; istiqaməti yalnız cavablardan çıxar.

Cavabı YALNIZ aşağıdakı JSON strukturunda qaytar (başqa mətn, izah və ya
markdown blok işarəsi yazma):
{
  "title": "<roadmap-ın adı, məs: 'Backend Development yol xəritəsi'>",
  "recommended_field": "<tövsiyə olunan İT sahəsi>",
  "modules": [
    {
      "title": "<modulun adı>",
      "duration": "<məs: '1-2 həftə'>",
      "lessons": ["<dərs başlığı 1>", "<dərs başlığı 2>", "..."]
    }
  ]
}

Qaydalar:
- Tam olaraq 4 və ya 5 modul yarat; 4-dən az və 5-dən çox modul yaratma.
- Hər modulda tam olaraq 4 və ya 5 dərs yarat; 4-dən az və 5-dən çox dərs
  yaratma.
- Dərs başlıqları yüksək peşəkarlıq səviyyəsində, konkret və müasir İT
  terminologiyasına uyğun olsun; generik başlıqlardan istifadə etmə.
- Modullar başlanğıcdan irəliyə doğru məntiqli sıra ilə getsin (əsaslardan
  layihə qurmağa qədər).
- Bütün mətnləri Azərbaycan dilində yaz.
- Heç bir dərsi "tamamlanmış" kimi işarələmə — bu, backend tərəfindən idarə
  olunur.
"""


def _client() -> OpenAI:
    if not settings.OPENAI_API_KEY:
        raise AIServiceError("Süni intellekt xidməti hazırda konfiqurasiya olunmayıb.")
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def chat_reply(history: list[dict]) -> str:
    """
    history = [{"role": "user"|"assistant", "content": "..."}, ...]
    Son element istifadəçinin yeni mesajı olmalıdır.
    """
    client = _client()
    messages = [{"role": "system", "content": AIRA_CHAT_SYSTEM_PROMPT}] + history
    try:
        response = create_completion(
            client, _MODEL_CANDIDATES, temperature=0.6, messages=messages
        )
    except AIServiceError:
        raise
    except Exception as exc:
        logger.exception("Aira chat — OpenAI çağırışı uğursuz oldu")
        raise AIServiceError("Aira ilə söhbət zamanı gözlənilməz xəta baş verdi.") from exc

    content = (response.choices[0].message.content or "").strip()
    if not content:
        raise AIServiceError("AI-dan boş cavab gəldi.")
    return content


def _validated_roadmap_payload(data) -> dict:
    """Validate and normalize the untrusted JSON returned by the AI model."""

    if not isinstance(data, dict):
        raise AIServiceError("AI roadmap cavabı düzgün obyekt deyil.")

    modules_in = data.get("modules")
    if not isinstance(modules_in, list) or len(modules_in) not in (4, 5):
        raise AIServiceError("AI roadmap-ı 4 və ya 5 moduldan ibarət olmalıdır.")

    modules = []
    for m_idx, module in enumerate(modules_in, start=1):
        if not isinstance(module, dict):
            raise AIServiceError(f"Roadmap-ın {m_idx}-ci modulu düzgün formatda deyil.")

        module_title = module.get("title")
        duration = module.get("duration")
        lessons_in = module.get("lessons")
        if not isinstance(module_title, str) or not module_title.strip():
            raise AIServiceError(f"Roadmap-ın {m_idx}-ci modul başlığı boşdur.")
        if not isinstance(duration, str) or not duration.strip():
            raise AIServiceError(f"Roadmap-ın {m_idx}-ci modul müddəti boşdur.")
        if not isinstance(lessons_in, list) or len(lessons_in) not in (4, 5):
            raise AIServiceError(
                f"Roadmap-ın {m_idx}-ci modulu 4 və ya 5 dərsdən ibarət olmalıdır."
            )
        if not all(isinstance(title, str) and title.strip() for title in lessons_in):
            raise AIServiceError(f"Roadmap-ın {m_idx}-ci modulunda boş dərs başlığı var.")

        lessons = [
            {
                "id": f"m{m_idx}-l{l_idx}",
                "title": lesson_title.strip(),
                "completed": False,
                "locked": False,
            }
            for l_idx, lesson_title in enumerate(lessons_in, start=1)
        ]
        modules.append(
            {
                "id": f"m{m_idx}",
                "index": m_idx,
                "title": module_title.strip(),
                "duration": duration.strip(),
                "lessons": lessons,
            }
        )

    title = data.get("title")
    recommended_field = data.get("recommended_field")
    if not isinstance(title, str) or not title.strip():
        raise AIServiceError("AI roadmap başlığı qaytarmadı.")
    if not isinstance(recommended_field, str) or not recommended_field.strip():
        raise AIServiceError("AI tövsiyə olunan İT sahəsini qaytarmadı.")

    return {
        "title": title.strip(),
        "recommended_field": recommended_field.strip(),
        "modules": modules,
    }


def generate_roadmap(answers: dict) -> dict:
    """
    answers = istifadəçinin status, İT səviyyəsi və məqsədi kimi diaqnostik
    cavablarını saxlayan dictionary.
    Qaytarır: {"title", "recommended_field", "modules": [...]}
    """
    if not answers or not any((v or "").strip() for v in answers.values()):
        raise AIServiceError("Roadmap qurmaq üçün kifayət qədər məlumat yoxdur.")

    client = _client()
    user_payload = "İstifadəçinin diaqnostik cavabları:\n" + json.dumps(
        answers, ensure_ascii=False, indent=2
    )
    try:
        response = create_completion(
            client,
            _MODEL_CANDIDATES,
            temperature=0.4,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": ROADMAP_SYSTEM_PROMPT},
                {"role": "user", "content": user_payload},
            ],
        )
    except AIServiceError:
        raise
    except Exception as exc:
        logger.exception("Aira roadmap — OpenAI çağırışı uğursuz oldu")
        raise AIServiceError("Roadmap yaradılarkən gözlənilməz xəta baş verdi.") from exc

    content = (response.choices[0].message.content or "").strip()
    try:
        data = json.loads(content)
    except json.JSONDecodeError as exc:
        logger.error("Aira roadmap cavabı JSON deyil: %s", content[:300])
        raise AIServiceError("AI cavabını JSON kimi oxumaq mümkün olmadı.") from exc

    return _validated_roadmap_payload(data)
