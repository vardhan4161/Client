# PostgreSQL Setup Guide for Windows

## Current Issue
You're seeing "Registration failed" because the backend cannot connect to PostgreSQL database.

## Quick Fix Options

### Option 1: Install PostgreSQL (Recommended - 10 minutes)

1. **Download PostgreSQL**:
   - Go to: https://www.postgresql.org/download/windows/
   - Download PostgreSQL 16 (or latest version)
   - Run the installer

2. **During Installation**:
   - Set password for `postgres` user (remember this!)
   - Default port: 5432 (keep it)
   - Install all components

3. **After Installation**:
   Open PowerShell and run:
   ```powershell
   # Create the database
   & "C:\Program Files\PostgreSQL\16\bin\createdb.exe" -U postgres hire_db
   
   # Run the schema
   & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d hire_db -f "d:\Hire\server\db\schema.sql"
   ```

4. **Update .env file**:
   Edit `d:\Hire\server\.env` and update the DATABASE_URL:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/hire_db
   ```
   Replace `YOUR_PASSWORD` with the password you set during installation.

5. **Restart Backend**:
   - Stop the backend server (Ctrl+C in the terminal)
   - Run `npm run dev` again

### Option 2: Use Docker (Alternative - 5 minutes)

If you have Docker installed:

```powershell
# Run PostgreSQL in Docker
docker run --name hire-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hire_db -p 5432:5432 -d postgres:14

# Wait 10 seconds for it to start
Start-Sleep -Seconds 10

# Run the schema
docker exec -i hire-postgres psql -U postgres -d hire_db < server/db/schema.sql
```

Then restart the backend server.

### Option 3: Use SQLite (Quick Test - 2 minutes)

For quick testing without PostgreSQL, I can modify the backend to use SQLite instead. This is NOT recommended for production but works for testing.

---

## Which option would you like to proceed with?

1. **Install PostgreSQL** (Best for full experience)
2. **Use Docker** (If you have Docker)
3. **Switch to SQLite** (Quick test only)

Let me know and I'll guide you through the steps!
