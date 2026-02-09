# Admin Calendar Management Implementation TODO

## Phase 1: Database & API Setup

- [x] Create CalendarEvent model in database schema
- [x] Create API routes for calendar events CRUD operations
- [x] Create API route for CSV import (via bulk POST)
- [x] Create seed endpoint for initial data population
- [x] Test API endpoints ✅ (verified with curl - GET/POST working)

## Phase 2: Admin Calendar Page

- [x] Create admin calendar management page
- [x] Add event list view
- [x] Add event form (create/edit)
- [x] Add year selector dropdown
- [x] Add category filters
- [x] Add CSV import functionality
- [x] Add delete functionality with confirmation

## Phase 3: Frontend Integration

- [x] Update public calendar page to use API data
- [x] Add year navigation to public calendar
- [x] Add responsive design for admin page
- [ ] Test all functionality

## Phase 4: Testing & Deployment

- [x] Seed 2026 calendar data via API ✅ (seeded 14 events)
- [x] Test with 2026 calendar data ✅ (verified via GET /api/calendar?year=2026)
- [ ] Train church staff on usage
- [ ] Deploy to production

## Additional Features (Optional)

- [ ] Google Calendar integration
- [ ] Bulk delete by year (completed in admin page)
- [ ] Duplicate events feature
- [ ] Export calendar to CSV
