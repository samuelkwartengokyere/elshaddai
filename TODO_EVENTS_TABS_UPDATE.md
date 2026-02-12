# Events Tabs Update Plan

## Task

Update the events page tabs to: All Events, Revival, Special Program, Holiday Program
Update the admin page to include these categories.

## Files to Edit

1. `el-shaddai-revival-centre/src/app/events/page.tsx`
2. `el-shaddai-revival-centre/src/app/admin/events/page.tsx`

## Changes Required

### 1. Events Page (src/app/events/page.tsx)

- Update `eventCategories` array to: All Events, Revival, Special Program, Holiday Program
- Update `getCategoryColor` function for new categories
- Update the category filter buttons section

### 2. Admin Events Page (src/app/admin/events/page.tsx)

- Update `EventCategory` type to include: revival, special, holiday
- Update category dropdown options in filter and create/edit modal
- Update `getCategoryColor` function for new categories
- Update stats to reflect new category count

## Progress

- [x] Edit events page tabs and categories
- [x] Edit admin page categories
- [ ] Verify changes work correctly
