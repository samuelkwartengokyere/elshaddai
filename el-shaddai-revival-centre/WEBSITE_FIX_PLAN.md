# Website Audit & Fix Plan

## Completed Review - Issues Found:

### 🔴 Broken Links (Non-existent pages):

1. `/about/team` - Referenced but doesn't exist
2. `/plan-your-visit` - Referenced but doesn't exist
3. `/calendar` - Referenced but doesn't exist
4. `/financial-report` - Referenced but doesn't exist
5. `/prayer` - Referenced but doesn't exist
6. `/serve` - Referenced but doesn't exist

### ⚠️ Placeholder Links:

1. Footer social media links (Facebook, Instagram, Twitter, Youtube)
2. About page "View Full Team" link goes to `/about/team`
3. YouTube live stream embed uses placeholder `YOUR_CHANNEL_ID`

### 💡 Configuration Issues:

1. Inconsistent contact info between pages

## Implementation Plan:

### Step 1: Create Missing Pages

- [ ] Create `/src/app/about/team/page.tsx` - Full Team page
- [ ] Create `/src/app/plan-your-visit/page.tsx` - Plan Your Visit page
- [ ] Create `/src/app/prayer/page.tsx` - Prayer Request page
- [ ] Create `/src/app/serve/page.tsx` - Serve/Ministry page
- [ ] Create `/src/app/calendar/page.tsx` - Calendar page
- [ ] Create `/src/app/financial-report/page.tsx` - Financial Report page

### Step 2: Fix Links in Existing Pages

- [ ] Fix Footer.tsx social media links (add real URLs or remove)
- [ ] Fix About page links
- [ ] Fix Contact page links
- [ ] Fix Homepage "Visit Info" button

### Step 3: Fix Configuration Issues

- [ ] Fix YouTube embed with real channel ID
- [ ] Fix inconsistent phone numbers
- [ ] Add consistent contact info across all pages

### Step 4: Test All Links

- [ ] Verify all internal links work
- [ ] Test navigation
- [ ] Test buttons and CTAs
