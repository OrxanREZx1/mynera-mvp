"""
Aira — AI karyera assistenti. career/services.py-dəki Aurora ilə eyni
naxışı izləyir (OpenAI çağırışı, JSON validasiyası, mərkəzləşdirilmiş xəta).

İki funksiya:
- chat_reply(): sərbəst söhbət üçün adi mətn cavabı.
- generate_roadmap(): 5 giriş sualının cavabına əsasən strukturlaşdırılmış
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
Sən "Aira" adlı, Yolum IT platformasının IT karyera üzrə AI köməkçisisən.
İstifadəçilərə IT sahəsində karyera seçimi, öyrənmə planı və texniki suallarda
kömək edirsən. Tonun səmimi, konkret və həvəsləndiricidir.
HƏMİŞƏ Azərbaycan dilində cavab ver, hətta istifadəçi başqa dildə yazsa belə
nəzakətlə azərbaycanca davam et. Cavablarını qısa və praktik saxla (adətən
2-5 cümlə), lazım olduqda maddə işarələrindən istifadə et.
"""

ROADMAP_SYSTEM_PROMPT = """\
Sən "Aira" adlı Senior Tech Career Counselor-san. İstifadəçi ilə apardığın
qısa müsahibədən (founder/background, ideya, fərqləndirici tərəf, hədəf
auditoriya, mövcud resurslar) əldə etdiyin cavablara əsasən ona FƏRDİ bir
IT öyrənmə roadmap-ı qurmalısan.

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
- Tam olaraq 6-8 modul yarat, hər modulda 3-5 dərs olsun.
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


def generate_roadmap(answers: dict) -> dict:
    """
    answers = {"founder": "...", "idea": "...", "differentiation": "...",
               "target": "...", "resources": "..."}
    Qaytarır: {"title", "recommended_field", "modules": [...]}
    """
    if not answers or not any((v or "").strip() for v in answers.values()):
        raise AIServiceError("Roadmap qurmaq üçün kifayət qədər məlumat yoxdur.")

    client = _client()
    user_payload = "İstifadəçi ilə aparılan müsahibənin cavabları:\n" + json.dumps(
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

    modules_in = data.get("modules") or []
    if not modules_in:
        raise AIServiceError("AI heç bir modul qaytarmadı.")

    modules = []
    for m_idx, module in enumerate(modules_in, start=1):
        lessons_in = (module or {}).get("lessons") or []
        lessons = [
            {
                "id": f"m{m_idx}-l{l_idx}",
                "title": str(lesson_title),
                "completed": False,
                "locked": False,
            }
            for l_idx, lesson_title in enumerate(lessons_in, start=1)
        ]
        modules.append(
            {
                "id": f"m{m_idx}",
                "index": m_idx,
                "title": str((module or {}).get("title", f"Modul {m_idx}")),
                "duration": str((module or {}).get("duration", "")),
                "lessons": lessons,
            }
        )

    return {
        "title": str(data.get("title") or "Sənin fərdi roadmap-ın"),
        "recommended_field": str(data.get("recommended_field") or ""),
        "modules": modules,
    }
