# Supabase Database Schema

## Overview

This document outlines the database schema for migrating from in-memory storage to Supabase.

## Tables to Create

### 1. admins

```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  profile_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. settings

```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. events

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  image TEXT,
  event_type TEXT,
  is_virtual BOOLEAN DEFAULT false,
  virtual_link TEXT,
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. testimonies

```sql
CREATE TABLE testimonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  video_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. teams

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

### 6. media

```sql
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  uploaded_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. calendar_events

```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start TIMESTAMPTZ NOT NULL,
  end TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  location TEXT,
  event_type TEXT,
  color TEXT,
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8. live_streams

```sql
CREATE TABLE live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  stream_url TEXT,
  is_live BOOLEAN DEFAULT false,
  scheduled_time TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9. donations

```sql
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10,2) NOT NULL,
  amount_usd DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  exchange_rate DECIMAL(10,4) DEFAULT 1,
  frequency TEXT NOT NULL,
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
```

### 10. counselling_bookings

```sql
CREATE TABLE counselling_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  age TEXT,
  gender TEXT,
  preferred_counsellor TEXT,
  booking_date TIMESTAMPTZ NOT NULL,
  time_slot TEXT NOT NULL,
  issue_type TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 11. counsellors

```sql
CREATE TABLE counsellors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

## Row Level Security (RLS) Policies

### Admins Table

```sql
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Allow authenticated admins to read all admins
CREATE POLICY "Admins can view all admins" ON admins
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role to manage admins
CREATE POLICY "Service role can manage admins" ON admins
  FOR ALL USING (auth.role() = 'service_role');
```

### Settings Table

```sql
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read settings
CREATE POLICY "Anyone can read settings" ON settings
  FOR SELECT USING (true);

-- Allow service role to manage settings
CREATE POLICY "Service role can manage settings" ON settings
  FOR ALL USING (auth.role() = 'service_role');
```

### Other Tables

Apply similar RLS policies based on your requirements. For public read access:

```sql
CREATE POLICY "Public can read" ON events FOR SELECT USING (true);
```

## Storage Buckets

Create the following storage buckets:

1. **profiles** - for admin profile images
2. **events** - for event images
3. **testimonies** - for testimony images
4. **teams** - for team member photos
5. **media** - for gallery uploads

```sql
-- Insert storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('profiles', 'profiles', true),
  ('events', 'events', true),
  ('testimonies', 'testimonies', true),
  ('teams', 'teams', true),
  ('media', 'media', true);
```

## Next Steps

1. Create Supabase project
2. Run the SQL above in Supabase SQL Editor
3. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
4. Migrate API routes to use Supabase client
5. Test all endpoints
