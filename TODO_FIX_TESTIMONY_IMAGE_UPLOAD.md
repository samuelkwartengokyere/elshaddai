# Fix Testimony Image Upload - Missing Required Fields

## Issue

When uploading an image for a testimony, the API returns "required field missing" error because the media API requires additional fields.

## Root Cause

The media API (`/api/media`) requires `title`, `type`, `category`, and `date` fields for uploads, but the testimonies page only sends the `file`.

## Plan

1. ✅ Identify the issue in media API and testimonies page
2. ✅ Update image upload FormData in `handleCreate` function to include required fields
3. ✅ Update image upload FormData in `handleUpdate` function to include required fields

## Changes Required

In `handleCreate` and `handleUpdate` functions, update the image FormData to include:

- `title` - Use the testimony title
- `type` - Set to 'image'
- `category` - Set to 'other'
- `date` - Use the testimony date

## Status: COMPLETED ✅

## Changes Made

### File: `/home/samuel/Desktop/El-shaddai-web/elshaddai/el-shaddai-revival-centre/src/app/admin/testimonies/page.tsx`

#### In `handleCreate` function (around line 182):

```javascript
// Upload image if a file is selected
if (selectedFile) {
  setImageUploading(true);
  const imageFormData = new FormData();
  imageFormData.append("file", selectedFile);
  // Add required fields for media API
  imageFormData.append("title", formData.title || "Testimony Image");
  imageFormData.append("type", "image");
  imageFormData.append("category", "other");
  imageFormData.append("date", formData.date);

  const imageResponse = await fetch("/api/media", {
    method: "POST",
    body: imageFormData,
  });
  // ... rest of code
}
```

#### In `handleUpdate` function (around line 255):

```javascript
// Upload new image if a file is selected
if (selectedFile) {
  setImageUploading(true);
  const imageFormData = new FormData();
  imageFormData.append("file", selectedFile);
  // Add required fields for media API
  imageFormData.append("title", formData.title || "Testimony Image");
  imageFormData.append("type", "image");
  imageFormData.append("category", "other");
  imageFormData.append("date", formData.date);

  const imageResponse = await fetch("/api/media", {
    method: "POST",
    body: imageFormData,
  });
  // ... rest of code
}
```
