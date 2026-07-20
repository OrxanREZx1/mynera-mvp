from django.urls import path

from .views import (
    ContactSubmissionView,
    ContinueToPaymentView,
    MockPaymentView,
    MyWillingnessToPayListView,
    WillingnessToPayCreateView,
    WillingnessToPayDetailView,
)

# QEYD (breaking change, təhlükəsizlik səbəbilə): əvvəlki <int:pk> marşrutları
# <uuid:public_id> ilə əvəz olunub. Frontend create cavabındakı `public_id`
# sahəsini istifadə etməlidir.
urlpatterns = [
    path("willingness-to-pay/", WillingnessToPayCreateView.as_view(), name="wtp-create"),
    path("my-willingness-to-pay/", MyWillingnessToPayListView.as_view(), name="wtp-my-list"),
    path("<uuid:public_id>/", WillingnessToPayDetailView.as_view(), name="wtp-detail"),
    path(
        "<uuid:public_id>/continue-to-payment/",
        ContinueToPaymentView.as_view(),
        name="wtp-continue-to-payment",
    ),
    path("<uuid:public_id>/mock-payment/", MockPaymentView.as_view(), name="wtp-mock-payment"),
    path("<uuid:public_id>/contact/", ContactSubmissionView.as_view(), name="wtp-contact"),
]
