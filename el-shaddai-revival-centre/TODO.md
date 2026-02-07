# Code Fixes TODO List

## Priority 1: Critical Errors

### 1. Fix Hero.tsx - Duplicate default export

- [x] Remove duplicate export and fix the component

### 2. Fix Sermons Page - Add API integration

- [x] Replace empty mock data with API call to fetch sermons
- [x] Add client-side state management for search/filter

### 3. Fix SermonCard.tsx - Image component issues

- [x] Replace <img> with Next.js <Image> component
- [x] Add required width/height props

### 4. Fix SermonUpload.tsx - File handling issues

- [x] Separate handlers for sermon file and thumbnail
- [x] Add uuid dependency check

### 5. Fix uuid dependency

- [x] Add uuid to package.json
- [x] Install uuid in the project

### 6. Fix api/sermons/route.tsx - Import issue

- [x] Fix Sermon model import

## Priority 2: Additional Fixes

### 7. Fix Sermon.ts model - TypeScript issues

- [x] Fix mongoose model export

### 8. Fix database.ts - Add proper typing

## Priority 3: Improvements

### 9. Add missing tailwind utilities

- [x] Add btn-primary and card classes to CSS

## New Work Completed

### 10. Complete About Page

- [x] Add hero section with church welcome message
- [x] Add "Our Story" section with church history
- [x] Add "Our Mission & Vision" section
- [x] Add "Leadership Team" section with team members
- [x] Add "Service Times" section
- [x] Add "Core Values" section
- [x] Add "Contact Info" section
- [x] Add "What to Expect" section
- [x] Add Call to Action section

## Build Check

- [x] Run `npm run build` to verify no errors
  - ✅ Build compiled successfully in 8.7s
  - ✅ No TypeScript errors found
  - ✅ All pages render correctly

## Website Link & Functionality Audit (COMPLETED)

### Missing Pages Created

- [x] `/about/team` - Full leadership team page
- [x] `/plan-your-visit` - Plan your visit page with FAQ, service times, directions
- [x] `/prayer` - Prayer request submission page
- [x] `/serve` - Serve/volunteer opportunities page
- [x] `/calendar` - Interactive calendar page
- [x] `/financial-report` - Financial transparency page

### Broken Links Fixed

- [x] Footer - Updated social media links to be conditional (env vars)
- [x] Footer - Added "Plan Your Visit" quick link
- [x] Contact page - Fixed social media links to be conditional
- [x] About page - Fixed "View Full Team" link (now works)
- [x] About page - Fixed "Plan Your Visit" link (now works)
- [x] Homepage - Fixed "Visit Info" button (now links to plan-your-visit)

### Configuration Improvements

- [x] YouTube embed - Made channel ID configurable via env var
- [x] Social media - Made all links conditional based on environment variables
- [x] Inconsistent contact info - Fixed phone and email in About page
- [x] Created `.env.example` file for configuration guidance

### All Links Verified Working

- [x] Home → All navigation links work
- [x] About → All internal links work
- [x] Sermons → Links work correctly
- [x] Live Stream → YouTube embed works
- [x] Groups → Links work
- [x] Give → Donation form works
- [x] Events → Calendar links work
- [x] Testimonies → Links work
- [x] Counselling → Booking flow works
- [x] Contact → All links work
