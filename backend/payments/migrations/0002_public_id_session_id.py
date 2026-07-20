# Payments 0002 — public_id (IDOR fix) + session_id (anonim claiming).
#
# `public_id` unique olduğu üçün mövcud sətirlərə callable default ilə
# birbaşa əlavə etmək təhlükəlidir (Django-nun öz xəbərdarlığı). Ona görə
# standart 3 addım tətbiq olunur:
#   1) sahəni nullable, unique-siz əlavə et,
#   2) mövcud sətirləri unikal UUID-lərlə doldur (data migration),
#   3) unique + not-null məhdudiyyətini qoy.
import uuid

from django.db import migrations, models


def backfill_public_ids(apps, schema_editor):
    WillingnessToPay = apps.get_model("payments", "WillingnessToPay")
    to_update = []
    for wtp in WillingnessToPay.objects.filter(public_id__isnull=True).iterator():
        wtp.public_id = uuid.uuid4()
        to_update.append(wtp)
    if to_update:
        WillingnessToPay.objects.bulk_update(to_update, ["public_id"], batch_size=500)


class Migration(migrations.Migration):

    dependencies = [
        ("payments", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="willingnesstopay",
            name="public_id",
            field=models.UUIDField(null=True, editable=False, db_index=True),
        ),
        migrations.AddField(
            model_name="willingnesstopay",
            name="session_id",
            field=models.UUIDField(
                blank=True,
                db_index=True,
                help_text=(
                    "Anonim frontend session UUID-i — istifadəçi sonradan login/register "
                    "etdikdə bu qeyd avtomatik ona bağlanır (accounts.views._claim_*)."
                ),
                null=True,
            ),
        ),
        migrations.RunPython(backfill_public_ids, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="willingnesstopay",
            name="public_id",
            field=models.UUIDField(
                default=uuid.uuid4,
                editable=False,
                unique=True,
                db_index=True,
                help_text=(
                    "API-də istifadə olunan təxminedilməz açar. Ardıcıl integer id "
                    "AllowAny endpointlərdə IDOR (başqasının qeydini sadalamaqla tapmaq) "
                    "riski yaratdığı üçün bütün public lookup-lar bu UUID ilə aparılır."
                ),
            ),
        ),
    ]
