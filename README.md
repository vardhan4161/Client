# TalentSetu.ai 🦉
**The Intelligent Bridge to Talent**

TalentSetu.ai is a modern AI-powered recruitment platform that automates candidate screening through an intelligent chatbot interface and Gemini AI-driven candidate analysis.

## 🎯 Features

- **Automated Chatbot Screening** — Job-specific chatbot collects candidate information step-by-step
- **Gemini AI Matching** — Deep resume analysis with match scores, strengths, and gap analysis
- **Recruiter Dashboard** — Manage jobs, review candidates, update application statuses
- **Candidate Database** — Searchable profiles with filters by status/skills
- **Resume Insight** — Automated skill extraction and verification via AI

## 🛠 Tech Stack

### Frontend
- React 19 + Vite
- Tailwind CSS
- React Router v7
- Axios
- Lucide React (Icons)

### Backend
- Node.js + Express
- **MongoDB** (Mongoose ODM) — with in-memory fallback for development
- JWT Authentication (bcryptjs + jsonwebtoken)
- Multer (File Upload)
- Google Gemini AI (`@google/generative-ai`)
- Joi (input validation)

## 📋 Prerequisites

- Node.js v18+
- npm or yarn
- A MongoDB instance (local, Atlas, or leave blank to use the built-in in-memory fallback)
- A Google Gemini API key (get one free at [makersuite.google.com](https://makersuite.google.com))

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/vardhan4161/Client
cd Client
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory (copy from `.env.example`):
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri_here
JWT_SECRET=your_long_random_secret_here
NODE_ENV=development
UPLOAD_DIR=./uploads
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
```

> **Tip**: Leave `MONGODB_URI` pointing to a local or Atlas instance. If the connection fails, the server automatically falls back to an in-memory MongoDB database (data is lost on restart).

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in `client/` (copy from `.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## 🎮 Usage

### For Recruiters

1. **Register / Login** — Create an account at `/register`
2. **Create a Job** — Click "New Posting" on the dashboard; add title, description, required skills, notice period, CTC range, and preferred location
3. **Share the Link** — Copy the application link (e.g. `/apply/<jobId>`) and share on LinkedIn / WhatsApp
4. **Review Candidates** — Click "View Candidates" to see applicants ranked by AI match score
5. **Manage Applications** — Shortlist, hold, reject, or hire candidates with one click

### For Candidates

1. **Open Link** — Click the job application link shared by the recruiter
2. **Complete Chatbot** — Answer questions step-by-step (name, experience, CTC, location, skills)
3. **Upload Resume** — Upload your resume (PDF/DOC/DOCX, max 5 MB)
4. **Submit** — Receive a confirmation with your AI match score

## 📁 Project Structure

```
HRM/
├── server/
│   ├── controllers/      # Business logic (auth, jobs, applications, upload)
│   ├── routes/           # Express route definitions
│   ├── middleware/        # JWT auth & Joi validation
│   ├── models/           # Mongoose schemas (User, Job, Candidate, Application)
│   ├── services/         # Gemini AI service
│   ├── utils/            # Resume parser (PDF + DOCX)
│   ├── db/               # MongoDB connection (with in-memory fallback)
│   └── index.js          # Entry point
├── client/
│   ├── src/
│   │   ├── pages/        # Login, Register, Dashboard, Candidates, ChatbotApplication
│   │   ├── context/      # AuthContext (JWT storage)
│   │   ├── services/     # Axios API client
│   │   ├── config/       # Chatbot step definitions
│   │   └── App.jsx       # Router + protected routes
│   └── public/
├── render.yaml           # Render deployment config
└── docs/
```

## 🔒 Security Features

- JWT-based authentication with `Bearer` token scheme
- Password hashing with bcrypt (10 rounds)
- Joi input validation on all routes
- File type validation (PDF/DOC/DOCX only, 5 MB max)
- Upload endpoint rate-limited (10 requests per 15 min per IP)
- CORS restricted to the configured `FRONTEND_URL`

## 📊 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | - | Register recruiter |
| POST | `/api/auth/login` | - | Login |

### Jobs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/jobs` | ✅ | Create job |
| GET | `/api/jobs` | ✅ | Get recruiter's jobs |
| GET | `/api/jobs/:id` | - | Get job details (public) |
| PUT | `/api/jobs/:id/status` | ✅ | Update job status |

### Applications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/applications/submit` | - | Submit application (public) |
| GET | `/api/applications/candidates?jobId=:id` | ✅ | Get candidates for a job |
| PATCH | `/api/applications/:id/status` | ✅ | Update candidate status |

### Upload
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/upload` | Rate-limited | Upload resume (PDF/DOC/DOCX) |

## 🚢 Deployment on Render

1. Push to GitHub
2. Create a new **Blueprint** in Render and link your repo — the `render.yaml` is pre-configured
3. Set the following secret env vars in the Render dashboard:
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `GEMINI_API_KEY` — your Google Gemini API key
4. Render will auto-deploy both the API and the static frontend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Submit a pull request

## 📝 License

MIT License

---

**Built with ❤️ and 🤖 AI**
