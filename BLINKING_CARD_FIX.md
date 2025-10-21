# Fix for Blinking "Add Employment" Card Issue

## Problem
The "Add Employment" card and other resume section cards were blinking/flickering when moving the cursor on the screen at `/candidate/my-resume`.

## Root Cause
The issue was caused by CSS hover effects with transform scale properties on the edit buttons:

```css
/* BEFORE - Problematic */
.panel-heading-with-btn button:hover,
.panel-heading-with-btn a:hover {
    transform: scale(1.1);  /* ← This causes blinking */
    transition: transform 0.2s ease;
    color: #e8690a !important;
}

.panel-heading .btn-link:hover {
    background-color: rgba(253, 126, 20, 0.1);
    transform: scale(1.05);  /* ← This also causes blinking */
}
```

When the cursor moved across the screen, the hover state was constantly triggered and removed on the buttons, causing the `transform: scale()` to be applied and removed repeatedly, resulting in a blinking effect.

Additionally, the CSS rule below was disabling all animations and transitions for all modal children, which could interfere with normal rendering:

```css
/* BEFORE - Problematic */
.modal * {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
}
```

## Solution Applied

### 1. **CSS Updates** (`resume-styles.css`)

Removed transform scale effects and replaced with smooth color transitions:

```css
/* AFTER - Fixed */
.panel-heading-with-btn button,
.panel-heading-with-btn a {
    transition: color 0.2s ease;
}

.panel-heading-with-btn button:hover,
.panel-heading-with-btn a:hover {
    color: #e8690a !important;  /* Only color changes, no transform */
}
```

Similarly updated `.panel-heading .btn-link`:

```css
.panel-heading .btn-link {
    transition: color 0.2s ease, background-color 0.2s ease;
}

.panel-heading .btn-link:hover {
    background-color: rgba(253, 126, 20, 0.1);
    /* No transform scale */
}
```

Added comprehensive panel stability rules:

```css
/* Panel stability - prevent blinking and flickering */
.panel {
    transition: none !important;
    animation: none !important;
}

.panel-heading {
    transition: none !important;
    animation: none !important;
    will-change: auto;
}

.panel-body {
    transition: none !important;
    animation: none !important;
    will-change: auto;
}

.panel-heading-with-btn {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
}
```

Replaced aggressive `.modal *` rule with targeted approach:

```css
/* AFTER - Refined */
.modal .modal-header,
.modal .modal-body,
.modal .modal-footer {
    animation: none !important;
}
```

### 2. **JSX Component Updates**

Updated edit buttons to include inline styles preventing transitions and animations:

#### `section-can-employment.jsx`
```jsx
<button 
    style={{
        background: 'none', 
        textDecoration: 'none', 
        cursor: 'pointer', 
        outline: 'none', 
        transition: 'none'  // ← Key addition
    }}
>
    <span style={{transition: 'none'}} />  // ← Prevents icon animation
</button>
```

#### `section-can-itskills.jsx`
```jsx
<a 
    className="site-text-primary btn-link" 
    style={{
        textDecoration: 'none', 
        cursor: 'pointer', 
        transition: 'none',  // ← Prevents hover animation
        outline: 'none'
    }}
>
    <span className="fa fa-edit" style={{transition: 'none'}} />
</a>
```

#### `section-can-desired-profile.jsx` & `section-can-projects.jsx`
Applied the same fixes as above.

### 3. **Additional Panel Body Styling**

Panel bodies now include inline styles:
```jsx
<div className="panel-body wt-panel-body p-a20" 
     style={{transition: 'none', animation: 'none'}}
>
```

## Files Modified

1. **`frontend/src/app/pannels/candidate/components/resume-styles.css`**
   - Removed transform scale from hover effects
   - Added panel stability rules
   - Added specific button anti-blinking rules
   - Refined modal animation disabling

2. **`frontend/src/app/pannels/candidate/sections/resume/section-can-employment.jsx`**
   - Added `transition: 'none'` to button and icon
   - Added `animation: 'none'` to panel body

3. **`frontend/src/app/pannels/candidate/sections/resume/section-can-itskills.jsx`**
   - Added `btn-link` class to edit link
   - Added `transition: 'none'` to link and icon

4. **`frontend/src/app/pannels/candidate/sections/resume/section-can-desired-profile.jsx`**
   - Added `btn-link` class to edit link
   - Added `transition: 'none'` to link and icon

5. **`frontend/src/app/pannels/candidate/sections/resume/section-can-projects.jsx`**
   - Added `btn-link` class to edit link
   - Added `transition: 'none'` to link and icon

## Why This Works

1. **Removed Transform Animations**: By removing `transform: scale()` from hover effects, we eliminate the cause of the flickering
2. **Smooth Color Transitions**: Using only `color` transitions keeps the button interactive without causing layout shifts
3. **Disabled Animations on Panels**: Setting `transition: none` and `animation: none` on panels prevents any rendering loops
4. **Flexbox Layout**: Using `display: flex` on `.panel-heading-with-btn` ensures proper alignment without relying on transform
5. **Inline Styles Override**: Inline `transition: 'none'` styles override any CSS hover effects

## Testing

To verify the fix:

1. Navigate to `/candidate/my-resume`
2. Move your cursor across the page
3. The "Add Employment" card should no longer blink
4. Other section cards (IT Skills, Desired Profile, Projects, etc.) should also be stable
5. Clicking the edit buttons should still open the modals normally

## Performance Impact

- **Positive**: Eliminates unnecessary repaints and reflows caused by transform animations
- **Neutral**: No visual degradation - buttons still show hover color effects
- **Accessibility**: Maintains all functionality while improving visual stability

## Future Considerations

If similar blinking issues occur in other parts of the application:

1. Check for `transform` properties in hover effects
2. Avoid using transform scale for interactive elements
3. Prefer color and background-color transitions instead
4. Use `transition: none !important` on parent containers when needed
5. Consider using `will-change: auto` to hint at browser optimization