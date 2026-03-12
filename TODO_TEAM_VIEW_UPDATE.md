# TODO: Update Ministry Teams - COMPLETED ✅

## Task Summary

Change the "Join Team" button to "View Team" in the Ministry Teams section, and make it navigate to individual team pages with leadership cards.

## Steps Completed:

### Step 1: Create dynamic team page ✅

- Created `/about/team/[department]/page.tsx` - dynamic route that fetches and displays team members by department
- Fetches via `/api/teams?department=...&is_active=true`

### Step 2: Update Ministry Teams section in about/team ✅

- Updated `/about/team/page.tsx` - changed "Join Team" to "View Team"
- Updated links to `/about/team/{department-slug}`

### Step 3: Test the changes ✅

- Verified buttons show "View Team"
- Verified navigation to correct team pages
- Verified team pages display cards with fallback

## Ministry Teams Updated:

1. Worship Team (`/about/team/worship-team`)
2. Media & Technology (`/about/team/media-technology`)
3. Ushering Team (`/about/team/ushering-team`)
4. Security Team (`/about/team/security-team`)
5. Intercessory Prayer Team (`/about/team/intercessory-prayer-team`)
6. Greeters Team (`/about/team/greeters-team`)

**API Support**: `/api/teams` now supports `?department=...&leadership=true&limit=...`

**Next**: Add team member data to Supabase `teams` table if needed.
