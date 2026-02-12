# TODO: Update Admin Sermons Pagination to Match Main Website

## Task

Update the pagination on the admin sermons page (`/admin/sermons/page.tsx`) to match the pagination style used on the main website sermons page (`/sermons/page.tsx`).

## Changes Required

### File: `el-shaddai-revival-centre/src/app/admin/sermons/page.tsx`

Replace the current pagination section:

```jsx
{
  /* Pagination */
}
{
  pagination.totalPages > 1 && (
    <div className="flex justify-center mt-8 space-x-2">
      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
        (page) => (
          <button
            key={page}
            onClick={() => setPagination((prev) => ({ ...prev, page }))}
            className={`px-4 py-2 rounded-lg ${
              pagination.page === page
                ? "bg-accent text-white"
                : "bg-white border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        )
      )}
    </div>
  );
}
```

With the main website style pagination:

```jsx
{
  /* Pagination with Previous/Next buttons and range info */
}
{
  pagination.totalPages > 1 && (
    <div className="flex flex-col items-center mt-12 space-y-4">
      {/* Previous/Next Buttons with << and >> icons */}
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
          }}
          disabled={pagination.page === 1}
          className={`flex items-center px-4 py-2 rounded-lg transition duration-300 ${
            pagination.page === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-accent text-white hover:bg-red-700"
          }`}
        >
          <span className="text-lg font-bold mr-2">«</span>
          Previous
        </button>

        {/* Page indicator */}
        <span className="text-gray-600 font-medium px-4">
          Page {pagination.page} of {pagination.totalPages}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
          }}
          disabled={pagination.page === pagination.totalPages}
          className={`flex items-center px-4 py-2 rounded-lg transition duration-300 ${
            pagination.page === pagination.totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-accent text-white hover:bg-red-700"
          }`}
        >
          Next
          <span className="text-lg font-bold ml-2">»</span>
        </button>
      </div>
    </div>
  );
}
```

## Status

- [x] Update admin sermons pagination
- [ ] Test the changes work correctly

## Notes

- The main website uses `e.preventDefault()` to prevent form submission when buttons are inside a form
- The styling matches the existing admin theme (bg-accent, hover:bg-red-700)
- The pagination provides better UX for admin users with many sermons
