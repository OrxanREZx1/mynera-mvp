# Yolum IT — quraşdırma və "PostCSS" xətasının həlli

## 1. Gördüyün xəta nə idi?

```
Loading PostCSS Plugin failed: Cannot find module '...node_modules\util-deprecate\node.js'
```

Bu **kod xətası DEYİL**. `util-deprecate` PostCSS/Tailwind-in dərin asılılığıdır
(transitive dependency). Xəta o deməkdir ki, sənin `node_modules` qovluğun
**yarımçıq / zədələnmiş** quraşdırılıb — paketin `package.json`-u var, amma
göstərdiyi `node.js` faylı yoxdur.

Adətən səbəb: yarımçıq qalan `npm install`, antivirus/OneDrive-ın faylı
kilidləməsi, yaxud `Downloads` qovluğunda quraşdırma. Bu layihənin özü
qüsursuzdur — mən sandbox-da təmiz `npm install` + `vite build` etdim,
**hər şey uğurla quruldu** (`✓ built in 4.24s`).

## 2. Həll (Windows PowerShell / CMD)

`frontend/yolum-frontend` qovluğunda:

```powershell
# 1. Zədələnmiş node_modules və köhnə lock faylını sil
rmdir /s /q node_modules
del package-lock.json    # (bu zip-də təzə, işlək lock var — onu saxlaya bilərsən)

# 2. npm keşini təmizlə
npm cache clean --force

# 3. Təmiz quraşdır
npm install

# 4. İşə sal
npm run dev
```

> **Tövsiyə:** Layihəni `C:\Users\...\Downloads\` içində yox, məsələn
> `C:\dev\yolum\` kimi qısa yolda saxla. OneDrive/antivirus fayl kilidləri
> `node_modules`-u tez-tez zədələyir.
>
> Əgər bu zip-dəki `package-lock.json`-u saxlasan, `npm install` əvəzinə
> `npm ci` işlət — bu, dəqiq yoxlanmış versiyaları quraşdırır və belə
> zədələnmələrin qarşısını alır.

## 3. Backend-i işə salmaq

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt

copy .env.example .env         # sonra .env-i öz açarlarınla doldur
python manage.py migrate
python manage.py seed_sprint_data
python manage.py runserver
```

`.env` faylında **öz** OpenAI açarını və Supabase parolunu yaz
(`.env.example`-dakı `YOUR_...` yer tutucularını əvəz et).

## 4. Bu versiyada nə düzəldilib?

**OpenAI API artıq işləyir.** Əvvəl `.env`-də `gpt-5-mini` modeli var idi;
GPT-5 modelləri `temperature` parametrini qəbul etmir, ona görə Aira chat,
roadmap və karyera testi — hamısı sınırdı. İndi `config/openai_helpers.py`
temperature-i yalnız dəstəkləyən modellərə göndərir və gpt-5 modelləri ilə
düzgün işləyir. `openai` SDK-nı da yenilə:

```bash
pip install -U "openai>=1.99"
```

## 5. Təhlükəsizlik

Əvvəlki zip-dəki `.env`-də canlı OpenAI açarı açıq idi. **Onu OpenAI
dashboard-dan mütləq rotasiya et.** Supabase parolunu da dəyiş. Bu zip-ə
real `.env` daxil edilməyib (yalnız `.env.example`) — yəni öz işlək
`.env`-inin üstünü yazmır.
