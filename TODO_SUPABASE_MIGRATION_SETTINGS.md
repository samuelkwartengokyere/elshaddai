# Supabase Migration Plan - Settings API

## Current State

- Settings API uses in-memory storage (globalForSettings)
- db.ts helper already has settingsDb.get() and settingsDb.set() methods
- Supabase client is configured but not being used

## Plan

1. Modify Settings API to use settingsDb from db.ts
2. Fall back to in-memory if Supabase not configured
3. Use hybrid approach - try Supabase first, then in-memory

## Files to Edit

- `src/app/api/settings/route.tsx`

## Implementation Steps

1. Import settingsDb from '@/lib/db'
2. Try Supabase first in GET - if not configured, use in-memory
3. Try Supabase first in POST - if not configured, use in-memory
4. Keep YouTube sync functionality intact

## Followup Steps

1. Test Settings API endpoints
2. Move to next API (Admins)
