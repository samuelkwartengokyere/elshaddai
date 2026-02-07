# TODO: Update Church Address to Nabewam Location

## Task Overview

Update all address references in the codebase from placeholder "123 Church Street, City, State 12345" to the actual El-Shaddai Revival Centre location in Nabewam, Ghana, and add proper Google Maps embed.

## Address Information

- **Location:** El-Shaddai Revival Centre, Nabewam, Ghana
- **Google Maps Place ID:** JP8F+VR2

## Implementation Plan

### Step 1: Update Contact Page (`src/app/contact/page.tsx`)

**Changes needed:**

1. Replace the map placeholder div with a Google Maps iframe embed
2. Update address in Contact Information Cards from "123 Church Street, City, State 12345" to "Nabewam, Ghana"
3. Update FAQ answer about location
4. Update directions section with actual Nabewam directions
5. Update phone numbers to Ghana format if needed

### Step 2: Update Give Page (`src/app/give/page.tsx`)

**Changes needed:**

1. Update mailing address from "123 Faith Street, Your City, State 12345" to appropriate Ghana mailing address

### Step 3: Update Email Template (`src/lib/email.ts`)

**Changes needed:**

1. Update in-person address from "123 Church Street, Accra, Ghana" to "Nabewam, Ghana"
2. Update phone number to Ghana format (+233 50 123 4567 is already in file)

### Step 4: Update Teams Template (`src/lib/teams.ts`)

**Changes needed:**

1. Update in-person address from "123 Church Street, Accra, Ghana" to "Nabewam, Ghana"

## Google Maps Embed Code

For the embed, we'll use a Google Maps iframe pointing to the coordinates. Based on the place ID JP8F+VR2, we can use:

- Embed URL format: `https://www.google.com/maps/embed?pb=...`
- Or use the direct embed with query: `https://www.google.com/maps/embed?q=JP8F+VR2+El-Shaddai+Revival+Centre,+Nabewam`

## File Locations Summary

| File             | Current Address                            | New Address              |
| ---------------- | ------------------------------------------ | ------------------------ |
| contact/page.tsx | "123 Church Street, City, State 12345"     | "Nabewam, Ghana"         |
| give/page.tsx    | "123 Faith Street, Your City, State 12345" | TBD - keep Ghana address |
| email.ts         | "123 Church Street, Accra, Ghana"          | "Nabewam, Ghana"         |
| teams.ts         | "123 Church Street, Accra, Ghana"          | "Nabewam, Ghana"         |

## Status

- [x] Plan created
- [x] Implementation completed
  - [x] Step 1: Update contact page
  - [x] Step 2: Update give page
  - [x] Step 3: Update email.ts
  - [x] Step 4: Update teams.ts
- [ ] Testing completed
