# Interview Process & Assessment Update Fix

## Issues
1. When editing a job at `/employer/edit-job/:id`, the Interview Process data (interviewRoundDetails) was not being properly updated in the database
2. Assessment selection was not being stored in the database

## Root Causes
1. The `findOneAndUpdate` operation was receiving the interview round details, but empty round objects were being saved, causing data inconsistency
2. Frontend was sending `assignedAssessment` but the database field is `assessmentId` - field name mismatch

## Solution Applied

### Backend Fix (`backend/controllers/employerController.js`)

#### 1. Assessment Field Mapping
Added field name mapping in both `createJob` and `updateJob` functions:

```javascript
// Map assignedAssessment to assessmentId
if (req.body.assignedAssessment) {
  req.body.assessmentId = req.body.assignedAssessment;
  delete req.body.assignedAssessment;
}
```

#### 2. Interview Round Details Cleanup
Added data cleanup logic before updating the job:

```javascript
// Ensure interviewRoundDetails is properly set
if (req.body.interviewRoundDetails) {
  // Clean up empty round details
  Object.keys(req.body.interviewRoundDetails).forEach(key => {
    const round = req.body.interviewRoundDetails[key];
    if (!round || (!round.description && !round.fromDate && !round.toDate && !round.time)) {
      delete req.body.interviewRoundDetails[key];
    }
  });
}
```

This ensures:
1. Assessment selection is properly mapped to the correct database field
2. Empty round objects are removed before saving
3. Only rounds with actual data are stored in the database
4. The update operation properly reflects all changes

## Testing

### To verify the fix:

1. **Login as Employer**
2. **Navigate to** `/employer/manage-jobs`
3. **Click Edit** on any job
4. **Update Interview Process & Assessment**:
   - Select interview round types (Technical, HR, etc.)
   - Fill in round details (description, dates, time)
   - If Assessment is selected, choose an assessment from dropdown
   - Click "Update Job"

5. **Verify in Database**:
   ```javascript
   // In MongoDB or via API
   db.jobs.findOne({ _id: "job_id" })
   // Check interviewRoundDetails field
   // Check assessmentId field (should contain the selected assessment ID)
   ```

6. **Verify on Frontend**:
   - Refresh the edit page
   - Check if the interview round details are populated correctly
   - Verify selected assessment is shown in dropdown
   - Verify candidate status page shows updated interview information

## Files Modified

- `backend/controllers/employerController.js` - Added cleanup logic for interviewRoundDetails

## Additional Notes

- The fix maintains backward compatibility
- Empty rounds are automatically cleaned up
- No frontend changes required
- Works with existing job data structure
