# Daily Slots Stats Enhancement - TODO

## Plan Approved - Implementing enhanced stats cards in src/app/admin/counselling/page.tsx

### Steps:

- [x] 1. Add new icon imports for stats cards (CalendarDays, TrendingUp, TrendingDown, AlertTriangle, BarChart3, etc.)
- [x] 2. Add computed statistics for selected days (single date + bulk dates)
- [x] 3. Enhance Overall Stats cards with icons and additional metrics
- [x] 4. Add Selected Days Preview section (conditional, shows when dates are selected)
- [x] 5. Add visual indicators (color badges, trend arrows, warning icons)
- [x] 6. Update TODO as complete

## Summary of Changes:

1. **Enhanced Overall Stats** - Better visual presentation with icons, added "Fully Booked Days" and "Available Days" metrics
2. **Selected Days Preview** - New conditional section that shows preview stats when admin selects dates in the form:
   - For single date: shows current vs new slot count, existing bookings, availability change
   - For bulk dates: shows days count, date range, total new slots, existing bookings, net change
3. **Visual Improvements** - Color-coded badges, trend indicators, warning alerts when reducing below bookings
4. **Better UX** - Stats update dynamically as admin changes form inputs
