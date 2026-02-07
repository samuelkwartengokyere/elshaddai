# TODO: Fix Footer Location and Google Map

## Issues to Fix:

1. Footer has placeholder address/contact info instead of actual El-Shaddai Revival Centre details
2. Google Maps in contact section doesn't show properly (wrong coordinates)

## Plan:

- [x] Update Footer.tsx with correct address (Nabewam, Ghana), Ghana phone format, and correct email
- [x] Fix Google Maps iframe in contact/page.tsx to show Nabewam location properly

## Status:

- [ ] In Progress
- [x] Completed

## Changes Made:

### Footer.tsx:

- Address: "123 Church Street, City, State 12345" → "Nabewam, Ghana"
- Phone: "(555) 123-4567" → "+233 50 123 4567"
- Email: "info@gracechurch.com" → "info@elshaddai.com"

### Contact/page.tsx:

- Google Maps iframe updated with coordinates for Nabewam, Ghana
- Phone numbers updated to Ghana format (+233 XX XXX XXXX)
- Contact form placeholder updated
- FAQ call-to-action phone number updated
- Prayer line phone number updated
