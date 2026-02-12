# Admin Pages Fix Plan

## Issues Identified:

1. Modal backdrops use invalid `backdrop-blur-3xl` instead of `backdrop-blur-md`
2. Modal structure has incorrect z-index layering
3. Teams API lacks timeout handling (unlike other APIs)
4. Admin pages don't handle API errors gracefully - show infinite loading

## Fix Plan:

### 1. Fix Modal Backdrops in All Admin Pages

Replace `backdrop-blur-3xl` with `backdrop-blur-md` and fix z-index layering:

- [ ] calendar/page.tsx
- [ ] events/page.tsx
- [ ] sermons/page.tsx
- [ ] media/page.tsx
- [ ] testimonies/page.tsx
- [ ] teams/page.tsx
- [ ] settings/page.tsx

### 2. Add Timeout Handling to Teams API

Add AbortController and timeout similar to other API routes:

- [ ] /api/teams/route.tsx

### 3. Add Error State Handling to Admin Pages

When API fails, show error state instead of infinite loading:

- [ ] calendar/page.tsx
- [ ] events/page.tsx
- [ ] sermons/page.tsx
- [ ] media/page.tsx
- [ ] testimonies/page.tsx
- [ ] teams/page.tsx

## Changes per File (Modal Backdrop Fix):

Replace the modal backdrop structure from:

```jsx
{showModal && (
  <>
    <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-3xl" />
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="relative bg-white ...">
```

To:

```jsx
{showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Backdrop */}
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md" />
    {/* Modal content */}
    <div className="relative bg-white ...">
```
