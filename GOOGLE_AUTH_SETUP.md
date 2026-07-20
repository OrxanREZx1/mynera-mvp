# Google Authentication Setup

The Google button uses Google Identity Services in the browser and sends the
signed ID token to Django at `POST /api/auth/google/`. The frontend and backend
must use the same OAuth Web Client ID.

## 1. Create the Google OAuth client

1. Open Google Cloud Console and select the project used by Mynera.
2. Configure the OAuth consent screen for an external application.
3. Add the app name, support email, developer contact, privacy-policy URL and
   production domain.
4. Keep the requested identity data limited to the basic profile and email.
5. Publish the consent screen before the public stand demo. In testing mode,
   only explicitly added test users can authenticate.
6. Go to **APIs & Services → Credentials → Create credentials → OAuth client ID**.
7. Select **Web application**.
8. Add these authorized JavaScript origins:
   - `http://localhost:5173`
   - The exact stable Vercel production origin, for example
     `https://mynera-mvp.vercel.app`

Origins must not include a path or trailing API route. Add a preview domain
separately only when that exact preview deployment must support Google login.

## 2. Configure local development

Set the same public client ID in both files:

`frontend/yolum-frontend/.env`

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

`backend/.env`

```env
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Restart both servers after changing the files. Vite reads its environment at
startup/build time.

```powershell
# Terminal 1
cd backend
.\venv\Scripts\python.exe manage.py runserver

# Terminal 2
cd frontend\yolum-frontend
npm run dev
```

## 3. Configure deployment

- Add `VITE_GOOGLE_CLIENT_ID` to the Vercel project environment and redeploy the
  frontend.
- Add `GOOGLE_OAUTH_CLIENT_ID` with the same value to the Render service and
  redeploy the backend.
- Confirm that `VITE_API_BASE_URL` points to the Render API URL ending in `/api`.
- Run one new-user and one returning-user login on the final Vercel domain.

## Troubleshooting

- **Google option is visible but reports unavailable:** the frontend Client ID
  is missing; restart or rebuild after adding it.
- **Backend returns `google_not_configured`:** the Render/Django Client ID is
  missing or the backend was not restarted.
- **Google reports an unauthorized origin:** add the exact browser origin to the
  Web Client ID in Google Cloud.
- **Server connection message:** start Django locally or verify
  `VITE_API_BASE_URL` and the Render service status.

The OAuth Client ID is public configuration. Never place an Apple private key,
Google client secret or any other private credential in frontend variables.
