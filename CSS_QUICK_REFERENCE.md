# CSS Quick Reference Guide

## 🎯 TL;DR - The Big Picture

**Single CSS file consolidates 11+ separate files**

```javascript
// App.js imports this:
import "./consolidated-master-styles.css";
```

**That's it!** No more CSS override headaches.

---

## 📝 File Structure

### Where is all CSS?
📁 `frontend/src/consolidated-master-styles.css` - **ALL CSS HERE**

### What sections?
```
1. Color Scheme & Light Mode
2. Base/Global Styles
3. Modal & Backdrop
4. Form Controls & Inputs
5. Button Styles
6. Animations & Transitions
7. Card & Container Styles
8. Navigation & Logo
9. Mobile Responsive (General)
10. Mobile Responsive (Employer)
11. Mobile Responsive (Index16)
12. Scrolling & Overflow
13. Orange Color Preservation
14. Accessibility & UX
```

---

## 🎨 Color Variables

```css
/* Use these in CSS */
--color-primary-orange: #fd7e14
--color-primary-orange-dark: #e8690a
--color-blue-primary: #2563eb
--color-bg-white: #ffffff
--color-text-dark: #111827
--color-text-gray: #6b7280
```

**Example:**
```css
button {
  background-color: var(--color-primary-orange);
}
```

---

## ✅ Adding New Styles

### Step 1: Open File
`frontend/src/consolidated-master-styles.css`

### Step 2: Find Section
Look at table of contents at top

### Step 3: Add Style
```css
/* ===== YOUR NEW STYLE SECTION ===== */
.my-new-class {
  background-color: var(--color-bg-white);
  color: var(--color-text-dark);
  /* your styles */
}
```

### Step 4: Test Responsiveness
```
Desktop:      1200px+
Laptop:       992px - 1199px
Tablet:       768px - 991px
Mobile:       767px and below
Small Mobile: 575px and below
```

### Step 5: Commit
```bash
git add frontend/src/consolidated-master-styles.css
git commit -m "style: add my-new-class styling"
```

---

## 🚫 DON'T DO THIS

```javascript
// ❌ Don't create new CSS files
import "./my-new-styles.css";

// ❌ Don't use inline styles
<div style={{ color: 'red' }}>Text</div>

// ❌ Don't repeat existing styles
/* Already defined in consolidated file */

// ❌ Don't overuse !important
background-color: red !important; /* Only if absolutely necessary */
```

---

## ✅ DO THIS INSTEAD

```javascript
// ✅ Add to consolidated-master-styles.css
.my-class {
  background-color: var(--color-primary-orange);
}

// ✅ Use semantic HTML
<div className="my-class">Text</div>

// ✅ Reuse existing styles from same section
/* Check if similar style exists first */

// ✅ Avoid !important
background-color: var(--color-primary-orange);
```

---

## 📱 Responsive Breakpoints

```css
/* Tablet & Up */
@media (min-width: 768px) and (max-width: 991px) {
  /* Tablet specific styles */
}

/* Mobile Only */
@media (max-width: 767px) {
  /* Mobile styles */
}

/* Small Mobile */
@media (max-width: 575px) {
  /* Extra small mobile */
}
```

---

## 🎬 Common Use Cases

### Change Button Color
```css
/* Update in Section 5: Button Styles */
button {
  background-color: var(--color-primary-orange);
}
```

### Add Mobile Responsive Style
```css
/* Add in Section 9 or 10 */
@media (max-width: 767px) {
  .my-class {
    font-size: 14px;
  }
}
```

### Add Animation
```css
/* Add in Section 6: Animations */
@keyframes my-animation {
  from { opacity: 0; }
  to { opacity: 1; }
}

.my-animated-class {
  animation: my-animation 0.3s ease;
}
```

---

## 🔍 Finding Styles

### Search in File
- Press `Ctrl+F` in VS Code
- Type class/element name
- Find where it's defined in consolidated file

### Example
```
Search: ".site-button"
Found in: Section 5: Button Styles
Result: All button styling in one place
```

---

## ⚠️ Common Issues

### Issue: "Button not styled"
**Solution:** Check Section 5 for button styles

### Issue: "Mobile not responsive"
**Solution:** Add media query in Section 9 or 10

### Issue: "Color doesn't match"
**Solution:** Use CSS variables instead of hardcoded colors

### Issue: "Style applies to multiple elements"
**Solution:** Use more specific selector or check other sections

---

## 📚 Documentation

For more details, see:
- `CSS_CONSOLIDATION_GUIDE.md` - Full guide
- `CSS_CONSOLIDATION_SUMMARY.md` - Overview
- `CSS_CONSOLIDATION_CHANGES.md` - What changed

---

## 💡 Tips

### Tip 1: Use Comments
```css
/* Clear section headers help others find your code */
```

### Tip 2: Group Related Styles
```css
/* Put all button-related styles together */
button { }
button:hover { }
button:active { }
```

### Tip 3: Test Across Devices
- Desktop (1200px+)
- Tablet (768px-991px)
- Mobile (max 767px)

### Tip 4: Use Semantic Class Names
```css
/* Good */
.job-card-title { }

/* Bad */
.red-text-12 { }
```

---

## 🎓 Learning Resources

1. Read section comments in consolidated file
2. Look at similar styles in same section
3. Test in browser DevTools
4. Ask team for help

---

## ✨ Key Takeaway

```
Before: 11 CSS files → CSS conflicts
After:  1 CSS file → No conflicts

Just add your styles to:
frontend/src/consolidated-master-styles.css
```

That's all you need to know! 🚀

---

**Last Updated:** 2025
**Status:** Active & In Use ✅