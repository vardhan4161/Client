# System Architecture & API Contracts

## 1. High-Level Architecture

```mermaid
graph TD
    Client[Client (React + Tailwind)] -->|HTTP/REST| Server[Server (Node.js + Express)]
    Server -->|SQL| DB[(PostgreSQL)]
    Server -->|File Upload| Storage[File Storage (Local/Cloud)]
    Recruiter[Recruiter] -->|Uses| Client
    Candidate[Candidate] -->|Uses| Client
```

## 2. Tech Stack
- **Frontend:** React.js, Tailwind CSS, Lucide React (Icons)
- **Backend:** Node.js, Express.js, Multer (File Upload)
- **Database:** PostgreSQL
- **Infrastructure:** Docker

## 3. Database Schema (Conceptual)

### Users (Recruiters)
- `id` (UUID)
- `email` (String, Unique)
- `password_hash` (String)
- `name` (String)
- `created_at` (Timestamp)

### Jobs
- `id` (UUID)
- `recruiter_id` (UUID, FK)
- `title` (String)
- `description` (Text)
- `requirements` (JSONB) - *Stores min exp, max notice period, etc.*
- `status` (Enum: OPEN, CLOSED)
- `created_at` (Timestamp)

### Candidates
- `id` (UUID)
- `name` (String)
- `email` (String)
- `phone` (String)
- `resume_url` (String)
- `skills` (Array<String>)
- `experience_years` (Float)
- `current_ctc` (Float)
- `expected_ctc` (Float)
- `notice_period` (Integer) - *In days*
- `location` (String)
- `created_at` (Timestamp)

### Applications
- `id` (UUID)
- `job_id` (UUID, FK)
- `candidate_id` (UUID, FK)
- `status` (Enum: APPLIED, SHORTLISTED, REJECTED, HIRED)
- `score` (Integer) - *Auto-calculated match score*
- `ai_notes` (Text) - *Summary from chatbot*
- `created_at` (Timestamp)

## 4. API Service Contracts

### Authentication
- `POST /api/auth/register` - Register a new recruiter
- `POST /api/auth/login` - Login recruiter

### Jobs
- `POST /api/jobs` - Create a new job
- `GET /api/jobs` - List all jobs for the recruiter
- `GET /api/jobs/:id` - Get job details (Public for candidates)
- `PUT /api/jobs/:id/status` - Update job status

### Application (Chatbot Flow)
- `POST /api/applications/submit` - Submit candidate application (Chatbot final step)
- `POST /api/upload` - Upload resume file

### Candidates (Recruiter View)
- `GET /api/candidates?job_id=:id` - Get candidates for a specific job
- `PATCH /api/applications/:id/status` - Update application status

## 5. Security & Validation
- **JWT Authentication:** Secure all recruiter endpoints.
- **Input Validation:** Use Joi or Zod for request validation.
- **File Validation:** Check file type (PDF/DOC) and size limit (5MB).
