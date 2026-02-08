# MVP Test Plan & Verification

## 1. Chatbot Intake Flow
| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| **Mobile Responsiveness** | Open Chatbot on mobile view | UI scales correctly, inputs are accessible | ✅ |
| **Input Validation** | Enter invalid email/phone | Error message shown, cannot proceed | ✅ |
| **Conditional Logic** | Enter experience > total exp | Error: "Relevant experience cannot exceed total" | ✅ |
| **Resume Upload** | Upload PDF/DOCX | File uploads, success indicator shown | ✅ |
| **Submission** | Complete all steps | "Application Submitted" screen, data saved to DB | ✅ |

## 2. Auto-Screening Engine
| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| **Perfect Match** | Submit candidate matching all reqs | Score > 90%, Status: SHORTLISTED | ✅ |
| **Good Match** | Submit candidate matching 80% | Score 70-89%, Status: HOLD | ✅ |
| **Poor Match** | Submit candidate with low exp | Score < 50%, Status: REJECTED | ✅ |
| **AI Summary** | Check candidate details | Strengths/Flags clearly listed (e.g., "⚠️ Notice period") | ✅ |

## 3. Recruiter Dashboard
| Test Case | Steps | Expected Result | Status |
|-----------|-------|-----------------|--------|
| **View Candidates** | Open Job > Candidates | List of applicants loaded with scores | ✅ |
| **Filtering** | Click "SHORTLISTED" filter | Only shortlisted candidates shown | ✅ |
| **Search** | Type skill "React" | Candidates with "React" skill shown | ✅ |
| **Status Update** | Click "Shortlist" button | Status changes, color updates | ✅ |
| **Resume Download** | Click "View Resume" | aResume opens/downloads | ✅ |

## 4. Systems Check
| Component | Check | Status |
|-----------|-------|--------|
| **Database** | PostgreSQL Connection | Connected | ✅ |
| **API** | `/health` endpoint | Returns 200 OK | ✅ |
| **Frontend** | Build process | `npm run build` succeeds | ✅ |
