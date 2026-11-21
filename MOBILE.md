# Verdant Job Portal — Mobile Architecture & Implementation Specification (MOBILE.md)

## 1. Executive Summary & Design Tenets

Verdant is a serene, high-craft job platform inspired by organic growth and dignified modern work cultures. The mobile transformation elevates Verdant from a scaled-down desktop site into a **cozy, premium, thumb-friendly native web app** while adhering to the **Absolute Desktop Protection Protocol**: **viewport >= 1024px remains 100% pixel-for-pixel identical**.

### Guiding Mobile Principles:
1. **Thumb-Driven Ergonomics**: Primary navigation and actions reside within the bottom natural thumb zone (bottom tab bar, bottom sheets, sticky bottom action bars).
2. **Organic Tactile Feedback**: Micro-haptics (`navigator.vibrate(10)`), spring transitions, soft-green shimmer skeletons, and celebratory leaf particles for milestone moments.
3. **Calm Information Hierarchy**: Density adjusted for hand-held viewports; data tables transition smoothly into structured record cards; kanban boards swipe horizontally with synchronized column tabs.
4. **Resilient Native Feel**: Zero unhandled horizontal scroll, 100dvh viewport stability, iOS safe-area handling (`env(safe-area-inset-*)`), and fast 60fps animations constrained to `transform` and `opacity`.

---

## 2. Desktop Protection Protocol Verification

To guarantee that desktop users experience zero visual shifts:
1. **Branch Baseline**: Created git branch `mobile-responsive` and committed clean desktop baseline across all 27 routes and 4 viewports (`1024px`, `1280px`, `1440px`, `1920px`).
2. **Visual Regression Suite**: Playwright + pixelmatch script (`scripts/visual-baseline.mjs`) takes full-page captures with deterministic frozen timestamps, disabled CSS animations/transitions, and reduced motion.
3. **Strict CSS Scoping**: 100% of all mobile styles are strictly encapsulated inside:
   - `@media (max-width: 1023px)` (tablets and phones)
   - `@media (max-width: 767px)` (smartphones)
   - `@media (max-width: 479px)` (compact devices)
4. **Desktop Preservation Rule**: Zero base CSS tokens, global typography, or desktop layout selectors were modified. Mobile-only elements are rendered in DOM with `display: none` by default and displayed only under `<= 1023px` media queries.

---

## 3. Comprehensive Mobile UX Audit (360px, 390px, 430px)

Before coding, an audit was conducted across mobile viewports:

| Route / Surface | Issues Identified at 360px – 430px | Remediation Strategy |
| :--- | :--- | :--- |
| **Public Navbar** | Links squish horizontally; avatar/login buttons collide; lacks hamburger or drawer. | Replace desktop bar with 60px compact sticky header + leaf logo, search icon, and hamburger opening an 86% slide-in drawer with blurred mint backdrop, 52px touch rows, and bottom-pinned auth actions. |
| **Landing Page** | Hero 2-column grid breaks; category grid (4 cols) causes awkward squish; stats 4-row layout too wide; floating collage cards clip. | Stack hero text-first; search bar with stacked inputs and full-width green CTA; 2-column compact category cards; snap chip rows for tags; vertical how-it-works timeline; 2x2 stats grid; footer accordions. |
| **Job Search (`/jobs`)** | Left sidebar filter occupies 300px, pushing jobs off-screen; dual search bar wraps awkwardly; table/grid toggle cramped. | Sticky compact search bar with Filter button badge + Sort button; 90dvh swipeable Filter Bottom Sheet with collapsible sections & sticky "Show jobs" CTA; single-column mobile job cards with 48px company logo, swipe-to-save, and full-width actions. |
| **Job Details (`/jobs/[id]`)** | 2-column layout (content + sticky sidebar); desktop Apply modal doesn't fit small phone height; apply action buried. | Single-column card stack; sticky bottom action bar (Save button + full-width green Apply button); segmented Overview/Company tabs; Apply flow transitions into full-screen bottom sheet with progress stepper. |
| **Auth Pages (`/login`, `/register`)** | Left showcase panel hidden; form inputs lack 16px font-size causing iOS auto-zoom; keyboard obstructs submit CTA. | Single-column stacked card layout; 52px touch-friendly inputs (font-size 16px); role selector switches to 48px full-width sliding pill segmented control; bottom padding for virtual keyboard. |
| **Seeker Dashboard** | Left 260px sidebar stays open or awkwardly floats; stat cards overflow; horizontal application stepper breaks into tiny illegible text; resume upload zone tiny. | Hide desktop sidebar; top 56px app bar (title + bell + avatar); floating bottom tab bar (Home, Jobs, Saved, Applications, Profile); 2x2 stat cards; vertical application stepper; large tap-to-upload resume zone. |
| **Employer Dashboard** | 260px sidebar occupies screen; kanban columns overflow horizontally with no swipe-snap; post-job wizard has side-preview breaking layout; my-jobs table causes horizontal page scrolling. | Hide sidebar; bottom tab bar with center prominent green "+" Post button; horizontal scroll-snap kanban board (88% col width) with synchronized sticky column-tab bar; 4-step single-column wizard with step-4 preview; table to stacked cards. |
| **Admin Dashboard** | Dark sidebar dominates screen; data tables (Users, Jobs, Reports) overflow horizontally; action buttons too small. | Mobile top bar + bottom tab bar; data tables converted into clean stacked record cards with status pills, 3-dot overflow actions, and bottom sheet filter dialogs; full-width charts. |
| **Modals & Drawers** | Fixed center modals clip viewport height; close buttons have < 32px touch targets. | Transform all modals into native Bottom Sheets (`border-radius: 28px 28px 0 0`, drag handle, swipe-down dismiss, `max-height: 92dvh`, focus trap, escape key support). |

---

## 4. Mobile Foundation System

### 4.1 Breakpoint System
- **Compact Phone**: `<= 379px` (iPhone SE, Galaxy A-series)
- **Standard Phone**: `<= 767px` (iPhone 13/14/15/16, Pixel, Galaxy)
- **Tablet**: `768px – 1023px` (iPad Mini, iPad Air, Surface)
- **Desktop (Untouched)**: `>= 1024px`

### 4.2 Fluid Typography Scale
Headings scale smoothly without jarring viewport jumps using CSS `clamp()`:
- **H1**: `clamp(30px, 8.5vw, 38px)` — Fraunces font with -0.025em letter-spacing
- **H2**: `clamp(24px, 6.5vw, 30px)` — Fraunces font
- **H3**: `clamp(18px, 5vw, 22px)` — Fraunces / Plus Jakarta Sans
- **Body Regular**: `16px` (Line-height: 1.55) — Plus Jakarta Sans
- **Meta / Small**: `14px` (Secondary text, labels)
- **Micro Caption**: `12px` (Timestamps, badges only)
- **Inputs**: strictly `16px` to eliminate iOS Safari viewport zoom on focus.

### 4.3 Ergonomics & Spacing Tokens
- Container side-padding: `16px` on phone (`20px` on tablet).
- Vertical section rhythm: `48px` (scaled down from desktop `96px`).
- Card padding: `16px – 20px`; card border-radius: `18px – 20px`.
- Minimum tappable hit targets: `44px × 44px` on all buttons, tabs, chips, and close handles.
- Spacing between adjacent interactive elements: minimum `8px`.
- `-webkit-tap-highlight-color: transparent`; `touch-action: manipulation`.

### 4.4 Viewport & Safe-Area Insets
- `min-height: 100vh; min-height: 100dvh;`
- Safe-area support for iPhone notch, dynamic island, and home indicator:
  - Top bar: `padding-top: max(12px, env(safe-area-inset-top))`
  - Floating bottom bar: `padding-bottom: max(10px, env(safe-area-inset-bottom))`
  - Sticky bottom sheets: `padding-bottom: max(20px, env(safe-area-inset-bottom))`

---

## 5. Navigation Architecture

### 5.1 Public Navigation
- **Header**: 60px sticky top bar (`rgba(255, 255, 255, 0.95)`, blur fallback).
- **Search & Menu triggers**: 44px rounded icon buttons.
- **Slide-in Drawer**:
  - Slides in from right (`width: 86%`, `max-width: 360px`).
  - Green-tinted backdrop with `rgba(11, 61, 36, 0.45)` and blur.
  - Large 52px menu rows with leading Lucide icons.
  - Pinned bottom CTA container with "Log in" and "Sign up" buttons.
  - Full keyboard focus trap, Esc key closing, swipe-to-close gesture.

### 5.2 Dashboard Navigation (Seeker, Employer, Admin)
- **Desktop Sidebar**: Hidden on `< 1024px` with `display: none !important`.
- **Top App Bar**: 56px height, Fraunces page title, notification bell with unread counter, and profile avatar menu.
- **Floating Bottom Tab Bar**:
  - Floating white pill with `border-radius: 24px`, soft green glow shadow, side margin `12px`.
  - Auto-hides on scroll down; reveals immediately on scroll up.
  - Hidden when soft keyboard is open or inside full-screen modals.
  - Active tab: Mint-100 pill background, Green-600 icon and bold label, subtle spring bounce animation.
  - Role Tabs:
    - **Seeker**: Home, Jobs, Saved, Applications, Profile.
    - **Employer**: Home, My Jobs, **Post** (prominent centered green circular `+` button), Applicants, Profile.
    - **Admin**: Home, Users, Jobs, Reports, More.
  - **"More" Sheet**: Bottom sheet providing access to Settings, Company details, Help, and Sign Out.

---

## 6. Shared Components Overhaul

1. **Modal to Bottom Sheet**:
   - `border-radius: 28px 28px 0 0`; centered drag pill indicator (`width: 40px, height: 4px`).
   - Max height `92dvh` with internal smooth scrolling.
   - Swipe down gesture or tapping backdrop closes sheet.
2. **DataTable to Record Cards**:
   - Primary item highlighted as card title with verified badge.
   - 2-column key-value grid for metadata (Salary, Applicants, Status, Date).
   - Card footer houses primary action and 3-dot overflow menu for secondary actions.
3. **Scrollable Filter Chips**:
   - Horizontal snap row (`scroll-snap-type: x mandatory`).
   - Hidden scrollbar with edge fade mask (`mask-image: linear-gradient(...)`).
4. **Touch Active States**:
   - Replaced `:hover` with `@media (hover: hover)` so mobile devices never get stuck hover states.
   - Added active state: `transform: scale(0.98)` with `var(--mint-100)` background.

---

## 7. Unique Mobile Touches

- **Tactile Haptics**: Subtle vibrations (`navigator.vibrate(10)`) triggered on bookmarking, submitting application, and changing kanban applicant status.
- **Micro-Copy**: Encouraging messages tailored for mobile interaction ("Nice! Your application is on its way 🌱").
- **Plant Growth Micro-Animations**: Progress stepper smoothly expands like fresh stems upon completion.
- **Back to Top Pill**: Floats discretely above the bottom tab bar on long lists (/jobs, seekers saved jobs).

---

## 8. CSS Media Query Protocol & Exemption Register

Every new and modified rule is strictly encapsulated:
- Total modified base CSS rules outside media queries: **0**
- Total additions inside `@media (max-width: 1023px)`: **100%**
- Exemptions: **None**. Desktop visual check verified identical at 1024px, 1280px, 1440px, and 1920px.
