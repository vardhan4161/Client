# Product Requirement Document (PRD) - Recruiter Hiring Platform

## 1. Introduction
The Recruiter Hiring Platform is a web-based tool designed to streamline the recruitment process. It allows recruiters to create job openings, share unique application links, and automatically screen candidates via a chatbot interface. The system eliminates manual screening and builds a reusable candidate database.

## 2. Goals
- **Automate Screening:** Reduce manual effort in initial candidate screening.
- **Centralize Data:** Create a structured database of candidates.
- **Improve Experience:** Provide a seamless, mobile-friendly application process for candidates.

## 3. User Personas
- **Recruiter:** Creates jobs, views applications, manages candidates.
- **Candidate:** Applies for jobs via the chatbot link.

## 4. Functional Requirements

### Phase 1: Automated Chatbot
- **Job-Specific Flow:** Chatbot asks questions relevant to the specific job.
- **Mandatory Fields:**
    - Total Experience
    - Relevant Experience
    - Current CTC
    - Expected CTC
    - Current Location
    - Notice Period
    - Resume Upload (PDF/DOC)
- **Auto-Rejection:** Automatically flag candidates who don't meet minimum criteria (e.g., notice period > 60 days).
- **Confirmation:** Display a success message upon completion.

### Phase 2: Candidate Profile System
- **Profile Creation:** Automatically create profiles from chatbot data.
- **Data Storage:** Store all candidate details and resume links.
- **Search & Filter:** Recruiters can filter candidates by skills, experience, and location.

### Phase 3: Recruiter Dashboard
- **Job Management:** Create, edit, and close job openings.
- **Application Links:** Generate unique links for each job.
- **Applicant View:** View list of applicants per job with status (Shortlisted, Rejected, Hold).
- **Resume Download:** Download candidate resumes.

## 5. Non-Functional Requirements
- **Performance:** Chatbot should load within 2 seconds.
- **Security:** Secure resume uploads and data encryption.
- **Reliability:** 99.9% uptime.
- **Scalability:** Handle concurrent users during high-traffic periods.

## 6. Success Metrics
- Number of applications processed explicitly via the chatbot.
- Reduction in time-to-hire.
- Recruiter satisfaction score.
