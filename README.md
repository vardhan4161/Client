# TalentSethu 🚀
**The Bridge to Exceptional Talent**

TalentSethu is a modern web-based recruitment platform that automates candidate screening through an intelligent chatbot interface.

## 🎯 Features

- **Automated Chatbot Screening**: Job-specific chatbot that collects candidate information
- **Smart AI Matching**: Intelligent scoring and gap analysis
- **TalentSethu Dashboard**: Manage jobs and review candidates
- **Candidate Database**: Searchable profiles with filtering
- **Resume Insight**: Automated skill extraction and verification

## 🛠 Tech Stack

### Frontend
- React.js with Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React (Icons)

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- Multer (File Upload)

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/vardhan4161/Client
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file in `server/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri_here
JWT_SECRET=your_secret_key_here
NODE_ENV=development
UPLOAD_DIR=./uploads
```
*(Leave MONGODB_URI blank to use the built-in in-memory database fallback)*

Start the backend server:
```bash
npm run dev
```

### 4. Frontend Setup

```bash
cd client
npm install
```

Start the frontend:
```bash
npm run dev
```

## 🎮 Usage

### For Recruiters

1. **Register/Login**: Create an account at `http://localhost:5173/register`
2. **Create Job**: Click "Create Job" on the dashboard
3. **Share Link**: Copy the application link and share on LinkedIn
4. **Review Candidates**: View applicants and their match scores
5. **Manage Applications**: Shortlist, hold, reject, or hire candidates

### For Candidates

1. **Open Link**: Click the job application link shared by recruiter
2. **Complete Chatbot**: Answer questions step-by-step
3. **Upload Resume**: Upload your resume (PDF/DOC)
4. **Submit**: Receive confirmation

## 📁 Project Structure

```
d:/Hire/
├── server/
│   ├── controllers/      # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & validation
│   ├── db/             # Database config & schema
│   └── index.js        # Entry point
├── client/
│   ├── src/
│   │   ├── pages/      # React pages
│   │   ├── context/    # State management
│   │   ├── services/   # API calls
│   │   └── App.jsx     # Main component
│   └── public/
└── docs/               # Documentation
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- File type validation
- File size limits (5MB)
- SQL injection protection
- CORS enabled

## 🧪 Testing

Run backend tests:
```bash
cd server
npm test
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register recruiter
- `POST /api/auth/login` - Login

### Jobs
- `POST /api/jobs` - Create job (Protected)
- `GET /api/jobs` - Get all jobs (Protected)
- `GET /api/jobs/:id` - Get job details (Public)
- `PUT /api/jobs/:id/status` - Update job status (Protected)

### Applications
- `POST /api/applications/submit` - Submit application (Public)
- `GET /api/applications/candidates?jobId=:id` - Get candidates (Protected)
- `PATCH /api/applications/:id/status` - Update status (Protected)

### Upload
- `POST /api/upload` - Upload resume (Public)

## 🎨 UI/UX Highlights

- Gradient backgrounds with modern color palette
- Smooth animations and transitions
- Mobile-responsive design
- Progress indicators in chatbot
- Real-time validation
- Clean, professional ATS-style interface

## 🚢 Deployment

### Docker (Recommended)

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: hire_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - ./server/db/schema.sql:/docker-entrypoint-initdb.d/schema.sql
  
  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/hire_db
    depends_on:
      - db
  
  frontend:
    build: ./client
    ports:
      - "80:80"
```

Run:
```bash
docker-compose up -d
```

### Manual Deployment

1. Build frontend: `cd client && npm run build`
2. Serve static files from `client/dist`
3. Deploy backend to cloud (Heroku, AWS, etc.)
4. Set environment variables
5. Run database migrations

## 🤝 Contributing

This is an autonomous AI-built project. For improvements:
1. Fork the repository
2. Create a feature branch
3. Make changes
4. Submit a pull request

## 📝 License

MIT License

## 🆘 Support

For issues or questions, please create an issue in the repository.

---

**Built autonomously by AI Product Team** 🤖
