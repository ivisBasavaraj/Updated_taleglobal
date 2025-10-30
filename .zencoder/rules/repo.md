# Repository Context

- **Name**: jobzz_2025
- **Primary Stack**: React frontend (Vite/Webpack), Node.js backend
- **Frontend entry**: `frontend/src/App.js`
- **Styling**: Global styles in `frontend/src/global-styles.css` plus component scoped CSS
- **Backend entry**: `backend/server.js`

## Frontend Structure
- **Components** in `frontend/src/components`
- **Layouts** in `frontend/src/layouts`
- **Pages** in `frontend/src/app`
- **Routing** handled in `frontend/src/routing`

## Common Tasks
1. Modify React components in `frontend/src`
2. Adjust styles using corresponding CSS files
3. Update backend APIs in `backend`

## UX Improvements (Latest)
- **Toast Notifications**: Replaced all `alert()` calls with smooth toast notifications (`utils/toastNotification.js`)
- **Debounced Search**: Added search input debouncing to reduce API calls (`utils/useDebounce.js`)
- **Better Loading States**: Created skeleton loaders for improved visual feedback (`components/SkeletonLoader.jsx`)
- **Async Operations Hook**: Added custom hook for managing async data (`utils/useAsync.js`)
- **Enhanced Accessibility**: 
  - Better keyboard navigation with focus states
  - ARIA labels and semantic HTML
  - Reduced motion support
  - Touch-friendly button sizes (min 44x44px on mobile)
- **Visual Feedback**:
  - Smooth transitions and animations
  - Better hover states with shadows
  - Improved button feedback (lift effect on hover)
  - Loading skeletons with pulse animation
- **Error Handling**: Better error messages with retry options
- **CSS Improvements** (`ux-improvements.css`):
  - Enhanced focus-visible for keyboard users
  - Better form input states
  - Smooth page transitions
  - Improved mobile responsiveness
  - Reduced motion support for accessibility
- **Category Cards Improvements** (Fixed in `index16-job-categories-orange.css`):
  - Removed orange background hover effect on category cards
  - Improved grid alignment - cards now properly centered (3-2 layout is now balanced)
  - Subtle lift effect with enhanced shadow on hover instead of color change
  - Maintains clean white card aesthetic with professional hover feedback

## Phase 3 Implementation (Issues #8-9 - COMPLETE)
- **Issue #8 - Footer Social Icons**: Standardized all footer components to use clean Font Awesome icons
  - Updated `footer1.jsx` to match footer2/3/4 style with plain Font Awesome icons (no inline style colors)
  - All footers now use consistent `fab fa-facebook-f`, `fab fa-twitter`, `fab fa-instagram`, `fab fa-youtube` icons
  - Icons inherit styling from CSS classes instead of inline styles
- **Issue #9 - Admin Pages Primary Color**: Unified admin panel to use primary color (`#fd7e14`) throughout
  - Updated `admin-dashboard.jsx`: All dashboard icons changed from `#ff6b35` to `#fd7e14`
  - Updated `admin-dashboard-styles.css`: Card gradients now use primary orange (`#fd7e14 → #ffa040`)
  - Updated `admin-sub-admin.jsx`: All instances of `#ff5a1f` replaced with `#fd7e14`
  - Updated 6 admin action files: `admin-emp-approve.jsx`, `admin-emp-manage.jsx`, `admin-emp-reject.jsx`, 
    `admin-placement-approve.jsx`, `admin-placement-manage.jsx`, `admin-placement-reject.jsx`
    - All blue buttons (`#5781FF`) now use primary color (`#fd7e14`)
  - Primary color is consistent across all admin pages and buttons

## CSS Architecture (CONSOLIDATED)
- **Master CSS File**: `frontend/src/consolidated-master-styles.css`
- All CSS consolidated into single file to eliminate cascade/specificity conflicts
- Organized into 14 logical sections with clear documentation
- Replaces 11 individual CSS files (now consolidated)
- See `CSS_CONSOLIDATION_GUIDE.md` for details

## Testing
- **Target Framework**: Playwright
- **Test Directory**: `tests/`
- **Existing Tests**: 
  - `category-cards-orange-theme.spec.js` - Category cards visual tests
  - `employer-mobile-responsiveness.spec.js` - Employer panel mobile tests

## Notes
- **Do NOT create new CSS files** - add styles to `consolidated-master-styles.css`
- Ensure consistent styling via single master CSS file
- Prefer reusable components and hooks
- Follow existing code formatting and linting conventions
- Always use toast notifications instead of `alert()`
- Use debounced search for better performance
- Add skeleton loaders for async operations

## Fixed Issues
- **Employer Profile Fields (Latest)**: Fixed storage of "Why Join Us" and "Google Maps Embed Code" fields to MongoDB
  - Updated `employerController.js`: Added explicit field preservation for text fields
  - Added console logging for debugging field storage
  - Verified model has all required fields in `EmployerProfile.js`
  - Frontend correctly sends data in `emp-company-profile.jsx`