from django.db.models import Avg
from rest_framework import serializers

from career.models import UserAssessment

from .models import (
    Mentor,
    MentorApplication,
    MentorRequest,
    MentorWtpOption,
    Review,
)


class MentorSerializer(serializers.ModelSerializer):
    """GET /api/mentors/ və GET /api/mentors/<id>/ — mentor kartı."""

    id = serializers.CharField(read_only=True)
    fullName = serializers.CharField(source="name", read_only=True)
    title = serializers.SerializerMethodField()
    avatarUrl = serializers.URLField(source="avatar_url", read_only=True)
    coverUrl = serializers.URLField(source="cover_url", read_only=True)
    countryFlag = serializers.CharField(source="country_flag", read_only=True)
    rating = serializers.SerializerMethodField()
    reviewCount = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    priceUnit = serializers.CharField(source="price_unit", read_only=True)
    tags = serializers.SlugRelatedField(
        slug_field="name",
        many=True,
        read_only=True,
    )
    skills = serializers.SlugRelatedField(
        slug_field="name",
        many=True,
        read_only=True,
    )
    stats = serializers.SerializerMethodField()
    discountPrice = serializers.SerializerMethodField()
    isFree = serializers.BooleanField(source="is_free", read_only=True)

    class Meta:
        model = Mentor
        fields = [
            "id",
            "fullName",
            "title",
            "company",
            "avatarUrl",
            "coverUrl",
            "country",
            "countryFlag",
            "rating",
            "reviewCount",
            "price",
            "priceUnit",
            "tags",
            "category",
            "bio",
            "skills",
            "stats",
            "discountPrice",
            "isFree",
        ]
        read_only_fields = fields

    def get_title(self, obj):
        return obj.title or obj.expertise

    def get_rating(self, obj):
        average = getattr(obj, "average_rating", None)
        if average is None:
            average = obj.reviews.aggregate(value=Avg("rating"))["value"]
        return round(float(average), 1) if average is not None else 5.0

    def get_reviewCount(self, obj):
        count = getattr(obj, "review_count", None)
        return count if count is not None else obj.reviews.count()

    def get_price(self, obj):
        return float(obj.price)

    def get_stats(self, obj):
        return {
            "sessions": obj.stat_sessions,
            "years": obj.stat_years,
            "students": obj.stat_students,
            "satisfaction": obj.stat_satisfaction,
        }

    def get_discountPrice(self, obj):
        return float(obj.discount_price) if obj.discount_price is not None else None


class ReviewSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    authorName = serializers.CharField(source="author_name", read_only=True)
    authorTitle = serializers.CharField(source="author_title", read_only=True)
    authorAvatarUrl = serializers.URLField(source="author_avatar_url", read_only=True)
    date = serializers.DateTimeField(
        source="created_at",
        format="%d %b, %H:%M",
        read_only=True,
    )

    class Meta:
        model = Review
        fields = [
            "id",
            "authorName",
            "authorTitle",
            "authorAvatarUrl",
            "topic",
            "rating",
            "date",
            "comment",
        ]
        read_only_fields = fields


class MentorApplicationSerializer(serializers.ModelSerializer):
    """Application contract; review status can only be changed in Django admin."""

    id = serializers.CharField(read_only=True)
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    fullName = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    professionalField = serializers.CharField(source="professional_field")
    experienceYears = serializers.IntegerField(source="experience_years")
    targetMenteeTypes = serializers.ListField(
        source="target_mentee_types",
        child=serializers.CharField(max_length=100, trim_whitespace=True),
        allow_empty=False,
    )
    offeredServices = serializers.ListField(
        source="offered_services",
        child=serializers.CharField(max_length=100, trim_whitespace=True),
        allow_empty=False,
    )
    sessionTypes = serializers.ListField(
        source="session_types",
        child=serializers.CharField(max_length=100, trim_whitespace=True),
        allow_empty=False,
    )
    paymentPreference = serializers.CharField(source="payment_preference")
    submittedAt = serializers.DateTimeField(source="submitted_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)
    skills = serializers.ListField(
        child=serializers.CharField(max_length=100, trim_whitespace=True),
        allow_empty=False,
    )

    class Meta:
        model = MentorApplication
        fields = [
            "id",
            "user",
            "fullName",
            "email",
            "avatar",
            "professionalField",
            "seniority",
            "experienceYears",
            "skills",
            "linkedin",
            "country",
            "motivation",
            "targetMenteeTypes",
            "offeredServices",
            "sessionTypes",
            "paymentPreference",
            "status",
            "submittedAt",
            "updatedAt",
        ]
        read_only_fields = ["id", "status", "submittedAt", "updatedAt"]

    def validate(self, attrs):
        request = self.context.get("request")
        user = attrs.get("user") or getattr(request, "user", None)
        if (
            self.instance is None
            and user is not None
            and MentorApplication.objects.filter(user=user).exists()
        ):
            raise serializers.ValidationError(
                {"detail": "You have already submitted a mentor application."}
            )
        return attrs


class MentorRequestSerializer(serializers.ModelSerializer):
    """
    POST /api/mentors/requests/ — "Request mentor help" forması.

    Validasiya qaydaları:
    - mentor verilərsə aktiv olmalıdır;
    - willingness_to_pay='custom' → custom_amount məcburidir (əksi qadağan);
    - anonim istifadəçi üçün contact_info hər zaman məcburidir; doğrulanmış
      istifadəçi boş göndərsə email-i avtomatik götürülür.
    """

    mentor_id = serializers.PrimaryKeyRelatedField(
        source="mentor",
        queryset=Mentor.objects.filter(active=True),
        required=False,
        allow_null=True,
        write_only=True,
    )
    assessment_id = serializers.PrimaryKeyRelatedField(
        source="assessment",
        queryset=UserAssessment.objects.all(),
        required=False,
        allow_null=True,
        write_only=True,
    )
    mentor_name = serializers.CharField(source="mentor.name", read_only=True, default=None)
    contact_info = serializers.CharField(max_length=255, required=False, allow_blank=True)

    class Meta:
        model = MentorRequest
        fields = [
            "id",
            "mentor_id",
            "mentor_name",
            "assessment_id",
            "recommended_it_branch",
            "topic",
            "preferred_format",
            "willingness_to_pay",
            "custom_amount",
            "contact_info",
            "created_at",
        ]
        read_only_fields = ["id", "recommended_it_branch", "created_at"]

    def validate_topic(self, value):
        value = value.strip()
        if len(value) < 5:
            raise serializers.ValidationError("Mövzu ən az 5 simvol olmalıdır.")
        if len(value) > 2000:
            raise serializers.ValidationError("Mövzu 2000 simvoldan uzun ola bilməz.")
        return value

    def validate(self, attrs):
        wtp = attrs.get("willingness_to_pay", MentorWtpOption.NO)
        custom_amount = attrs.get("custom_amount")

        if wtp == MentorWtpOption.CUSTOM:
            if custom_amount is None:
                raise serializers.ValidationError(
                    {"custom_amount": "Custom seçildikdə məbləğ göndərilməlidir."}
                )
            if custom_amount <= 0:
                raise serializers.ValidationError(
                    {"custom_amount": "Məbləğ 0-dan böyük olmalıdır."}
                )
        elif custom_amount is not None:
            raise serializers.ValidationError(
                {"custom_amount": "custom_amount yalnız willingness_to_pay='custom' olduqda göndərilməlidir."}
            )

        request = self.context.get("request")
        contact = (attrs.get("contact_info") or "").strip()
        if not contact:
            if request is not None and request.user.is_authenticated:
                attrs["contact_info"] = request.user.email
            else:
                raise serializers.ValidationError(
                    {"contact_info": "Anonim sorğuda əlaqə məlumatı (email/telefon/telegram) tələb olunur."}
                )
        else:
            attrs["contact_info"] = contact
        return attrs

    def create(self, validated_data):
        assessment = validated_data.get("assessment")
        branch = ""
        if assessment is not None and assessment.final_result:
            fr = assessment.final_result
            branch = fr.get("recommended_branch") or fr.get("top_domain") or ""

        request = self.context["request"]
        return MentorRequest.objects.create(
            user=request.user if request.user.is_authenticated else None,
            recommended_it_branch=branch,
            **{k: v for k, v in validated_data.items() if k != "user"},
        )
