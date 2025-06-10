# Social Media Platform

A modern social media platform built with Django and React, featuring secure authentication, real-time interactions, and a responsive user interface.

## Features

- 🔐 Secure Authentication System
  - Email verification
  - JWT-based authentication
  - Password reset functionality
  - Rate limiting and brute force protection
  - Session management

- 👤 User Profiles
  - Customizable user profiles
  - Profile picture support
  - User information management
  - Privacy settings

- 💬 Social Features
  - Post creation and sharing
  - Comments and reactions
  - Friend/Connection system
  - Real-time notifications

- 🛡️ Security Features
  - CSRF protection
  - Rate limiting
  - Input validation
  - Secure password handling
  - Session management

## Tech Stack

### Backend
- Django 4.x
- Django REST Framework
- PostgreSQL
- JWT Authentication
- Django Channels (WebSocket support)
- Celery (Task queue)

### Frontend
- React 18
- Vite
- Tailwind CSS
- Redux Toolkit
- React Query
- Socket.io-client

### Development Tools
- Docker
- Git
- ESLint
- Prettier
- Black (Python formatter)

## Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Docker (optional)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/social-media.git
cd social-media
```

2. Set up the backend:
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

4. Start the development servers:

Backend:
```bash
python manage.py runserver
```

Frontend:
```bash
cd frontend
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## API Documentation

The API documentation is available at `/api/docs/` when running the development server.

### Key Endpoints

- Authentication:
  - POST `/api/auth/login/`
  - POST `/api/auth/register/`
  - POST `/api/auth/logout/`
  - POST `/api/auth/password-reset/`

- User Profile:
  - GET `/api/profile/`
  - PATCH `/api/profile/`
  - GET `/api/profile/{id}/`

- Posts:
  - GET `/api/posts/`
  - POST `/api/posts/`
  - GET `/api/posts/{id}/`
  - PUT `/api/posts/{id}/`
  - DELETE `/api/posts/{id}/`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Django REST Framework for the robust API framework
- React team for the amazing frontend library
- All contributors who have helped shape this project

## Support

For support, email support@yourdomain.com or open an issue in the GitHub repository. 