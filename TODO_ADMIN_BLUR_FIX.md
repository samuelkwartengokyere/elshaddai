# Admin Dashboard Modal Blur Effect Implementation

## Plan

Enhance the modal backdrop blur effect across all admin dashboard pages to:

1. Increase blur intensity (sm → md)
2. Add semi-transparent black overlay (bg-black/50)
3. Add pointer-events-none to outer container to prevent background interactions
4. Keep modal content interactive with pointer-events-auto

## Files to Edit

- [x] 1. `/el-shaddai-revival-centre/src/app/admin/teams/page.tsx` - ✅ Updated
- [x] 2. `/el-shaddai-revival-centre/src/app/admin/events/page.tsx` - ✅ Updated
- [x] 3. `/el-shaddai-revival-centre/src/app/admin/testimonies/page.tsx` - ✅ Updated
- [x] 4. `/el-shaddai-revival-centre/src/app/admin/media/page.tsx` - ✅ Updated
- [x] 5. `/el-shaddai-revival-centre/src/app/admin/sermons/page.tsx` - ✅ Updated
- [x] 6. `/el-shaddai-revival-centre/src/app/admin/calendar/page.tsx` - ✅ Updated (2 modals: event + CSV import)
- [x] 7. `/el-shaddai-revival-centre/src/app/admin/settings/page.tsx` - ✅ Updated

## Changes per file

Replace the modal overlay div with:

```jsx
<div className="fixed inset-0 z-50 flex items-center justify-center">
  {/* Blurred backdrop overlay */}
  <div className="fixed inset-0 bg-black/50 backdrop-blur-md pointer-events-auto" />

  {/* Modal content */}
  <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 z-10">
    ...
  </div>
</div>
```

## Summary

- **Blur intensity**: Increased from `backdrop-blur-sm` to `backdrop-blur-md`
- **Overlay**: Added `bg-black/50` for semi-transparent dark overlay
- **Pointer events**: Added `pointer-events-auto` to ensure overlay captures clicks
- **All 7 admin pages updated** with consistent modal styling
