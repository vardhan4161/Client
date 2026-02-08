# Git Setup and Push Instructions

## ⚠️ Git Not Installed

Git is not currently installed on your system. Follow these steps to push your project to GitHub.

---

## Step 1: Install Git

1. **Download Git for Windows**: https://git-scm.com/download/win
2. **Run the installer** with default settings
3. **Restart your terminal** after installation

---

## Step 2: Configure Git (First Time Only)

Open PowerShell and run:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## Step 3: Initialize Git Repository

```powershell
cd d:\Hire
git init
git add .
git commit -m "Initial commit: Recruiter Hiring Platform (ATS + Chatbot)"
```

---

## Step 4: Create GitHub Repository

1. Go to https://github.com/new
2. **Repository name**: `recruiter-hiring-platform` (or your choice)
3. **Description**: "Full-stack ATS + Chatbot for automated candidate screening"
4. **Visibility**: Choose Public or Private
5. **DO NOT** initialize with README (we already have one)
6. Click **"Create repository"**

---

## Step 5: Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

```powershell
cd d:\Hire
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual values.

---

## Alternative: Push Without Installing Git

If you don't want to install Git, you can:

### Option 1: Use GitHub Desktop
1. Download: https://desktop.github.com/
2. Install and sign in
3. Click "Add" → "Add existing repository"
4. Select `d:\Hire` folder
5. Click "Publish repository"

### Option 2: Upload via GitHub Web
1. Create a new repository on GitHub
2. Compress the `d:\Hire` folder (excluding `node_modules`, `.env`, `uploads`)
3. Upload the ZIP file to GitHub
4. Extract it in the repository

---

## What Will Be Pushed

Your repository will include:

### Backend (`/server`)
- ✅ Node.js + Express server
- ✅ MongoDB models and controllers
- ✅ Authentication (JWT)
- ✅ File upload handling
- ✅ API routes

### Frontend (`/client`)
- ✅ React application
- ✅ Tailwind CSS styling
- ✅ Recruiter dashboard
- ✅ Chatbot interface
- ✅ Candidate management

### Documentation
- ✅ README.md
- ✅ deployment.md
- ✅ architecture.md
- ✅ prd.md

### Configuration
- ✅ .gitignore (excludes node_modules, .env, uploads)
- ✅ package.json files
- ✅ Environment templates

---

## Files That Will NOT Be Pushed (Excluded by .gitignore)

- ❌ `node_modules/` - Dependencies (will be installed via npm)
- ❌ `.env` - Environment variables (sensitive)
- ❌ `uploads/` - Uploaded files
- ❌ `*.db` - Database files
- ❌ `*.log` - Log files

---

## After Pushing

Once pushed, you can:
1. Share the repository URL with others
2. Clone it on other machines
3. Collaborate with team members
4. Set up CI/CD pipelines
5. Deploy to cloud platforms

---

## Quick Commands Reference

```powershell
# Check Git status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push

# Pull latest changes
git pull

# View commit history
git log --oneline
```

---

## Need Help?

- Git Documentation: https://git-scm.com/doc
- GitHub Guides: https://guides.github.com/
- Git Cheat Sheet: https://education.github.com/git-cheat-sheet-education.pdf

---

**Your project is ready to be pushed!** 🚀

Just install Git and follow the steps above.
