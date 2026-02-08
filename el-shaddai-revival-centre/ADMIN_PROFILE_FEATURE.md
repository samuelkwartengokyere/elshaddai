# Admin Profile Feature Implementation

## Plan

1. Update Admin Model - Add `profileImage` field
2. Update Auth API - Include profileImage in user response
3. Update Admin API PUT route - Allow profile image updates
4. Update Admin Layout - Display profile based on role
5. Add Profile Settings Tab - Allow profile image upload/selection

## Progress

### Step 1: Update Admin Model

- [x] Add `profileImage` field to Admin.ts

### Step 2: Update Auth API

- [x] Update /api/auth/me/route.tsx to return profileImage

### Step 3: Update Admin API PUT route

- [x] Update /api/admins/[id]/route.tsx to handle profileImage updates

### Step 4: Update Admin Layout

- [x] Update layout.tsx to display profile based on role

### Step 5: Add Profile Settings Tab

- [x] Add profile tab in settings/page.tsx with avatar selection/upload

## Implementation Complete ✅

All features have been implemented:

1. **Super Admin**:

   - Profile icon shows as avatar with letter "A"
   - Name displayed as "Admin" across the system
   - Profile settings page shows info message that super admin profile is centrally managed

2. **Regular Admin**:
   - Can upload custom profile image or choose from 8 avatar options
   - Can change their display name
   - Name and profile image displayed in header/sidebar
   - Cannot change role or email (must contact super admin)

- Super admin: Avatar with name "Admin"
- Regular admin: Can change profile image and sees own name
