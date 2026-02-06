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
