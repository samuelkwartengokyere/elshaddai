# Fix Console Error: Empty src="" Attribute

Status: In Progress

## Approved Plan Steps:

### 1. ✅ Understand Project [COMPLETED]

### 2. ✅ Update Header.tsx [COMPLETED]

- Updated default logo, LOCAL_LOGO to '/church-logo.svg'
- src={settings.logoUrl || '/church-logo.svg'}

### 3. ✅ Update CounsellingBooking.tsx [COMPLETED]

- Fixed 2 img src={imageUrl} → src={imageUrl || '/file.svg'}

### 4. ✅ Update ImageUpload.tsx [COMPLETED]

- Added conditional render inside img div to prevent src={value} when empty

### 5. Test Changes [PENDING]

- Run `cd el-shaddai-revival-centre && npm run dev`
- Check console on homepage, /counselling

### 6. Verify [PENDING]

- Confirm no src="" warnings

### 7. Completion [PENDING]

- Run `cd el-shaddai-revival-centre && npm run dev`
- Check homepage, /counselling console for errors

### 6. Verify APIs optional [PENDING]

- Check /api/settings, /api/counsellors data
- Update DB if needed

### 7. Completion [PENDING]

- attempt_completion once verified no errors

Next step: Edit Header.tsx
