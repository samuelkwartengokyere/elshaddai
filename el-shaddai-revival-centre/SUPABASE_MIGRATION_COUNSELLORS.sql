-- Migration: Add missing columns to counsellors table
-- Run this in Supabase Dashboard > SQL Editor

-- Add columns that the API expects but are missing from the schema
ALTER TABLE counsellors
  ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_in_person BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS years_of_experience INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'counsellors'
ORDER BY ordinal_position;

