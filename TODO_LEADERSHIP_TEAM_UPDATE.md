# TODO: Leadership Team Dynamic Update

## Task
Make the About Us > Team page fetch leaders from API instead of using hardcoded data

## Steps Completed:
- [x] Analyzed codebase and understood the existing structure
- [x] Confirmed admin panel at /admin/teams already allows admin to add leaders
- [x] Confirmed API at /api/teams already works with CRUD operations
- [x] Updated `/about/team/page.tsx` to fetch leadership team from API
- [x] Added image upload functionality to admin panel at `/admin/teams`
- [x] Created image upload API endpoint at `/api/teams/upload-image`

## How it works now:
1. Admin goes to `/admin/teams` to manage leaders
2. Admin can add new leaders with name, role, bio, photo, email, phone, department
3. Admin can mark leaders as "Leadership" to appear on About pages
4. Both `/about` and `/about/team` pages fetch from API and display the admin-added leaders

## Files Edited:
- `el-shaddai-revival-centre/src/app/about/team/page.tsx`
- `el-shaddai-revival-centre/src/app/admin/teams/page.tsx`
- `el-shaddai-revival-centre/src/app/api/teams/upload-image/route.tsx` (new)
