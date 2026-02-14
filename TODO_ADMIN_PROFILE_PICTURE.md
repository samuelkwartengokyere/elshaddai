# Admin Profile Picture Implementation Plan

## Objective

Allow admin to choose a profile picture from the Settings page.

## Steps Completed

### Step 1: Update Auth Me API ✅

- Updated `/api/auth/me/route.tsx` to include profileImage in dev mode response

### Step 2: Update Admin API PUT ✅

- Updated `/api/admins/[id]/route.tsx` to allow any admin to update their own profile

### Step 3: Update Settings Page ✅

- Updated `/admin/settings/page.tsx` to allow all admins (including super_admin) to edit their profile picture

### Step 4: Fix Avatar URLs ✅

- Updated avatar URLs to use PNG format (DiceBear 9.x) for better Next.js Image compatibility

### Step 5: Add File Upload API ✅

- Created `/api/admins/profile-image/route.tsx` to handle local image uploads

### Step 6: Add File Upload UI ✅

- Added "Browse" button to upload profile pictures from local device
- Added validation for file type (JPG, PNG, GIF, WebP) and size (max 5MB)

## Summary

The admin can now choose a profile picture from the Settings page. The implementation includes:

- Pre-defined avatar options from DiceBear (8 avatars) - now using PNG format
- Custom image URL option
- **NEW: Upload from device** - Browse and upload profile pictures directly
- Profile image displayed in sidebar and header
- Works for all admin roles including super_admin
