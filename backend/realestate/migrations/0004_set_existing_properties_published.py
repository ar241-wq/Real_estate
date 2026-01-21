# Generated data migration to set existing properties to PUBLISHED status

from django.db import migrations


def set_existing_properties_published(apps, schema_editor):
    Property = apps.get_model('realestate', 'Property')
    # Update all existing properties that are still in DRAFT status to PUBLISHED
    Property.objects.filter(listing_status='DRAFT').update(listing_status='PUBLISHED')


def reverse_migration(apps, schema_editor):
    # Cannot reliably reverse this migration as we don't know original states
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('realestate', '0003_add_listing_management_fields'),
    ]

    operations = [
        migrations.RunPython(set_existing_properties_published, reverse_migration),
    ]
