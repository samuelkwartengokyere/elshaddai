# Counselling Booking System - Implementation Plan

## Overview

Add a comprehensive counselling booking section for people outside Ghana with Google Teams integration for online counselling and in-person option for visitors to Ghana.

## Tasks

### Phase 1: Data Models & Types

- [x] Create counsellor type definitions (`/src/types/counselling.ts`)
- [x] Create counsellor data model (`/src/models/Counsellor.ts`)

### Phase 2: API Routes

- [x] Create main counselling booking API (`/src/app/api/counselling/route.tsx`)
- [x] Create email confirmation service (`/src/lib/email.ts`)
- [x] Create Microsoft Teams integration (`/src/lib/teams.ts`)

### Phase 3: Components

- [x] Create counselling booking form component (`/src/components/CounsellingBooking.tsx`)
- [x] Create counsellor card component (`/src/components/CounsellorCard.tsx`)
- [x] Create time slot picker component (`/src/components/TimeSlotPicker.tsx`)

### Phase 4: Pages

- [x] Create counselling page (`/src/app/counselling/page.tsx`)
- [ ] Create counselling confirmation page (`/src/app/counselling/confirmation/page.tsx`)

### Phase 5: Navigation & Integration

- [x] Update header with counselling link (`/src/components/Header.tsx`)
- [x] Add counselling section to homepage (`/src/app/page.tsx`)

### Phase 6: Dependencies & Configuration

- [ ] Install required packages (nodemailer, @microsoft/microsoft-graph-client)
- [ ] Create environment variable template (`.env.example`)
- [ ] Add counselling types to existing types index

## Implementation Details

### Location Detection

- Country dropdown with Ghana highlighted
- Auto-detect user's country via browser API
- Show different options based on location

### Booking Types

- **Online (Google Teams)**: For international users
- **In-Person**: For those visiting Ghana
- Automatic Teams meeting link generation

### Email Confirmation

- Send confirmation email to user
- Send notification email to counsellor
- Include calendar invite (.ics file)

## Notes

- Microsoft Graph API requires Azure AD app registration
- Email service requires SMTP credentials
- All forms include validation and error handling

## Progress

Started: [Current Date]
Status: Phase 3 & 4 - Components & Pages Completed

### Completed Items:

- Types definitions (counselling.ts)
- Counsellor data model (Counsellor.ts)
- API routes (route.tsx)
- Email service (email.ts)
- Teams integration (teams.ts)
- CounsellorCard component
- TimeSlotPicker component
- CounsellingBooking form component
- Counselling page (page.tsx)
- Header navigation link
- Homepage integration

### Remaining:

- Confirmation page
- Environment configuration
