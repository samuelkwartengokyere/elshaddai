/** Stored in DB / API `category` field — labels are admin & public display names. */
export const EVENT_CATEGORY_OPTIONS = [
  { value: 'revival', label: 'Revival', calendarColor: 'bg-orange-500' },
  { value: 'special', label: 'Special Day', calendarColor: 'bg-green-500' },
  { value: 'holiday', label: 'Holiday Program', calendarColor: 'bg-blue-500' },
  { value: 'mentees', label: 'Mentees Program', calendarColor: 'bg-purple-500' },
  { value: 'outreach', label: 'Outreach', calendarColor: 'bg-teal-500' },
] as const

export type EventCategorySlug = (typeof EVENT_CATEGORY_OPTIONS)[number]['value']

export function formatEventCategoryLabel(slug: string): string {
  const row = EVENT_CATEGORY_OPTIONS.find((o) => o.value === slug)
  return row?.label ?? slug
}
