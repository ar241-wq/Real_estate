# Real Estate Website

A production-ready Real Estate website built with Next.js (App Router) + TypeScript + Tailwind CSS for the frontend and Django + Django REST Framework for the backend.

## Features

### Public Pages
- **Home**: Hero section, search bar, featured listings, value proposition
- **Properties**: Filterable listings with grid/map view, pagination
- **Property Details**: Image gallery with lightbox, key facts, agent info, map
- **About Us**: Company story, mission, values, team

### Admin Dashboard
- **Login**: Session-based authentication for staff/superusers
- **Messages**: View, mark read/unread, delete visitor messages
- **Properties**: Full CRUD with image upload and management

### Additional Features
- Floating "Message Admin" widget on all public pages
- Mobile-first responsive design
- SEO-optimized with Next.js metadata
- Rate-limited message submissions
- Image gallery with lightbox and reordering

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Django 4.2, Django REST Framework, Pillow
- **Database**: SQLite (development), ready for PostgreSQL
- **Auth**: Django session authentication with CSRF protection

## Project Structure

```
Real_estate/
├── backend/                 # Django backend
│   ├── config/              # Django project settings
│   ├── realestate/          # Main Django app
│   │   ├── models.py        # Property, PropertyImage, Message
│   │   ├── serializers.py   # DRF serializers
│   │   ├── views.py         # API views
│   │   ├── urls.py          # API routes
│   │   └── management/commands/
│   │       └── seed_properties.py
│   ├── media/               # Uploaded images
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                # Next.js frontend
│   ├── app/                 # App Router pages
│   │   ├── page.tsx         # Home
│   │   ├── about/
│   │   ├── properties/
│   │   │   ├── page.tsx     # Listings
│   │   │   └── [slug]/      # Property details
│   │   └── admin/
│   │       ├── login/
│   │       └── dashboard/
│   │           ├── messages/
│   │           └── properties/
│   ├── components/
│   ├── lib/
│   │   ├── api.ts           # API client
│   │   └── types.ts         # TypeScript interfaces
│   ├── package.json
│   └── tailwind.config.ts
│
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Create a superuser (admin account):
   ```bash
   python manage.py createsuperuser
   ```

6. Seed sample data (5 properties with images):
   ```bash
   python manage.py seed_properties
   ```

7. Start the development server:
   ```bash
   python manage.py runserver
   ```

The backend API will be available at `http://localhost:8000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3003`.

## Environment Variables

### Backend

The backend uses default settings for development. For production, set these in environment variables or update `config/settings.py`:

- `SECRET_KEY`: Django secret key
- `DEBUG`: Set to `False` in production
- `ALLOWED_HOSTS`: List of allowed hosts
- `CORS_ALLOWED_ORIGINS`: Frontend URLs

### Frontend

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties/` | List properties with filters |
| GET | `/api/properties/<slug>/` | Get property details |
| POST | `/api/messages/` | Submit contact message |

### Query Parameters for `/api/properties/`

- `status`: BUY, RENT, COMMERCIAL, DEVELOPMENT
- `q`: Search in title and location
- `location`: Filter by location
- `min_price`, `max_price`: Price range
- `bedrooms`: Number of bedrooms
- `min_size`, `max_size`: Size range in sqm
- `featured`: true/false
- `ordering`: price, -price, created_at, -created_at
- `page`, `page_size`: Pagination

### Admin Endpoints (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/csrf/` | Get CSRF token |
| POST | `/api/admin/login/` | Admin login |
| POST | `/api/admin/logout/` | Admin logout |
| GET | `/api/admin/me/` | Get current user info |
| GET/POST | `/api/admin/properties/` | List/Create properties |
| GET/PUT/DELETE | `/api/admin/properties/<id>/` | Property CRUD |
| GET/POST | `/api/admin/properties/<id>/images/` | Manage images |
| POST | `/api/admin/properties/<id>/images/reorder/` | Reorder images |
| GET | `/api/admin/messages/` | List messages |
| POST | `/api/admin/messages/<id>/mark_read/` | Mark as read |
| DELETE | `/api/admin/messages/<id>/` | Delete message |

## Admin Access

1. Navigate to `http://localhost:3003/admin/login`
2. Login with your superuser credentials
3. Access the dashboard to manage properties and messages

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3003`
- `http://127.0.0.1:3003`

Credentials (cookies) are included in requests for session authentication.

## Media Files

In development, media files are served from the `/media/` URL.

For production with S3:
1. Install `django-storages` and `boto3`
2. Configure S3 settings in `config/settings.py`
3. Update `DEFAULT_FILE_STORAGE`

## Production Deployment

### Backend
1. Set `DEBUG=False`
2. Configure proper `SECRET_KEY`
3. Set up PostgreSQL database
4. Configure static file serving (WhiteNoise or S3)
5. Set up HTTPS and update CORS/CSRF settings

### Frontend
1. Update `NEXT_PUBLIC_API_BASE_URL` to production API
2. Build: `npm run build`
3. Deploy to Vercel, Netlify, or self-host

## License

This project is for demonstration purposes.
