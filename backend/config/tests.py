from django.test import SimpleTestCase


class ProductionCorsTests(SimpleTestCase):
    def test_preflight_allows_anonymous_session_header(self):
        response = self.client.options(
            "/api/auth/register/",
            HTTP_ORIGIN="https://mynera-mvp.vercel.app",
            HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST",
            HTTP_ACCESS_CONTROL_REQUEST_HEADERS="content-type,x-session-id",
        )

        self.assertEqual(response.status_code, 200)
        allowed_headers = response.headers["access-control-allow-headers"].lower()
        self.assertIn("x-session-id", allowed_headers)


class HealthCheckTests(SimpleTestCase):
    def test_health_check_is_public_and_lightweight(self):
        response = self.client.get("/api/health/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})
