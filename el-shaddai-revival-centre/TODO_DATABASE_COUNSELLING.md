# Database Integration Plan for Counselling System

## Information Gathered

The counselling system currently:

1. Uses in-memory storage (`Map`) for bookings instead of MongoDB
2. Uses static Counsellor data from `src/models/Counsellor.ts`
3. Has proper types defined in `src/types/counselling.ts`
4. Other API routes in the project are already connected to MongoDB

## Plan

### Step 1: Create Mongoose Model for CounsellingBooking

- Create `src/models/CounsellingBooking.ts` using the existing types
- Include all fields from the CounsellingBooking interface

### Step 2: Update Counselling API Route

- Import the new model and database connection
- Replace in-memory Map with MongoDB operations
- Update GET, POST, DELETE handlers to use database

### Step 3: Test the Integration

- Verify MongoDB connection works
- Test creating, fetching, and cancelling bookings

## Dependent Files to Edit

1. `src/models/CounsellingBooking.ts` - Create new model
2. `src/app/api/counselling/route.tsx` - Update to use database

## Followup Steps

- Test booking flow end-to-end
- Verify data persists across server restarts
