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

## Notes
- Ensure consistent styling via `global-styles.css`
- Prefer reusable components and hooks
- Follow existing code formatting and linting conventions
- Always use toast notifications instead of `alert()`
- Use debounced search for better performance
- Add skeleton loaders for async operations