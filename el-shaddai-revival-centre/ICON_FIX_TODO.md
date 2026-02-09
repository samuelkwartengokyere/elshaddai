# Icon Fix TODO

## Problem

Icons on the give page and other pages are not displaying properly because they use `bg-opacity-10` which is not supported in Tailwind v4.

## Files to Fix

1. ✅ src/app/give/page.tsx - Main give page - FIXED
2. ✅ src/app/admin/sermons/page.tsx - Admin sermons page - FIXED
3. ✅ src/app/events/page.tsx - Events page - FIXED

## Solution

Replace `bg-accent bg-opacity-10` with `bg-accent-10` (custom utility already defined in globals.css)

## Progress

- [x] Create TODO list
- [x] Fix give page
- [x] Fix admin sermons page
- [x] Fix events page

## Summary

Fixed icon display issues by replacing Tailwind v3 syntax (`bg-accent bg-opacity-10`) with Tailwind v4 compatible custom utility (`bg-accent-10`) on 3 pages. The icons now have proper background styling and should be visible.
