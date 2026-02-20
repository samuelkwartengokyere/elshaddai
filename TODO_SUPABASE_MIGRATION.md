# Supabase Migration TODO

## Phase 1: Supabase Setup (COMPLETE)

- [x] 1. Analyze current project structure
- [x] 2. Create Supabase client configuration (`src/lib/supabase.ts`)
- [x] 3. Create database helper module (`src/lib/db.ts`)
- [x] 4. Update database.ts to use Supabase helper
- [x] 5. Create database schema file for reference (`SUPABASE_SCHEMA.md`)
- [x] 6. Create .env.example template file

## Phase 2: Migrate API Routes to Supabase

### Priority 1: Core Entities

- [ ] 1. Admins (`src/app/api/admins/`)
- [ ] 2. Auth (`src/app/api/auth/`)
- [ ] 3. Settings (`src/app/api/settings/`)

### Priority 2: Content Management

- [ ] 4. Events (`src/app/api/events/`)
- [ ] 5. Testimonies (`src/app/api/testimonies/`)
- [ ] 6. Teams (`src/app/api/teams/`)
- [ ] 7. Media (`src/app/api/media/`)

### Priority 3: Interactive Features

- [ ] 8. Calendar (`src/app/api/calendar/`)
- [ ] 9. Live Stream (`src/app/api/live/`)
- [ ] 10. Donations (`src/app/api/donations/`)
- [ ] 11. Counselling (`src/app/api/counselling/`)
- [ ] 12. Counsellors (`src/app/api/counsellors/`)

### Excluded (YouTube Dependent)
- [ ] Sermons - NOT migrated (depends on YouTube API)
- [ ] Live Stream - NOT migrated (depends on YouTube API for live status)

### Priority 3: Interactive Features (YouTube-Independent)
- [ ] 8. Calendar (`src/app/api/calendar/`)
- [ ] 9. Donations (`src/app/api/donations/`)
- [ ] 10. Counselling (`src/app/api/counselling/`)
- [ ] 11. Counsellors (`src/app/api/counsellors/`)

## Phase 3: Cleanup

- [ ] Remove in-memory storage fallback code (when all migrations complete)
- [ ] Test all endpoints
