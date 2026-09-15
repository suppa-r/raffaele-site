# Site-Wide Animation Optimization Patterns

## Overview
This document outlines the animation architecture and optimization patterns applied across raffaele-site to reduce redundancy, prevent CSS-JS conflicts, and improve maintainability.

---

## Pattern 1: Centralized Animation Constants

### File: `public/js/animation-constants.js`

All animation timing, easing, selectors, and utility functions are centralized in a single global object (`window.ANIMATION_CONSTANTS`).

**Benefits:**
- Single source of truth for all animation values
- Easy to audit and update site-wide timings
- Reduces hardcoded magic numbers scattered across files
- Enables consistent easing across pages

**Structure:**
```javascript
window.ANIMATION_CONSTANTS = {
  EASING: { standard, smooth, smooth2 },
  INTRO: { pageSelector, selectors, timing, slideOffset },
  INTRO1: { pageSelector, selectors, timing },
  killTweens(), hideElement(), revealElement() // Utility functions
}
```

**Usage in JS files:**
```javascript
const CONFIG = window.ANIMATION_CONSTANTS.INTRO;
const DURATION = CONFIG.timing.paragraphDuration;
const EASING = window.ANIMATION_CONSTANTS.EASING.standard;
```

---

## Pattern 2: CSS-JS Separation (Single Source of Truth)

### Rule: Let Either CSS OR JS Own a Property, Not Both

**Problem (Avoided):**
- CSS sets `visibility: hidden` with transitions
- JS sets `visibility: visible` via GSAP
- Browser repaints excessively; unpredictable timing

**Solution Applied:**

#### On Intro Page (`public/css/intro.css` + `public/js/introgasp.js`):
- **CSS owns:** Initial hidden state (`opacity: 0`, `transform: translateX(35vw)`)
- **JS owns:** Animation reveal (GSAP animates opacity, transform, visibility)
- No CSS transitions on animated properties; CSS is purely initial state

#### On Intro-1 Page (`public/css/intro-1.css` + `public/js/intro-1-anim.js`):
- **CSS owns:** Page structure (`:target` selectors, overlay states)
- **JS owns:** Entrance animations (nav items, footer, title lines)
- CSS transitions only on non-animated properties (overlay opacity)

#### On Home Page (`public/css/index.css` + `public/js/main.js`):
- **CSS owns:** Initial hidden state (`opacity: 0`)
- **JS owns:** Animation reveal via GSAP or manual transforms
- No conflicting CSS transitions

**Benefit:** Cleaner performance, predictable behavior, no cascade conflicts.

---

## Pattern 3: Hidden-Before-Init (Prevent First-Load Flash)

### Used On: Intro Page

**Problem:** On first page load, content renders briefly before JS initializes, causing a visible "snap" as GSAP takes over.

**Solution:**
1. CSS hides content with `opacity: 0` and `transform: translateX(35vw)`
2. JS initializes GSAP to set state offscreen: `gsap.set(selector, { x: "100vw", opacity: 0 })`
3. JS then animates reveal: `gsap.to(selector, { x: 0, opacity: 1, ... })`

**Result:** Content is hidden before JS runs, no flash, smooth animation from correct starting position.

**Files:** `public/css/intro.css` (lines 102-113), `public/js/introgasp.js` (resetIntroAnimationState)

---

## Pattern 4: Consistent Animation Configuration

### All Pages Use Centralized Timing

**Shared easing curves:**
```javascript
EASING.standard = "cubic-bezier(0.22, 1, 0.36, 1)"  // Standard ease-out
EASING.smooth = "power3.out"  // GSAP smooth curve
EASING.smooth2 = "power2.out"  // GSAP softer curve
```

**Per-page configurations:**
- `INTRO.timing.paragraphDuration = 0.9s`
- `INTRO1.timing.navRevealDuration = 0.9s`
- All durations, delays, stagger values stored in `window.ANIMATION_CONSTANTS`

**Benefit:** Changing site-wide animation speed requires only updating one file.

---

## Pattern 5: Utility Functions for Common Patterns

### From `window.ANIMATION_CONSTANTS`:

```javascript
// Hide an element with optional y-offset and opacity
hideElement(gsapLib, selector, { y, opacity })

// Reveal with animation or instant reveal
revealElement(gsapLib, selector, { y, opacity, duration, delay, stagger })

// Kill all active tweens on a selector
killTweens(gsapLib, [selector1, selector2, ...])
```

These functions abstract the pattern of:
- Check if GSAP exists
- If yes, use GSAP
- If no, fall back to manual style updates

---

## Script Load Order

### Intro Page (`intro.html`)
1. `theme-bootstrap.js` — Theme detection
2. `animation-constants.js` — Centralized config
3. `intro-theme-selector.js` — Theme switcher UI
4. `main.js` — Navigation and transitions
5. `introgasp.js` — Intro animations

### Intro-1 Page (`intro-1.html`)
1. `theme-bootstrap.js` — Theme detection
2. `animation-constants.js` — Centralized config
3. `intro-1-anim.js` — Entrance animations
4. `index.js` — Scroll behavior, header management
5. `intro-theme-selector.js` — Theme switcher UI
6. `nav-bar-for-intro.js` — Menu overlay

### Home Page (`index.html`)
1. `theme-bootstrap.js` — Theme detection
2. `animation-constants.js` — Centralized config
3. `intro-theme-selector.js` — Theme switcher UI
4. `nav.js` — Navigation menu
5. `main.js` — Navigation and transitions
6. `introgasp.js` — Home page animations (if GSAP used)

**Key:** `animation-constants.js` loads early so all other scripts can reference it.

---

## CSS Architecture

### Shared Across All Pages
- `tokens.css` — Design tokens (spacing, colors, fonts)
- `reset.css` — Browser reset
- `color-themes.css` — Theme variables (light/dark)
- `base.css` — Layout structure, wrapper, safe-area
- `transition.css` — View transition API
- `fonts.css` — Font loading
- `theme-switcher.css` — Theme selector UI

### Page-Specific
- `intro.css` — Intro page layout + hidden-before-init styles
- `index.css` — Home page layout + animation initial states
- `intro-1.css` — Intro-1 page layout + section reveal states
- `nav-new.css` — Navigation styles

**Principle:** Initial states (opacity, transform) in CSS; animations (duration, easing) in JS.

---

## Migration Path (Completed)

### ✅ Step 1: Created `animation-constants.js`
- Centralized all timing, easing, selectors
- Added utility functions for hide/reveal

### ✅ Step 2: Updated Intro Page
- Removed `visibility: hidden` from CSS
- Added `visibility: visible` to GSAP reveal animations
- Verified no errors

### ✅ Step 3: Updated Intro-1 Page
- Updated `intro-1-anim.js` to use `window.ANIMATION_CONSTANTS`
- Added script load to `intro-1.html`
- Verified alignment with pattern

### ✅ Step 4: Added to All HTML Files
- `intro.html`, `index.html`, `intro-1.html` all load `animation-constants.js`
- Script load order verified

---

## Performance Impact

### Reduced Overhead
- **Fewer CSS conflicts:** No visibility toggle thrashing
- **Cleaner selectors:** Separated opacity/transform rules
- **Shared constants:** Code reuse, smaller file size
- **Single initialization:** Animations set once, then run smoothly

### Browser Optimization
- Consistent animation model allows browser engine to pre-optimize
- Fewer style recalculations due to cleaner cascade
- Predictable repaint cycles (JS controls all reveal timing)

---

## Future Improvements

1. **Consider extracting easing values to CSS custom properties** for theming
2. **Audit index.html and intro-1.html** for unused animation constants
3. **Create page-specific overrides** if different timing is ever needed
4. **Document animation timing ratios** (e.g., "nav delay = footer delay * 1.5") for design consistency

---

## Maintenance Notes

When adding new animations:
1. Add timing/easing to `window.ANIMATION_CONSTANTS`
2. Use the centralized easing curves
3. Let CSS own initial hidden state; let JS own reveal
4. Use utility functions (hideElement, revealElement) for consistency
5. Test no CSS-JS conflicts with DevTools (check repaints/reflows)
