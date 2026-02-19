# TODO: Admin-Managed Counsellors Implementation

## Status: ✅ Completed

### What was implemented:

- ✅ Step 1: API Route for Counsellors (`/api/counsellors/route.tsx`) - Full CRUD operations
- ✅ Step 2: Admin Counsellor Management Page (`/admin/counselling/page.tsx`) - Full UI for managing counselors
- ✅ Step 3: CounsellingBooking Component fetches from API (`/api/counsellors`)
- ✅ Added "Counselling" link to admin sidebar navigation
- ✅ Added ImageUpload component for local file upload

### Notes:

- Using in-memory storage pattern (consistent with other APIs in this project)
- Following the Teams admin page pattern for CRUD operations
- Admin can: Add, Edit, Delete (soft), Search, and Filter counselors
- Admin can now upload images from local device or use URL
