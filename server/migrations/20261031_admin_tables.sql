-- Admin Tables & Columns Migration

-- 1. Events Table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  banner_url TEXT,
  category VARCHAR(100) DEFAULT 'General',
  status VARCHAR(50) DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'completed', 'cancelled'
  capacity INTEGER DEFAULT 100,
  registered_count INTEGER DEFAULT 0,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Bans Table
CREATE TABLE IF NOT EXISTS user_bans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  banned_by INTEGER,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'banned', -- 'banned', 'allow'
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 3. Users Table Columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- 4. Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_events_status_date ON events (status, event_date);
CREATE INDEX IF NOT EXISTS idx_user_bans_user_id ON user_bans (user_id);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs (status);

