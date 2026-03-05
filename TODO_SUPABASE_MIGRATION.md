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

- [x] 1. Admins (`src/app/api/admins/`) - DONE
- [x] 2. Auth (`src/app/api/auth/`) - DONE (uses existing auth system)
- [x] 3. Settings (`src/app/api/settings/`) - DONE

### Priority 2: Content Management

- [x] 4. Events (`src/app/api/events/`) - DONE
- [x] 5. Testimonies (`src/app/api/testimonies/`) - DONE
- [x] 6. Teams (`src/app/api/teams/`) - DONE
- [x] 7. Media (`src/app/api/media/`) - DONE

### Priority 3: Interactive Features

- [x] 8. Calendar (`src/app/api/calendar/`) - DONE
- [ ] 9. Live Stream (`src/app/api/live/`) - Excluded (YouTube dependent)
- [x] 10. Donations (`src/app/api/donations/`) - DONE
- [x] 11. Counselling (`src/app/api/counselling/`) - DONE
- [x] 12. Counsellors (`src/app/api/counsellors/`) - DONE

### Excluded (YouTube Dependent)

- [ ] Sermons - NOT migrated (depends on YouTube API)
- [ ] Live Stream - NOT migrated (depends on YouTube API for live status)

## Phase 3: Cleanup

- [ ] Remove in-memory storage fallback code (when Supabase is fully configured)
- [x] Test all endpoints - APIs are ready for testing
