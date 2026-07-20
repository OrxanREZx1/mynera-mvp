"""
Mərkəzləşdirilmiş OpenAI `chat.completions` köməkçisi.

NİYƏ LAZIMDIR
-------------
GPT-5 ailəsi (gpt-5, gpt-5-mini, gpt-5-nano, gpt-5.1, gpt-5.2, gpt-5.4-mini ...)
və o-seriyası (o1/o3/o4) "reasoning" modelləridir. Bu modellər
`chat.completions`-də `temperature` parametrini QƏBUL ETMİR — default (1)
xaricində istənilən dəyər üçün OpenAI:

    400 - Unsupported value: 'temperature' does not support 0.3 ...
          Only the default (1) value is supported.  (unsupported_value)

qaytarır. Köhnə kod hər çağırışda temperature=0.3/0.4/0.6 göndərirdi, ona görə
`.env`-də model gpt-5-mini / gpt-5.2 olanda Aira chat, roadmap və karyera testi —
hamısı 503-lə sınırdı.

Bu modul:
- Modelə görə `temperature`-i avtomatik daxil edir və ya ATIR (yalnız dəstəkləyən
  modellərə göndərir).
- gpt-5 reasoning modelləri üçün `reasoning_effort="low"` verir (JSON/analiz üçün
  kifayət qədər keyfiyyət, amma daha az latency və xərc).
- Model əlçatan olmayanda (403/404) fallback modelə keçir.
- Gözlənilməz 400 (parametr) halında temperature/reasoning_effort atıb bir dəfə
  yenidən sınayır (gələcək modellər üçün təhlükəsizlik şəbəkəsi).
- Bütün OpenAI xətalarını aydın, azərbaycanca `AIServiceError`-a çevirir — xam
  ingiliscə OpenAI mesajı heç vaxt istifadəçiyə çıxmır.
"""
import logging

from openai import (
    APIConnectionError,
    APIStatusError,
    AuthenticationError,
    BadRequestError,
    NotFoundError,
    OpenAI,
    PermissionDeniedError,
    RateLimitError,
)

logger = logging.getLogger(__name__)


class AIServiceError(Exception):
    """AI service layer-də bütün xətalar (API, şəbəkə, JSON parsing) üçün."""

    pass


def model_supports_temperature(model: str) -> bool:
    """
    Reasoning modelləri (gpt-5*, o1*, o3*, o4*) `chat.completions`-də yalnız
    default temperature=1 qəbul edir. Yalnız açıq-aşkar dəstəkləyən modellərə
    (gpt-4o, gpt-4.1, gpt-3.5, *-chat variantları) temperature göndəririk.

    Qeyd: gpt-5-chat / gpt-5.x-chat kimi "chat" variantları temperature
    dəstəkləyir, ona görə onları istisna edirik.
    """
    m = (model or "").lower()
    if "-chat" in m or m.endswith("chat-latest"):
        return True
    if m.startswith(("gpt-5", "o1", "o3", "o4")):
        return False
    return True


def _reasoning_effort_for(model: str):
    """gpt-5 reasoning modelləri üçün aşağı effort — sürət və xərc üçün."""
    m = (model or "").lower()
    if m.startswith("gpt-5") and "-chat" not in m:
        return "low"
    return None


def _is_param_error(exc: BadRequestError) -> bool:
    """400-ün temperature/reasoning_effort kimi bir parametrə görə olduğunu təxmin edir."""
    text = str(getattr(exc, "message", "") or exc).lower()
    return any(
        kw in text
        for kw in ("temperature", "reasoning", "unsupported value", "unsupported parameter")
    )


def create_completion(client: OpenAI, model_candidates, *, temperature=None, **kwargs):
    """
    `client.chat.completions.create()`-i model-aware şəkildə çağırır.

    Parametrlər
    -----------
    client : OpenAI
    model_candidates : list[str]
        Sıra ilə sınanacaq modellər (əsas model + fallback-lar).
    temperature : float | None
        Yalnız dəstəkləyən modellərə göndərilir; digərlərinə göndərilmir.
    **kwargs :
        messages, response_format və s. — birbaş ötürülür.
    """
    last_exc = None
    for model in model_candidates:
        call_kwargs = dict(kwargs)
        if temperature is not None and model_supports_temperature(model):
            call_kwargs["temperature"] = temperature
        effort = _reasoning_effort_for(model)
        if effort is not None:
            call_kwargs.setdefault("reasoning_effort", effort)

        try:
            return client.chat.completions.create(model=model, **call_kwargs)
        except (PermissionDeniedError, NotFoundError) as exc:
            logger.warning("OpenAI: model '%s' əlçatan deyil, növbəti sınanır.", model)
            last_exc = exc
            continue
        except BadRequestError as exc:
            # Model gözlənilmədən bir parametri qəbul etmədi. temperature/
            # reasoning_effort atıb eyni modeli bir dəfə yenidən sınayırıq.
            stripped = {
                k: v for k, v in call_kwargs.items()
                if k not in ("temperature", "reasoning_effort")
            }
            if _is_param_error(exc) and stripped != call_kwargs:
                logger.warning(
                    "OpenAI: '%s' parametri qəbul etmədi (%s); temperature/"
                    "reasoning_effort atılıb yenidən sınanır.",
                    model, exc,
                )
                try:
                    return client.chat.completions.create(model=model, **stripped)
                except Exception as exc2:  # noqa: BLE001
                    logger.warning("OpenAI: '%s' təkrar cəhd də alınmadı.", model)
                    last_exc = exc2
                    continue
            logger.exception("OpenAI — yanlış sorğu (400).")
            last_exc = exc
            continue
        except AuthenticationError as exc:
            logger.exception("OpenAI autentifikasiya xətası")
            raise AIServiceError(
                "Süni intellekt xidmətinə qoşulma alınmadı (autentifikasiya xətası)."
            ) from exc
        except RateLimitError as exc:
            logger.exception("OpenAI rate limit xətası")
            raise AIServiceError(
                "Süni intellekt xidməti hazırda həddindən artıq yüklənib. "
                "Bir az sonra yenidən cəhd et."
            ) from exc
        except APIConnectionError as exc:
            logger.exception("OpenAI-a şəbəkə bağlantısı alınmadı")
            raise AIServiceError(
                "Süni intellekt xidməti ilə şəbəkə bağlantısı qurulmadı."
            ) from exc
        except APIStatusError as exc:
            logger.exception("OpenAI xidmətindən xəta cavabı")
            raise AIServiceError(
                "Süni intellekt xidmətindən naməlum xəta cavabı alındı."
            ) from exc

    logger.error(
        "OpenAI: bütün konfiqurasiya olunmuş modellər (%s) əlçatan deyil.",
        ", ".join(model_candidates),
    )
    raise AIServiceError(
        "Süni intellekt xidmətinə giriş hazırda mövcud deyil (model əlçatan deyil). "
        "Zəhmət olmasa daha sonra yenidən cəhd et."
    ) from last_exc
