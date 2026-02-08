# Recruiter Hiring Platform - PRD (MVP)

## 1. Executive Summary
A production-ready recruitment platform that automates candidate screening using an intelligent chatbot and rule-based scoring engine. The goal is to eliminate manual LinkedIn screening and provide recruiters with a prioritized list of qualified candidates.

## 2. Core Features (MVP)

### 2.1 Intelligent Chatbot Intake
- **Web-based Interface**: Mobile-responsive chat UI
- **Dynamic Flow**: JSON-driven conversation logic (`chatbotConfig.js`)
- **Key Data Points**:
  - Personal Info (Name, Email, Phone)
  - Experience (Total, Relevant)
  - Skills (Comma-separated)
  - Compensation (Current/Expected CTC)
  - Notice Period
  - Location
- **Resume Upload**: Integration with backend storage
- **Validation**: Real-time input validation (Regex, numeric ranges)

### 2.2 Auto-Screening Engine
- **5-Factor Scoring Algorithm**:
  1. **Experience (30 pts)**: Relevant vs Required
  2. **Skills (25 pts)**: Keyword matching percentage
  3. **Notice Period (20 pts)**: Immediate joiner bonus
  4. **Budget (15 pts)**: CTC fit
  5. **Location (10 pts)**: Geo-preference match
- **Auto-Status Assignment**:
  - `SHORTLISTED`: Score ≥ 80
  - `HOLD`: Score 60-79
  - `REJECTED`: Score < 45
- **AI Summary**: Auto-generated strengths and red flags

### 2.3 Recruiter Dashboard
- **Candidate List**: Enhanced card view with scores
- **Advanced Filtering**: By Status, Score, Skills
- **Quick Actions**: Shortlist, Hold, Reject, Hire
- **Resume Access**: One-click download
- **Visual Indicators**: Color-coded status and match scores

### 2.4 Candidate Profile (Talent Cloud)
- **Unified View**: All application data in one place
- **History Tracking**: Status changes and recruiter notes
- **Resume Storage**: Secure file access

## 3. Technical Architecture

### 3.1 Stack
- **Frontend**: React + Tailwind CSS (Vite)
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose ODM)
- **Storage**: Local filesystem (MVP) / S3 (Planned)

### 3.2 Key APIs
- `GET /api/jobs/:id`: Fetch job details
- `POST /api/applications`: Submit candidate data
- `GET /api/applications/:jobId`: Fetch candidates (Recruiter only)
- `PATCH /api/applications/:id/status`: Update status
- `POST /api/upload`: Handle resume files

## 4. Success Metrics
- **Screening Time**: < 5 seconds per candidate (Automated)
- **Data Completeness**: 100% structured data capture
- **User Experience**: < 2 minutes to complete application
