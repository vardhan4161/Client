# Quick Start Guide

## ⚠️ PostgreSQL Not Detected

PostgreSQL is not installed on your system. You have two options:

### Option 1: Install PostgreSQL (Recommended for Full Functionality)

1. **Download PostgreSQL**: https://www.postgresql.org/download/windows/
2. **Install** and set password for `postgres` user
3. **Create database**:
   ```bash
   createdb hire_db
   ```
4. **Run schema**:
   ```bash
   psql -d hire_db -f server/db/schema.sql
   ```

### Option 2: Run Without Database (Limited Functionality)

The servers will start but database operations will fail. You can:
- View the UI
- Test frontend components
- See API endpoints (they will return errors without DB)

## 🚀 Running the Application

### Backend Server
```bash
cd server
npm run dev
```
Server will run on: http://localhost:5000

### Frontend Server
```bash
cd client
npm run dev
```
Frontend will run on: http://localhost:5173

## 📝 Next Steps

1. Install PostgreSQL if you want full functionality
2. Update `server/.env` with your database credentials
3. Run the schema to create tables
4. Restart the servers

## 🔗 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

---

**Starting servers now...**
