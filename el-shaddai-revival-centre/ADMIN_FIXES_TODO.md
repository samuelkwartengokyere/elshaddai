# Admin Panel Fixes - TODO List

## Phase 1: Fix Dashboard Links

- [x] 1.1 Fix Dashboard "Create New Event" link to open create modal instead of `/admin/events/create`
- [x] 1.2 Fix Dashboard "Add Testimony" link to open create modal instead of `/admin/testimonies/create`
- [x] 1.3 Fix Dashboard "Add Team Member" link to open create modal instead of non-existent page

## Phase 2: Add Edit Functionality - Events Page

- [x] 2.1 Add Edit modal to events page
- [x] 2.2 Implement handleUpdate function
- [x] 2.3 Fix "Edit" button to open edit modal with existing data
- [x] 2.4 Add API route for PUT events

## Phase 3: Add Edit Functionality - Testimonies Page

- [x] 3.1 Add Edit modal to testimonies page
- [x] 3.2 Implement handleUpdate function
- [x] 3.3 Fix "Edit" button to open edit modal with existing data
- [x] 3.4 Add API route for PUT testimonies

## Phase 4: Add Edit Functionality - Teams Page

- [x] 4.1 Add Edit modal to teams page
- [x] 4.2 Implement handleUpdate function
- [x] 4.3 Make "Edit" button functional
- [x] 4.4 Add API route for PUT teams

## Phase 5: Add Edit Functionality - Sermons Page

- [x] 5.1 Add Edit button to sermons table
- [x] 5.2 Add Edit modal to sermons page
- [x] 5.3 Add API route for PUT sermons

## Phase 6: Add Edit Functionality - Media Page

- [x] 6.1 Add Edit modal to media page
- [x] 6.2 Implement handleUpdate function
- [x] 6.3 Make "Edit" button functional
- [x] 6.4 Add API route for PUT media

## Phase 7: Testing

- [ ] 7.1 Run build to verify no TypeScript errors
- [ ] 7.2 Test all admin pages work correctly
- [ ] 7.3 Test CRUD operations for all content types
- [ ] 7.4 Test search functionality
- [ ] 7.5 Test pagination works
