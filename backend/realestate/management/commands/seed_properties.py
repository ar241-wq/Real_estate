"""
Management command to seed the database with sample properties.
"""

import os
import urllib.request
from io import BytesIO
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from PIL import Image as PILImage
from realestate.models import Property, PropertyImage


class Command(BaseCommand):
    help = 'Seed the database with sample properties'

    def create_placeholder_image(self, width, height, color, text):
        """Create a placeholder image with text."""
        img = PILImage.new('RGB', (width, height), color=color)
        return img

    def handle(self, *args, **options):
        self.stdout.write('Seeding properties...')

        # Clear existing data
        PropertyImage.objects.all().delete()
        Property.objects.all().delete()

        # Sample properties data
        properties_data = [
            {
                'title': 'Modern Downtown Penthouse',
                'status': 'BUY',
                'price': 1250000,
                'currency': 'USD',
                'location_text': 'Downtown, New York',
                'address': '123 Fifth Avenue, Suite PH1, New York, NY 10010',
                'bedrooms': 3,
                'bathrooms': 2,
                'size_sqm': 185,
                'description': '''Stunning penthouse apartment in the heart of downtown Manhattan. This luxurious residence features floor-to-ceiling windows with breathtaking city views, a gourmet kitchen with top-of-the-line appliances, and a spacious open-plan living area.

The master suite includes a walk-in closet and spa-like bathroom with soaking tub. Building amenities include 24-hour doorman, fitness center, and rooftop terrace.

Perfect for those seeking the ultimate urban lifestyle with easy access to world-class dining, shopping, and entertainment.''',
                'latitude': 40.7410,
                'longitude': -73.9897,
                'featured': True,
                'agent_name': 'Sarah Johnson',
                'agent_phone': '+1 (212) 555-0123',
                'agent_email': 'sarah.johnson@realestate.com',
                'image_colors': ['#2C3E50', '#34495E', '#1ABC9C'],
            },
            {
                'title': 'Cozy Family Home with Garden',
                'status': 'BUY',
                'price': 485000,
                'currency': 'USD',
                'location_text': 'Brooklyn Heights, Brooklyn',
                'address': '456 Garden Street, Brooklyn, NY 11201',
                'bedrooms': 4,
                'bathrooms': 3,
                'size_sqm': 220,
                'description': '''Charming family home in the sought-after Brooklyn Heights neighborhood. This beautifully maintained property offers generous living spaces, a fully equipped kitchen, and a private backyard garden perfect for entertaining.

Features include hardwood floors throughout, original architectural details, updated systems, and a finished basement ideal for a home office or playroom.

Located on a tree-lined street within walking distance to excellent schools, parks, and the Brooklyn Heights Promenade.''',
                'latitude': 40.6960,
                'longitude': -73.9936,
                'featured': True,
                'agent_name': 'Michael Chen',
                'agent_phone': '+1 (718) 555-0456',
                'agent_email': 'michael.chen@realestate.com',
                'image_colors': ['#27AE60', '#2ECC71', '#16A085'],
            },
            {
                'title': 'Luxury Waterfront Apartment',
                'status': 'RENT',
                'price': 4500,
                'currency': 'USD',
                'location_text': 'Williamsburg, Brooklyn',
                'address': '789 River Road, Apt 12B, Brooklyn, NY 11249',
                'bedrooms': 2,
                'bathrooms': 2,
                'size_sqm': 110,
                'description': '''Experience waterfront living at its finest in this stunning Williamsburg apartment. Enjoy unobstructed views of the East River and Manhattan skyline from your private balcony.

This modern unit features an open kitchen with premium finishes, in-unit washer/dryer, and smart home technology. The building offers a rooftop pool, state-of-the-art gym, and residents lounge.

Minutes from the Bedford L train and surrounded by the best cafes, restaurants, and boutiques Williamsburg has to offer.''',
                'latitude': 40.7081,
                'longitude': -73.9571,
                'featured': True,
                'agent_name': 'Emily Rodriguez',
                'agent_phone': '+1 (347) 555-0789',
                'agent_email': 'emily.rodriguez@realestate.com',
                'image_colors': ['#3498DB', '#2980B9', '#1ABC9C'],
            },
            {
                'title': 'Prime Commercial Space',
                'status': 'COMMERCIAL',
                'price': 15000,
                'currency': 'USD',
                'location_text': 'Midtown, Manhattan',
                'address': '350 Madison Avenue, Ground Floor, New York, NY 10017',
                'bedrooms': 0,
                'bathrooms': 2,
                'size_sqm': 300,
                'description': '''Premium retail/office space in the heart of Midtown Manhattan with exceptional foot traffic and visibility. This versatile ground-floor unit features high ceilings, large display windows, and flexible floor plan suitable for various commercial uses.

The space is delivered white-box ready with new HVAC, electrical, and plumbing systems. Ideal for flagship retail, showroom, professional services, or restaurant concepts.

Located steps from Grand Central Terminal with excellent subway access and surrounded by Fortune 500 headquarters.''',
                'latitude': 40.7549,
                'longitude': -73.9765,
                'featured': False,
                'agent_name': 'David Park',
                'agent_phone': '+1 (212) 555-0321',
                'agent_email': 'david.park@realestate.com',
                'image_colors': ['#9B59B6', '#8E44AD', '#7D3C98'],
            },
            {
                'title': 'New Development Studio',
                'status': 'DEVELOPMENT',
                'price': 695000,
                'currency': 'USD',
                'location_text': 'Long Island City, Queens',
                'address': 'The Skyline Tower, 45-01 Court Square, Queens, NY 11101',
                'bedrooms': 0,
                'bathrooms': 1,
                'size_sqm': 55,
                'description': '''Be among the first to own in Long Island City\'s newest luxury development. This efficient studio unit maximizes every square foot with floor-to-ceiling windows, custom Italian cabinetry, and integrated appliances.

Building amenities are unmatched: infinity pool with Manhattan views, full-service spa, golf simulator, private dining room, and 24-hour concierge.

Located directly above the Court Square transit hub with access to 7 subway lines. Tax abatement in effect.''',
                'latitude': 40.7472,
                'longitude': -73.9450,
                'featured': True,
                'agent_name': 'Sarah Johnson',
                'agent_phone': '+1 (212) 555-0123',
                'agent_email': 'sarah.johnson@realestate.com',
                'image_colors': ['#E74C3C', '#C0392B', '#A93226'],
            },
        ]

        for prop_data in properties_data:
            image_colors = prop_data.pop('image_colors')

            property_obj = Property.objects.create(**prop_data)
            self.stdout.write(f'  Created property: {property_obj.title}')

            # Create placeholder images
            for i, color in enumerate(image_colors):
                # Create a simple colored placeholder image
                img = PILImage.new('RGB', (800, 600), color=color)
                img_io = BytesIO()
                img.save(img_io, format='JPEG', quality=85)
                img_io.seek(0)

                image_obj = PropertyImage(
                    property=property_obj,
                    alt_text=f'{property_obj.title} - Image {i + 1}',
                    sort_order=i,
                )
                image_obj.image.save(
                    f'property_{property_obj.id}_{i}.jpg',
                    ContentFile(img_io.read()),
                    save=True
                )

        self.stdout.write(self.style.SUCCESS(
            f'Successfully seeded {len(properties_data)} properties with images!'
        ))
