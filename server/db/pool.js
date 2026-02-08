const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'hire.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
const initSchema = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      recruiter_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      requirements TEXT DEFAULT '{}',
      status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'DRAFT')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS candidates (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      resume_url TEXT,
      skills TEXT,
      experience_years REAL,
      current_ctc REAL,
      expected_ctc REAL,
      notice_period INTEGER,
      current_location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      job_id TEXT NOT NULL,
      candidate_id TEXT NOT NULL,
      status TEXT DEFAULT 'APPLIED' CHECK (status IN ('APPLIED', 'SHORTLISTED', 'REJECTED', 'HIRED', 'HOLD')),
      match_score INTEGER,
      ai_summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
      UNIQUE(job_id, candidate_id)
    );

    CREATE INDEX IF NOT EXISTS idx_jobs_recruiter ON jobs(recruiter_id);
    CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
    CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications(candidate_id);
  `);

  console.log('✅ SQLite database initialized');
};

initSchema();

// Helper to convert SQLite queries to work like pg
const query = (text, params = []) => {
  try {
    if (text.trim().toUpperCase().startsWith('SELECT') || text.trim().toUpperCase().startsWith('WITH')) {
      const stmt = db.prepare(text);
      const rows = stmt.all(...params);
      return { rows };
    } else {
      const stmt = db.prepare(text + ' RETURNING *');
      const row = stmt.get(...params);
      return { rows: row ? [row] : [] };
    }
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Mock connect for compatibility
const connect = async () => {
  return {
    query: (text, params) => query(text, params),
    release: () => { },
  };
};

module.exports = { query, connect, on: () => { } };
