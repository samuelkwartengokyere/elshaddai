# TODO: Make Admin Form Pages Have Transparent Backgrounds

## Task

Ensure all form pages in the admin panel have transparent backgrounds instead of white backgrounds.

## Files to Modify

### 1. Events Page

- **File**: `src/app/admin/events/page.tsx`
- **Change**: Make the Create/Edit Modal background transparent
- **Line**: `className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"`

### 2. Testimonies Page

- **File**: `src/app/admin/testimonies/page.tsx`
- **Change**: Make the Create/Edit Modal background transparent
- **Line**: `className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"`

### 3. Teams Page

- **File**: `src/app/admin/teams/page.tsx`
- **Change**: Make the Create/Edit Modal background transparent
- **Line**: `className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"`

### 4. Settings Page

- **File**: `src/app/admin/settings/page.tsx`
- **Change**: Make the Admin Modal background transparent
- **Line**: `className="relative bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4 z-10"`

### 5. Sermons Page

- **File**: `src/app/admin/sermons/page.tsx`
- **Change**: Make the Edit Modal background transparent
- **Line**: `className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"`

### 6. Upload Sermon Page

- **File**: `src/app/admin/sermons/upload/page.tsx`
- **Changes**:
  1. Remove `max-w-4xl mx-auto` from the main container
  2. Make the form grid container transparent
  3. Remove white backgrounds from form sections

### 7. Media Page

- **File**: `src/app/admin/media/page.tsx`
- **Change**: Make the Create/Edit Modal background transparent
- **Line**: `className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4"`

## Implementation Steps

1. Read each file to confirm the exact lines
2. Edit each file to change `bg-white` to transparent backgrounds for forms
3. Verify the changes visually in the browser

## Status

- [x] Events Page - ✅ Completed (backdrop blur + transparent bg + shadow + border)
- [x] Testimonies Page - ✅ Completed (backdrop blur + transparent bg + shadow + border)
- [x] Teams Page - ✅ Completed (backdrop blur + transparent bg + shadow + border)
- [x] Settings Page - ✅ Completed (backdrop blur + transparent bg + shadow + border)
- [x] Sermons Page - ✅ Completed (backdrop blur + transparent bg + shadow + border)
- [x] Upload Sermon Page - ✅ Completed (full-width + shadow + border)
- [x] Media Page - ✅ Completed (backdrop blur + transparent bg + shadow + border)

All form boxes in the admin section now have:

- Transparent background (`bg-transparent`)
- Box shadow (`shadow-xl`)
- Subtle border (`border border-gray-200/50`)
- Backdrop blur effect on the modal overlay
