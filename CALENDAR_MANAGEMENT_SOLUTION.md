# Calendar Management Solution for El-Shaddai Revival Centre

## Problem Statement

Currently, calendar data is hardcoded in the application code, requiring a developer to update the calendar manually every year. This is not scalable.

## Recommended Solutions

### Option 1: Admin Dashboard Calendar Management (Recommended)

Build an admin interface where church staff can:

- Upload new calendar images
- Manually add/edit/delete events through a form
- Set revival weeks and special programs
- Mark public holidays

**Benefits:**

- No coding required for updates
- Can be done by any authorized staff
- Instant updates to the website
- Full control over all calendar data

**Implementation:**

- Create Admin Calendar Management page
- Events stored in database
- Dynamic calendar generation from database
- Multiple calendar support (2026, 2027, etc.)

---

### Option 2: Spreadsheet/CSV Import

Allow administrators to upload a CSV file with calendar data.

**CSV Format Example:**

```csv
title,date,time,location,category,description
"Power Conference",2026-05-25,"All Day","Church Premises","special","A powerful conference..."
"New Year's Day",2026-01-01,"All Day","National Holiday","holiday","Public Holiday"
```

**Benefits:**

- Easy to update (use Excel/Google Sheets)
- Bulk import of multiple events
- Can maintain calendar data offline

**Implementation:**

- Create CSV upload functionality
- Parse and validate CSV data
- Import to database
- Generate calendar from imported data

---

### Option 3: Google Calendar Integration

Sync with a Google Calendar dedicated to church events.

**Benefits:**

- Easy event management on Google Calendar
- Automatic sync with website
- Multiple calendar support
- Mobile-friendly

**Implementation:**

- Create Google Calendar for church
- Generate API key
- Fetch events via Google Calendar API
- Display on website

---

### Option 4: Hybrid Approach (Best for this Church)

Combine multiple methods for maximum flexibility:

1. **Primary:** Admin Dashboard with Form Entry

   - Add/edit/delete events through web interface
   - Set recurring events (weekly services)
   - Mark special programs and revival weeks

2. **Secondary:** CSV Import for bulk updates

   - Import multiple events at once
   - Easy annual calendar updates

3. **Tertiary:** Image Upload
   - Display calendar image as reference
   - Still extract data manually or via OCR

---

## Recommended Implementation Plan

### Phase 1: Admin Calendar Management Page

Create an admin interface with:

- Event list view (all events)
- Add/Edit/Delete event forms
- Category management (Revival Weeks, Special Programs, Holidays)
- Year selector (2026, 2027, etc.)
- Preview calendar

### Phase 2: Database Schema

```typescript
// Event Model
{
  id: string,
  title: string,
  date: string (YYYY-MM-DD),
  time: string,
  location: string,
  category: 'holiday' | 'special' | 'revival',
  description: string,
  year: number,
  recurring: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Phase 3: API Endpoints

- GET /api/events - Get all events
- GET /api/events?year=2026 - Get events for specific year
- POST /api/events - Create new event
- PUT /api/events/:id - Update event
- DELETE /api/events/:id - Delete event
- POST /api/events/import - Import CSV

### Phase 4: Frontend Updates

- Dynamic calendar generation from database
- Year selector dropdown
- Easy navigation between years
- Responsive design

---

## Estimated Development Time

- Admin Calendar Page: 2-3 days
- API Development: 1-2 days
- Database Integration: 1 day
- CSV Import Feature: 1 day
- Testing & Bug Fixes: 1 day

**Total: ~1 week**

---

## Next Steps

1. Review and approve the solution
2. Decide on preferred approach
3. Begin implementation of Admin Calendar Management
4. Test with 2026 calendar
5. Deploy and train staff
