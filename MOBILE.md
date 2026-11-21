# Verdant Mobile Responsiveness & Native Experience Overhaul

## 1. Executive Summary & Design System Alignment
This document outlines the mobile UI/UX overhaul of the Verdant job portal. In adherence to the **Desktop Protection Protocol**, all desktop views (viewport `>= 1024px`) remain **pixel-for-pixel identical** to the baseline state. Every styling addition and modification is strictly scoped inside `@media (max-width: 1023px)` or tighter media queries.

### Design Tokens & Aesthetics
- **Theme**: Fresh white + garden green (`--bg-page: #F7FBF8`, `--white: #FFFFFF`, `--mint-100: #E3F4E9`, `--green-500: #2FB36A`, `--green-600: #1E9A56`, `--green-900: #0B3D24`, `--lime-accent: #C8F169`).
- **Typography**: Fraunces (Headings, serif) + Plus Jakarta Sans (Body & UI, sans-serif).
- **Radius System**: 8px (small), 14px (medium), 20px (cards), 28px (bottom sheets), 9999px (pills).
- **Breakpoints**:
  - Small Phone: `<= 379px`
  - Phone: `<= 767px`
  - Tablet: `768px – 1023px`
  - Desktop: `>= 1024px` (Pixel-protected, untouched)

---

## 2. Pre-Implementation Audit (Viewports 360px, 390px, 430px)

### A. Navigation & Shell
- **Public Navbar**:
  - *Current Issues*: Mobile menu is an abrupt dropdown list rather than a native-feeling slide-in drawer; lacks green-tinted blurred backdrop, search button shortcut, and safe-area insets.
  - *Audit Finding*: Tap targets < 44px; hamburger button lacks distinct hit area; body scrolling is not locked when drawer is open.
- **Dashboards (Seeker, Employer, Admin)**:
  - *Current Issues*: Desktop 260px sidebar is hidden behind a simple toggle, but there is no mobile app bar or floating bottom navigation.
  - *Audit Finding*: Navigating between core views requires repeatedly opening an off-canvas drawer. No quick thumb access to Home, Jobs, Saved, Applications, Post Job, or Kanban.

### B. Landing Page (`/`)
- **Hero Section**:
  - *Current Issues*: H1 font size (56px) overflows or wraps into 5 cramped lines; decorative floating cards collide or stack awkwardly; search input uses desktop inline flex causing horizontal squishing.
  - *Audit Finding*: Popular chips row wraps into multiline clutter without snap-scrolling.
- **Trusted By**:
  - *Current Issues*: Static flex-wrap consumes vertical space. Needs slow horizontal marquee with pause-on-touch.
- **Categories**:
  - *Current Issues*: Grid cards are overly tall and misaligned on narrow screens. Needs a compact 2-column layout (56px min-height) with mint circular icons.
- **Featured Jobs**:
  - *Current Issues*: Vertical stack makes the page excessively long. Needs a horizontal scroll-snap carousel (85% width peek) with dot indicators.
- **How It Works**:
  - *Current Issues*: Horizontal 3-column step cards wrap awkwardly. Needs vertical timeline with green connector line.
- **Stats & Testimonials**:
  - *Current Issues*: Stats banner is stretched; testimonials stack vertically. Needs 2x2 stats grid and swipeable testimonial carousel.
- **Footer**:
  - *Current Issues*: 4 link columns create a 600px vertical list. Needs collapsible accordions.

### C. Jobs Listing Page (`/jobs`)
- **Filter Sidebar vs Results**:
  - *Current Issues*: Filter sidebar pushes the entire job list far below the fold.
  - *Audit Finding*: No sticky compact search header, no quick filter chips row (Remote, Internship, Full-time, Fresher), no modal/bottom sheet for detailed filtering.
  - *Job Cards*: Action buttons are tiny, company verification badge lacks alignment, card tags wrap uncontrollably.

### D. Job Details Page (`/jobs/[id]`)
- **Layout**:
  - *Current Issues*: 2-column layout (content + right sticky sidebar) renders right sidebar at the very bottom beneath long text descriptions.
  - *Audit Finding*: No sticky bottom action bar (Apply Now + Bookmark). Users must scroll thousands of pixels to find the apply button.
  - *Apply Flow*: Apply modal is centered on desktop, clipping off top/bottom on mobile viewports. Needs full-screen bottom sheet with multi-step progress.

### E. Auth Pages (`/login`, `/register`)
- **Showcase Panel**:
  - *Current Issues*: Desktop two-column split screen hides or squeezes form on mobile.
  - *Audit Finding*: Register role switcher is cramped; inputs lack 16px font-size protection (causing iOS Safari auto-zoom); submit buttons can get obscured by virtual keyboard.

### F. Job Seeker Dashboard (`/dashboard/seeker/...`)
- **Overview**: 4 stat cards stack into a tall vertical list; profile strength ring card takes excessive vertical room; applications table causes horizontal overflow.
- **My Applications**: Horizontal application progress bar overflows 360px viewport; needs vertical timeline card.
- **Profile**: Hero cover banner is too tall (180px); resume drag-and-drop area is not optimized for mobile tap-to-upload.

### G. Employer Dashboard (`/dashboard/employer/...`)
- **Overview**: Stat cards and Recharts graphs are fixed-width or cramped; tooltips are difficult to tap.
- **Post-a-Job Wizard**: Side preview card takes 50% width on desktop, breaking mobile completely. Needs single-column stepper with live preview in step 4.
- **My Jobs**: Table causes severe horizontal scrolling; row action buttons are tiny (< 32px).
- **Applicants Kanban**: 5 horizontal columns break layout; drag-and-drop is unreliable on touch screens. Needs swipeable scroll-snap columns (88% width) with sticky column-tab strip and tap-to-move bottom sheet.

### H. Admin Dashboard (`/dashboard/admin/...`)
- **Navigation & Tables**: Dark sidebar hides key metrics; tables (Users, Jobs, Reports) overflow horizontally; action buttons (Approve/Reject) are too small for thumb accuracy.

---

## 3. Architecture of Mobile Foundations & Components

### Mobile Breakpoints & Rules
- All mobile overrides live strictly inside `@media (max-width: 1023px)` (and `@media (max-width: 767px)` for phones).
- Wide containers (Kanban, DataTables, Code) enforce `min-width: 0`, `overflow-x: auto`, and `-webkit-overflow-scrolling: touch`.
- All tap targets are padded to `>= 44x44px`.
- Form inputs specify `font-size: 16px` to prevent iOS viewport auto-zoom.
- Mobile bottom sheets utilize `100dvh` and safe-area insets (`env(safe-area-inset-bottom)`).
