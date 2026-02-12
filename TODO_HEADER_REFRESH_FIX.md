# Media Dropdown Header Refresh Fix

## Problem

When hovering on the Media tab dropdown, the whole header component refreshes/re-renders with animations re-triggering.

## Root Cause

1. `motion.div` components have `initial` props that re-trigger animations on every re-render
2. State changes (`isMediaOpen`) cause full Header re-render
3. All nav items animations re-execute when parent re-renders

## Fix Applied ✅

### Step 1: Remove initial props from motion.div components ✅

- Removed `initial={{ opacity: 0, y: -10 }}` from DesktopNavItem motion.divs
- Removed `initial={{ opacity: 0, y: -20 }}` from Header motion.header
- Removed `initial={{ opacity: 0, x: -20 }}` from mobile nav motion.divs

### Step 2: Add useMemo for navItems ✅

- Memoized navItems array to prevent recreation on re-renders

### Step 3: Remove unused index parameters ✅

- Updated DesktopNavItem component signature to remove unused `index` prop

## Files Edited

1. `el-shaddai-revival-centre/src/components/Header.tsx`

## Testing Checklist

- [x] Verify hover dropdown doesn't trigger header refresh
- [x] Verify animations only play on initial mount
- [x] Verify dropdown open/close still works smoothly
- [x] Test mobile menu functionality
- [x] Linting passes
