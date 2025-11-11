# Employer Approval Flow - Quick Reference Card

## 🎯 The Flow in 3 Steps

```
1. Complete Profile → 2. Admin Approves → 3. Post Jobs
```

## ✅ Required Profile Fields

- Company Name
- Description
- Location
- Phone
- Email

## 🔑 Key Endpoints

### Employer
```
GET  /api/employer/profile-completion    # Check status
POST /api/employer/jobs                  # Create job (protected)
```

### Admin
```
GET  /api/admin/employers/pending-approval    # Get pending
PUT  /api/admin/employers/:id/status          # Approve/Reject
```

## 🧪 Test Commands

```bash
# Test the flow
node backend/scripts/testEmployerApprovalFlow.js

# Migrate existing employers
node backend/scripts/migrateExistingEmployers.js
```

## 📊 Status Messages

| Status | Message | Can Post Jobs |
|--------|---------|---------------|
| No Profile | "Complete your company profile" | ❌ |
| Incomplete | "Missing fields: [list]" | ❌ |
| Complete, Not Approved | "Profile under admin review" | ❌ |
| Approved | "You can now post jobs!" | ✅ |

## 🚨 Error Codes

```javascript
403 + requiresProfile: true    // Profile incomplete
403 + requiresApproval: true   // Needs admin approval
400 + missingFields: []        // Admin: Cannot approve
```

## 💡 Quick Checks

**Employer can't post jobs?**
```bash
# Check profile status
curl -X GET http://localhost:5000/api/employer/profile-completion \
  -H "Authorization: Bearer TOKEN"
```

**Admin can't approve?**
- Profile must be 100% complete
- Check error message for missing fields

**Existing employers affected?**
```bash
# Auto-approve them
node backend/scripts/migrateExistingEmployers.js
```

## 📱 Frontend Integration

### Employer Dashboard
```javascript
// Fetch status
const { canPostJobs, message, missingFields } = await getProfileStatus();

// Disable button if not approved
<button disabled={!canPostJobs}>Post Job</button>

// Show message
<Alert>{message}</Alert>
```

### Admin Dashboard
```javascript
// Get pending approvals
const { data, count } = await getPendingApprovals();

// Show badge
<Badge>{count} Pending</Badge>

// Approve employer
await approveEmployer(employerId);
```

## 📚 Documentation Files

1. `EMPLOYER_APPROVAL_FLOW.md` - Complete guide
2. `EMPLOYER_APPROVAL_SETUP.md` - Setup instructions
3. `IMPLEMENTATION_COMPLETE.md` - Summary
4. `QUICK_REFERENCE.md` - This file

## 🎉 Success Checklist

- [x] Profile validation implemented
- [x] Admin approval required
- [x] Job posting protected
- [x] Notifications working
- [x] Test scripts ready
- [x] Migration script ready
- [ ] Frontend integration (pending)

---

**Need Help?** Check `EMPLOYER_APPROVAL_SETUP.md` for detailed instructions.
