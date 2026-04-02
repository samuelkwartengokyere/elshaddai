-- COMPLETE SUPABASE SCHEMA for El-Shaddai Revival Centre
-- Run this in Supabase Dashboard > SQL Editor
-- Covers ALL models from src/lib/db.ts

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Update trigger function (shared)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. ADMINS table
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'editor')) DEFAULT 'admin',
  password_hash TEXT,
  profile_image TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_active ON admins(is_active);

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. SETTINGS table
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. EVENTS table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  end_date DATE,
  time TEXT,
  end_time TEXT,
  location TEXT,
  category TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_published ON events(is_published);
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. TESTIMONIES table
CREATE TABLE IF NOT EXISTS testimonies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  video_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_testimonies_approved ON testimonies(is_approved);
CREATE TRIGGER update_testimonies_updated_at BEFORE UPDATE ON testimonies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. TEAMS table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image TEXT,
  email TEXT,
  phone TEXT,
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_teams_active ON teams(is_active);
CREATE INDEX idx_teams_order ON teams(order_index);
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. MEDIA table
CREATE TABLE IF NOT EXISTS media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT,
  description TEXT,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_type ON media(type);
CREATE INDEX idx_media_category ON media(category);

-- 7. CALENDAR_EVENTS table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start TIMESTAMPTZ NOT NULL,
  end TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  location TEXT,
  event_type TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calendar_events_start ON calendar_events(start);
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. LIVE_STREAMS table
CREATE TABLE IF NOT EXISTS live_streams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  stream_url TEXT,
  is_live BOOLEAN DEFAULT false,
  scheduled_time TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_live_streams_is_live ON live_streams(is_live);
CREATE TRIGGER update_live_streams_updated_at BEFORE UPDATE ON live_streams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. DONATIONS table
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  amount NUMERIC(10,2) NOT NULL,
  amount_usd NUMERIC(10,2),
  currency TEXT NOT NULL,
  exchange_rate NUMERIC(10,6),
  frequency TEXT,
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  donor_phone TEXT,
  donor_country TEXT,
  payment_method TEXT,
  payment_channel TEXT,
  status TEXT DEFAULT 'pending',
  paystack_reference TEXT,
  transaction_reference TEXT,
  donation_type TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  notes TEXT,
  receipt_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_created ON donations(created_at);

-- 10. COUNSELLING_BOOKINGS table
CREATE TABLE IF NOT EXISTS counselling_bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  age TEXT,
  gender TEXT,
  preferred_counsellor TEXT,
  booking_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  issue_type TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_counselling_bookings_date ON counselling_bookings(booking_date);
CREATE TRIGGER update_counselling_bookings_updated_at BEFORE UPDATE ON counselling_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. COUNSELLORS table
CREATE TABLE IF NOT EXISTS counsellors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  image TEXT,
  email TEXT,
  phone TEXT,
  specialization TEXT[],
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_counsellors_available ON counsellors(is_available);
CREATE TRIGGER update_counsellors_updated_at BEFORE UPDATE ON counsellors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. COUNSELLING_SLOTS table (from migration)
CREATE TABLE IF NOT EXISTS counselling_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  max_slots INTEGER NOT NULL DEFAULT 10 CHECK (max_slots >= 0),
  booked_slots INTEGER NOT NULL DEFAULT 0 CHECK (booked_slots >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_counselling_slots_date ON counselling_slots(date);

CREATE OR REPLACE FUNCTION check_counselling_slot_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booked_slots > NEW.max_slots THEN
    RAISE EXCEPTION 'Booked slots (%) cannot exceed max slots (%) for date %', NEW.booked_slots, NEW.max_slots, NEW.date;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER counselling_slots_limit_check BEFORE UPDATE OR INSERT ON counselling_slots FOR EACH ROW EXECUTE FUNCTION check_counselling_slot_limit();

CREATE TRIGGER update_counselling_slots_updated_at BEFORE UPDATE ON counselling_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (service_role bypasses, public read published)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselling_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE counsellors ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselling_slots ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Public read published events" ON events FOR SELECT USING (is_published);
CREATE POLICY "Public read approved testimonies" ON testimonies FOR SELECT USING (is_approved);
CREATE POLICY "Public read active teams" ON teams FOR SELECT USING (is_active);
CREATE POLICY "Public read available counsellors" ON counsellors FOR SELECT USING (is_available);
CREATE POLICY "Public read future slots" ON counselling_slots FOR SELECT USING (date >= CURRENT_DATE);

CREATE POLICY "Service role full access" ON admins FOR ALL USING (true);
CREATE POLICY "Service role full access settings" ON settings FOR ALL USING (true);

-- Seed default settings
INSERT INTO settings (key, value) 
SELECT 'site', jsonb_build_object(
  'name', 'El-Shaddai Revival Centre',
  'tagline', 'Experience God''s Presence',
  'address', 'Your Church Address',
  'phone', '+234 XXX XXX XXXX',
  'email', 'info@elshaddai.com'
) 
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'site')
ON CONFLICT DO NOTHING;

-- Seed next 30 days counselling slots
INSERT INTO counselling_slots (date, max_slots)
SELECT 
  CURRENT_DATE + generate_series(0, 29)::int,
  10
WHERE NOT EXISTS (
  SELECT 1 FROM counselling_slots WHERE date = CURRENT_DATE + generate_series(0, 29)::int
)
ON CONFLICT (date) DO NOTHING;

-- Functions for counselling slots
CREATE OR REPLACE FUNCTION ensure_counselling_slot(date_param DATE)
RETURNS counselling_slots AS $$
DECLARE
  slot_record counselling_slots;
BEGIN
  SELECT * INTO slot_record 
  FROM counselling_slots 
  WHERE date = date_param;
  
  IF NOT FOUND THEN
    INSERT INTO counselling_slots (date, max_slots, booked_slots)
    VALUES (date_param, 10, 0)
    RETURNING * INTO slot_record;
  END IF;
  
  RETURN slot_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON SCHEMA public IS 'Complete schema for El-Shaddai Revival Centre - all models restored';
