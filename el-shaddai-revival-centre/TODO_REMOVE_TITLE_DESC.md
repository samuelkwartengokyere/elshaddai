# Remove Title and Description from Admin Image Upload

## Steps

- [x] Update `src/types/media.ts` - Make title optional, remove title/description from MediaFormData
- [x] Update `src/app/admin/media/page.tsx` - Remove title/description inputs, update state/handlers/display
- [x] Update `src/app/api/media/route.tsx` - Remove title/description from required validation, auto-generate title
- [x] Update `src/app/api/media/bulk-upload/route.tsx` - Remove description parsing, set description to null
- [ ] Test/build verification
