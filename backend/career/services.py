"""
Core AI logic & service layer — Aurora persona, OpenAI inteqrasiyası,
Hamilton normalizasiya, mərkəzləşmiş xəta idarəsi.

Sprint 1 sənədinə uyğunlaşdırılıb:
- Bölmə 6: 8 İT sahəsi (əvvəlki 3 deyil).
- Bölmə 5.5 / 7: nəticə strukturu — tövsiyə olunan sahə, "niyə uyğundur",
  2 alternativ sahə, mümkün çətinliklər, pulsuz 7 günlük plan, başlanğıc
  resursları və növbəti addım.
"""
import json
import logging
import math

from django.conf import settings
from openai import OpenAI

# Mərkəzləşdirilmiş OpenAI köməkçisi — temperature-i modelə görə idarə edir
# (gpt-5 reasoning modelləri temperature qəbul etmir), model fallback və xəta
# çevirməsini bir yerdə saxlayır. AIServiceError buradan re-export olunur ki,
# `from career.services import AIServiceError` (views.py) dəyişmədən işləsin.
from config.openai_helpers import AIServiceError, create_completion

from .models import Choice

logger = logging.getLogger(__name__)

# Sprint sənədi, bölmə 6 — "Possible IT Branches for Beta"
SKILL_DOMAINS = [
    "Frontend Development",
    "Backend Development",
    "UI/UX Design",
    "Data Analytics",
    "Cybersecurity",
    "Mobile Development",
    "QA / Software Testing",
    "Product Management",
]

OPENAI_MODEL = settings.OPENAI_MODEL
OPENAI_FALLBACK_MODELS = settings.OPENAI_FALLBACK_MODELS
_MODEL_CANDIDATES = list(dict.fromkeys([OPENAI_MODEL, *OPENAI_FALLBACK_MODELS]))
OPENAI_TEMPERATURE = 0.3

# Aurora — Senior Tech Career Counselor personası
AURORA_SYSTEM_PROMPT = f"""\
Sən "Aurora" adlı, 10 ildən artıq təcrübəyə malik Senior Tech Career Counselor-san.
Vəzifən istifadəçinin test cavablarını analiz edib onun üçün ən uyğun İT karyera
istiqamətini müəyyən etmək və pulsuz 7 günlük başlanğıc plan verməkdir.
Tonun: dürüst, daxili motivasiyaverici və konkret. Nəticə şəxsi hiss olunmalıdır,
generik yox. Yağçılıq etmə — real, faydalı və düşündürücü qiymət ver.

Yalnız bu səkkiz sahə üzərində işləyirsən:
{json.dumps(SKILL_DOMAINS, ensure_ascii=False)}

Cavabı YALNIZ aşağıdakı JSON strukturunda qaytar (başqa heç bir mətn, izah, ya da
markdown blok işarəsi yazma):
{{
  "match_percentages": {{"<hər 8 sahə adı>": <int>}},
  "recommended_branch": "<ən yüksək uyğunluqlu sahə>",
  "why_it_fits": "<2-4 cümlə, istifadəçinin KONKRET cavablarına istinad edərək>",
  "alternative_branches": [
    {{"branch": "<sahə>", "reason": "<1-2 cümlə>"}},
    {{"branch": "<sahə>", "reason": "<1-2 cümlə>"}}
  ],
  "possible_difficulties": ["<çətinlik 1>", "<çətinlik 2>", "<çətinlik 3>"],
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."],
  "seven_day_plan": [
    {{"day": 1, "task": "<konkret tapşırıq>"}},
    {{"day": 2, "task": "..."}},
    {{"day": 3, "task": "..."}},
    {{"day": 4, "task": "..."}},
    {{"day": 5, "task": "..."}},
    {{"day": 6, "task": "..."}},
    {{"day": 7, "task": "..."}}
  ],
  "resources": ["<başlanğıc üçün pulsuz/əlçatan resurs 1>", "<resurs 2>", "<resurs 3>"],
  "next_step": "<7 gündən sonra nə etməli — 1-2 cümlə>"
}}

Qaydalar:
- match_percentages: hər 8 sahə üçün 0-100 arası tam ədəd. Dəqiq cəmlənmə vacib
  deyil — backend onu özü normalizasiya edir; sən sadəcə nisbəti düzgün ver.
- recommended_branch və alternative_branches[].branch dəyərləri yuxarıdakı
  siyahıdan DƏQİQ (hərfi-hərfinə) götürülməlidir.
- alternative_branches: recommended_branch-dan FƏRQLİ 2 sahə.
- seven_day_plan: hər gün üçün başlanğıc səviyyəsinə uyğun, konkret, praktik tapşırıq.
- Bütün mətnləri Azərbaycan dilində yaz. Sahə adları ingiliscə qalsın.
"""


def hamilton_normalize(raw: dict, total: int = 100) -> dict:
    """
    Hamilton (Largest Remainder) metodu — faizləri DƏQİQ `total`-a tamamlayır.
    Cəm həmişə tam olaraq `total` (default 100) olur.
    """
    keys = list(raw.keys())
    if not keys:
        return {}

    values = [max(0.0, float(raw.get(k, 0))) for k in keys]
    s = sum(values)

    # Bütün dəyərlər 0-dırsa — bərabər böl
    if s <= 0:
        base = total // len(keys)
        result = {k: base for k in keys}
        for k in keys[: total - base * len(keys)]:
            result[k] += 1
        return result

    scaled = [v / s * total for v in values]
    floors = [int(math.floor(x)) for x in scaled]
    remainder = total - sum(floors)

    # Qalan vahidləri ən böyük kəsr hissəsi olanlara payla
    order = sorted(range(len(keys)), key=lambda i: scaled[i] - floors[i], reverse=True)
    for i in order[:remainder]:
        floors[i] += 1

    return {keys[i]: floors[i] for i in range(len(keys))}


def _aggregate_weights(raw_answers: dict):
    """
    raw_answers = {"<question_id>": <choice_id>, ...}
    Seçilmiş variantların çəkilərini cəmləyir + AI üçün xülasə hazırlayır.
    """
    totals = {d: 0.0 for d in SKILL_DOMAINS}
    selected = []

    choice_ids = list(raw_answers.values())
    choices = Choice.objects.select_related("question").filter(id__in=choice_ids)
    choice_map = {c.id: c for c in choices}

    for q_id, c_id in raw_answers.items():
        choice = choice_map.get(c_id)
        if choice is None:
            raise AIServiceError(f"Choice id={c_id} tapılmadı (question={q_id}).")
        weights = choice.score_weights or {}
        for domain, w in weights.items():
            if domain in totals:
                totals[domain] += float(w)
        selected.append(
            {
                "question": choice.question.text,
                "answer": choice.text,
                "weights": weights,
            }
        )

    return totals, selected


def _build_user_payload(totals: dict, selected: list) -> str:
    lines = ["İstifadəçinin test cavabları və meyllilik çəkiləri:\n"]
    for i, item in enumerate(selected, 1):
        lines.append(f"{i}. Sual: {item['question']}")
        lines.append(f"   Cavab: {item['answer']}")
        lines.append(f"   Çəkilər: {item['weights']}")
    lines.append("\nSahələr üzrə yığılmış xam çəki cəmi:")
    lines.append(json.dumps(totals, ensure_ascii=False))
    lines.append("\nBu məlumata əsasən analizi tələb olunan JSON formatında qaytar.")
    return "\n".join(lines)


def _call_openai(user_payload: str) -> dict:
    if not settings.OPENAI_API_KEY:
        raise AIServiceError("Süni intellekt xidməti hazırda konfiqurasiya olunmayıb.")

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    try:
        response = create_completion(
            client,
            _MODEL_CANDIDATES,
            temperature=OPENAI_TEMPERATURE,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": AURORA_SYSTEM_PROMPT},
                {"role": "user", "content": user_payload},
            ],
        )
    except AIServiceError:
        raise
    except Exception as exc:  # şəbəkə / API / SDK xətaları
        logger.exception("OpenAI API çağırışı uğursuz oldu")
        raise AIServiceError("Analiz zamanı gözlənilməz xəta baş verdi.") from exc

    content = (response.choices[0].message.content or "").strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError as exc:
        logger.error("AI cavabı JSON deyil: %s", content[:300])
        raise AIServiceError("AI cavabını JSON kimi oxumaq mümkün olmadı.") from exc


def _validate_and_finalize(data: dict) -> dict:
    required = ("match_percentages", "seven_day_plan")
    missing = [k for k in required if k not in data]
    if missing:
        raise AIServiceError(f"AI cavabında çatışmayan açarlar: {missing}")

    mp = data.get("match_percentages") or {}
    # Yalnız bizim sahələri götür, çatışmayanı 0 say
    cleaned = {d: float(mp.get(d, 0) or 0) for d in SKILL_DOMAINS}
    normalized = hamilton_normalize(cleaned, total=100)
    top_domain = max(normalized, key=normalized.get)

    # AI-nin verdiyi recommended_branch etibarlıdırsa onu, deyilsə hesablanmış
    # top_domain-i istifadə et (AI hərdən siyahıdan kənara çıxa bilər).
    recommended = data.get("recommended_branch")
    if recommended not in SKILL_DOMAINS:
        recommended = top_domain

    # Alternativləri təmizlə: yalnız etibarlı, recommended-dən fərqli sahələr
    alternatives = []
    for alt in list(data.get("alternative_branches") or []):
        branch = (alt or {}).get("branch") if isinstance(alt, dict) else None
        if branch in SKILL_DOMAINS and branch != recommended:
            alternatives.append(
                {"branch": branch, "reason": str((alt or {}).get("reason", ""))[:500]}
            )
    if len(alternatives) < 2:
        # Faiz sırasına görə növbəti sahələrlə tamamla
        ranked = sorted(normalized, key=normalized.get, reverse=True)
        for branch in ranked:
            if branch != recommended and branch not in [a["branch"] for a in alternatives]:
                alternatives.append({"branch": branch, "reason": ""})
            if len(alternatives) >= 2:
                break
    alternatives = alternatives[:2]

    # 7 günlük planı normallaşdır — həmişə tam 7 element, {"day", "task"} forması
    plan = []
    for i, item in enumerate(list(data.get("seven_day_plan") or [])[:7], 1):
        if isinstance(item, dict):
            plan.append({"day": i, "task": str(item.get("task", "")).strip()})
        else:
            plan.append({"day": i, "task": str(item).strip()})
    if len(plan) < 7:
        raise AIServiceError("AI 7 günlük planı tam qaytarmadı.")

    return {
        "match_percentages": normalized,
        "top_domain": top_domain,               # geriyə uyğunluq üçün saxlanılır
        "recommended_branch": recommended,
        "why_it_fits": str(data.get("why_it_fits", "")).strip(),
        "alternative_branches": alternatives,
        "possible_difficulties": [str(x) for x in list(data.get("possible_difficulties") or [])][:5],
        "strengths": [str(x) for x in list(data.get("strengths") or [])][:5],
        "weaknesses": [str(x) for x in list(data.get("weaknesses") or [])][:5],
        "seven_day_plan": plan,
        "resources": [str(x) for x in list(data.get("resources") or [])][:6],
        "next_step": str(data.get("next_step", "")).strip(),
    }


def analyze_assessment(raw_answers: dict) -> dict:
    """
    Əsas giriş nöqtəsi — view bu funksiyanı çağırır.
    raw_answers = {"<question_id>": <choice_id>, ...}
    Qaytarır: final_result dict (match_percentages dəqiq 100%-ə normalizasiya olunmuş).
    """
    if not raw_answers:
        raise AIServiceError("Cavablar boşdur.")

    totals, selected = _aggregate_weights(raw_answers)
    payload = _build_user_payload(totals, selected)
    raw_ai = _call_openai(payload)
    return _validate_and_finalize(raw_ai)
