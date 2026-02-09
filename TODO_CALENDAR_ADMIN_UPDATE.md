# Calendar Admin Page Update

## Tasks Completed

- [x] Extended year dropdown from 2025-2030 to 2020-2099 (dynamic generation)
- [x] Added blurred transparent backgrounds to Add/Edit Event modal backdrop
- [x] Added blurred transparent backgrounds to Import CSV modal backdrop
- [x] Updated all admin page form-boxes to have solid white backgrounds (instead of transparent)

## File Modified

- `el-shaddai-revival-centre/src/app/admin/calendar/page.tsx`
- `el-shaddai-revival-centre/src/app/admin/media/page.tsx`
- `el-shaddai-revival-centre/src/app/admin/events/page.tsx`
- `el-shaddai-revival-centre/src/app/admin/teams/page.tsx`
- `el-shaddai-revival-centre/src/app/admin/testimonies/page.tsx`
- `el-shaddai-revival-centre/src/app/admin/sermons/page.tsx`
- `el-shaddai-revival-centre/src/app/admin/settings/page.tsx`

## Changes Made

1. **Calendar Page:**

   - Changed year dropdown from static `[2025, 2026, 2027, 2028, 2029, 2030]` to dynamic `Array.from({ length: 80 }, (_, i) => 2020 + i)`
   - Updated Add/Edit Event modal: backdrop has `backdrop-blur-sm`, form-box has `bg-white`
   - Updated Import CSV modal: backdrop has `backdrop-blur-sm`, form-box has `bg-white`

2. **All Admin Pages (media, events, teams, testimonies, sermons, settings):**
   - Changed modal form-boxes from `bg-transparent` to `bg-white`
   - Kept the `backdrop-blur-sm` on the backdrop div for the blur effect

## Pattern Applied

```jsx
{
  showModal && (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop - with blur effect */}
      <div className="absolute inset-0 backdrop-blur-sm" />
      {/* Form-box - solid white background */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 z-10">
        {/* Form content */}
      </div>
    </div>
  );
}
```
