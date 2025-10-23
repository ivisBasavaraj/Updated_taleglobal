# Holidays API Integration

This document describes the integration of Nager.Date Public Holidays API for interview date selection in the job posting system.

## Features

- **Holiday Detection**: Automatically checks if selected interview dates fall on public holidays
- **Weekend Detection**: Identifies weekends (Saturday/Sunday) 
- **Visual Indicators**: Shows holiday/weekend warnings in the UI
- **Fallback Data**: Uses predefined Indian holidays if API is unavailable
- **Caching**: Caches holiday data for 24 hours to reduce API calls

## API Endpoints

### Backend Routes

- `GET /api/holidays/:year` - Get all holidays for a specific year
- `GET /api/check/:date` - Check if a specific date is a holiday/weekend

### Example Usage

```javascript
// Check if a date is a holiday
const response = await fetch('/api/check/2024-01-26');
const data = await response.json();
// Returns: { success: true, isHoliday: true, holidayInfo: {...}, isWeekend: false }
```

## Frontend Integration

### Job Posting Form
- Interview date fields automatically check for holidays
- Visual indicators appear below date inputs
- Alert notifications for holiday selections

### Components
- `HolidayIndicator.jsx` - Reusable component for displaying holiday/weekend info
- `holidaysApi.js` - Utility functions for API calls

## Fallback Holidays (India)

The system includes predefined holidays for India:
- Republic Day (Jan 26)
- Independence Day (Aug 15) 
- Gandhi Jayanti (Oct 2)
- Christmas Day (Dec 25)
- Holi (varies by year)

## Configuration

The holidays service can be configured for different countries by changing the `countryCode` parameter (default: 'IN' for India).

## Error Handling

- API failures gracefully fall back to predefined holidays
- Network timeouts are handled with 5-second timeout
- Empty responses trigger fallback mechanism
- All errors are logged for debugging

## Testing

Run the test script to verify integration:
```bash
cd backend
node test-holidays.js
```

This integration helps employers avoid scheduling interviews on public holidays, improving the candidate experience and interview attendance rates.