-- SUPABASE MIGRATION: Counselling Daily Slots Table
-- Run this SQL in your Supabase project's SQL Editor

-- Create counselling_slots table (global daily limits)
CREATE TABLE IF NOT EXISTS counselling_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  max_slots INTEGER NOT NULL DEFAULT 10 CHECK (max_slots >= 0),
  booked_slots INTEGER NOT NULL DEFAULT 0 CHECK (booked_slots >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure booked_slots never exceeds max_slots
CREATE OR REPLACE FUNCTION check_counselling_slot_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booked_slots > NEW.max_slots THEN
    RAISE EXCEPTION 'Booked slots (%) cannot exceed max slots (%) for date %', NEW.booked_slots, NEW.max_slots, NEW.date;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER counselling_slots_limit_check
  BEFORE UPDATE OR INSERT ON counselling_slots
  FOR EACH ROW EXECUTE FUNCTION check_counselling_slot_limit();

-- Index for efficient date queries
CREATE INDEX idx_counselling_slots_date ON counselling_slots(date);

-- RLS policies (admin full access, public read-only future slots)
ALTER TABLE counselling_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read future slots" ON counselling_slots
  FOR SELECT USING (date >= CURRENT_DATE);

CREATE POLICY "Admin full access" ON counselling_slots
  FOR ALL USING (auth.role() = 'service_role');

-- Function to auto-create slot for future date (call when needed)
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

-- Example: Populate next 30 days slots (run once)
INSERT INTO counselling_slots (date, max_slots)
SELECT 
  CURRENT_DATE + generate_series(0, 29)::int,
  10
WHERE NOT EXISTS (
  SELECT 1 FROM counselling_slots WHERE date = CURRENT_DATE + generate_series(0, 29)::int
)
ON CONFLICT (date) DO NOTHING;

COMMENT ON TABLE counselling_slots IS 'Daily counselling slot limits (global). Admin sets max_slots, auto-decrements on booking.';

