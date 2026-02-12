# Events Calendar Enhancement - TODO

## Task

Display revival days, special days, and holiday programs on the events page calendar alongside regular events.

## Steps to Complete:

### 1. Update Events Page Calendar

- [x] Create this TODO file
- [x] Fetch calendar events (revival/special/holiday) from `/api/calendar`
- [x] Merge regular events with calendar events
- [x] Add new event type colors for revival, special, and holiday
- [x] Update calendar legend to show all categories
- [x] Display all event types on the calendar grid
- [x] Add revival week highlighting (orange background for revival week days)

### 2. Implementation Details

#### Event Types to Display:

1. **Regular Events** (from Event model):

   - worship (blue)
   - youth (purple)
   - children (green)
   - outreach (orange)
   - fellowship (pink)
   - other (gray)

2. **Calendar Events** (from CalendarEvent model):
   - revival (orange/red)
   - special (green/teal)
   - holiday (blue)

#### Changes to `src/app/events/page.tsx`:

1. ✅ Added state for calendar events from `/api/calendar`
2. ✅ Added state for revival weeks data
3. ✅ Merged all events for calendar display
4. ✅ Updated `getCategoryColor` function to handle all categories
5. ✅ Updated calendar grid styling to highlight revival weeks
6. ✅ Updated legend to show all 8 categories

## Status: Completed ✅

All enhancements have been implemented. The events page calendar now displays:

- Regular events (worship, youth, children, outreach, fellowship)
- Revival weeks (highlighted in orange with "REVIVAL" badge)
- Special programs (from CalendarEvent model)
- Holiday programs (from CalendarEvent model)
