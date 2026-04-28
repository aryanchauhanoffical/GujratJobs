# GujaratJobs - Regional Job Recruitment Platform

A full-stack job recruitment platform focused on Gujarat, India. Connects job seekers with local employers, featuring walk-in interviews, guaranteed hiring badges, and real-time notifications.

## Features

- **Job Seekers**: Browse jobs by city, apply instantly, track applications, find walk-in interviews
- **Recruiters**: Post jobs, manage applicants, shortlist/hire candidates, view dashboard analytics
- **Admin**: Approve recruiters, manage scraped jobs, view platform analytics
- **Real-time**: Socket.io powered notifications
- **Job Scraping**: Apify integration to scrape LinkedIn, Indeed, Naukri for Gujarat jobs

## Tech Stack

**Backend**: Node.js, Express, MongoDB, Socket.io, JWT Auth
**Frontend**: React 18, Tailwind CSS, React Query, Zustand, React Hook Form

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Apify API Key (optional, for job scraping)

### 1. Clone and Install

```bash
git clone <repo>
cd Ideathon

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Environment Variables

```bash
cd server
cp .env.example .env
# Edit .env with your values
```

### 3. Run Development Servers

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

### 4. Docker (Optional)

```bash
docker-compose up --build
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register (jobseeker/recruiter)
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - List all jobs (filters: city, type, salary, experience)
- `POST /api/jobs` - Create job (recruiter only)
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Applications
- `POST /api/applications` - Apply to a job
- `GET /api/applications/my` - My applications
- `GET /api/applications/job/:jobId` - Job applicants (recruiter)
- `PUT /api/applications/:id/status` - Update status

### Recruiters
- `GET /api/recruiter/profile` - Recruiter profile
- `GET /api/recruiter/dashboard` - Dashboard stats
- `PUT /api/recruiter/applicants/:id/hire` - Mark as hired

## Gujarat Cities Supported

Ahmedabad, Surat, Vadodara, Rajkot, Gandhinagar, Bhavnagar, Jamnagar, Junagadh, Anand, Navsari, Morbi, Surendranagar, Mehsana, Bharuch, Porbandar, Amreli, Bhuj, Gondal, Veraval, Botad

## Environment Variables Reference

See `server/.env.example` for all required variables.

## License

MIT