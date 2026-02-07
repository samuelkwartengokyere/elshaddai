# Admin Panel Enhancement Plan

## Information Gathered:

The main website (`/`) displays:

- Recent Sermons (mock data)
- Testimonies (mock data)
- Upcoming Events (mock data)
- Service Times
- Hero section

The About page (`/about`) displays:

- Church History
- Mission & Vision
- Core Values
- Leadership Team
- Service Times
- Contact Info

The Events page (`/events`) displays:

- Upcoming events with categories
- Weekly schedule

Current Admin Panel has:

- ✅ Media Library (images, videos, documents)
- ✅ Sermons management (upload, list, delete)
- ❌ Dashboard (missing)
- ❌ Donations (referenced in sidebar, not created)
- ❌ Users (referenced in sidebar, not created)
- ❌ Settings (referenced in sidebar, not created)

## Plan:

### Phase 1: Create Admin Dashboard

1. Create `/admin/page.tsx` - Dashboard with overview statistics
   - Total sermons count
   - Total media count
   - Recent sermons preview
   - Recent media preview
   - Quick action buttons

### Phase 2: Add Events Management

1. Create `/admin/events/page.tsx` - Events list/management page
2. Create `/admin/events/create/page.tsx` - Create new event
3. Create `/admin/events/[id]/page.tsx` - Edit event
4. Create API routes for events:
   - `GET /api/events` - List events
   - `POST /api/events` - Create event
   - `PUT /api/events?id=` - Update event
   - `DELETE /api/events?id=` - Delete event
5. Create Event model

### Phase 3: Add Testimonies Management

1. Create `/admin/testimonies/page.tsx` - Testimonies list/management page
2. Create `/admin/testimonies/create/page.tsx` - Create new testimony
3. Create API routes for testimonies:
   - `GET /api/testimonies` - List testimonies
   - `POST /api/testimonies` - Create testimony
   - `PUT /api/testimonies?id=` - Update testimony
   - `DELETE /api/testimonies?id=` - Delete testimony
4. Create Testimony model

### Phase 4: Add Teams/Leadership Management

1. Create `/admin/teams/page.tsx` - Teams list/management page
2. Create `/admin/teams/create/page.tsx` - Create new team member
3. Create API routes for teams:
   - `GET /api/teams` - List team members
   - `POST /api/teams` - Create team member
   - `PUT /api/teams?id=` - Update team member
   - `DELETE /api/teams?id=` - Delete team member
4. Create TeamMember model

### Phase 5: Update Navigation

1. Update admin layout sidebar to include:
   - Dashboard (add new nav item)
   - Events (new)
   - Testimonies (new)
   - Teams (new)
   - Media Library (existing)
   - Sermons (existing)

### Phase 6: Update Website to Use API

1. Update homepage to fetch sermons, events, testimonies from API
2. Update about page to fetch teams, service times from API
3. Update events page to fetch events from API

## Files to Create:

### New Admin Pages:

- `/admin/page.tsx` - Dashboard
- `/admin/events/page.tsx` - Events list
- `/admin/events/create/page.tsx` - Create event
- `/admin/testimonies/page.tsx` - Testimonies list
- `/admin/testimonies/create/page.tsx` - Create testimony
- `/admin/teams/page.tsx` - Teams list
- `/admin/teams/create/page.tsx` - Create team member

### New API Routes:

- `/api/events/route.tsx` - GET, POST
- `/api/events?id=&method=` - DELETE, PUT
- `/api/testimonies/route.tsx` - GET, POST
- `/api/testimonies?id=` - DELETE, PUT
- `/api/teams/route.tsx` - GET, POST
- `/api/teams?id=` - DELETE, PUT

### New Models:

- `/models/Event.ts`
- `/models/Testimony.ts`
- `/models/TeamMember.ts`

## Followup Steps:

1. Create the files as per plan
2. Install any missing dependencies (check package.json)
3. Test the admin panel functionality
4. Update the main website pages to fetch data from APIs
