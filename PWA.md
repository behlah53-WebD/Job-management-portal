# Verdant Progressive Web App (PWA) Documentation

Verdant is equipped with a complete, production-grade Progressive Web App architecture powered by Next.js 15 App Router, **Serwist** (the maintained, high-performance Workbox successor), Web Push, and IndexedDB offline persistence.

---

## 1. Architecture Overview

```
                                  +-----------------------------+
                                  |     User / Browser Client   |
                                  +--------------+--------------+
                                                 |
                       +-------------------------+-------------------------+
                       |                                                   |
                       v                                                   v
          +-------------------------+                         +-------------------------+
          |   PWAProvider (Client)  |                         |    Serwist Service      |
          | - OfflineBanner         |                         |    Worker (sw.js)       |
          | - InstallPrompt         |                         | - Navigation Preload    |
          | - UpdateToast           |                         | - Runtime Caching       |
          | - Push & Badging Sync   |                         | - Offline Fallback      |
          +------------+------------+                         +------------+------------+
                       |                                                   |
                       v                                                   v
          +-------------------------+                         +-------------------------+
          |  IndexedDB (offlineDB)  |                         |  Cache Storage API      |
          | - recentJobs store      |                         | - pages-cache           |
          | - syncQueue store       |                         | - static-resources      |
          | - offlineData store     |                         | - image-cache           |
          +-------------------------+                         | - public-api-cache      |
                                                              +-------------------------+
```

### Key Pillars
- **Service Worker Build Pipeline**: Defined in `app/sw.js` and compiled automatically at build time to `public/sw.js` via `@serwist/next` wrapped in `next.config.js`.
- **Manifest Route Convention**: Implemented at `app/manifest.js` (served as `manifest.webmanifest`) providing rich metadata, form-factor screenshots, shortcuts, and `share_target`.
- **Zero-Stale Dev Experience**: Disabled during normal local development (`NODE_ENV !== 'production'`) unless explicitly tested with `NEXT_PUBLIC_PWA_DEV=true`.
- **Controlled Worker Updates**: Uses `skipWaiting: false` with toast notification (`UpdateToast.jsx`) that prompts the user and reloads cleanly upon `controllerchange`.
- **Security & Data Isolation**: Dashboard routes, authentication sessions, and private applicant APIs are strictly excluded from caching. When logging out, all private client caches and IndexedDB queues are cleared.

---

## 2. Runtime Caching Strategy

| Route / Asset Pattern | Cache Name | Workbox / Serwist Strategy | Cache TTL / Expiration | Max Entries | Network Timeout | Fallback |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **HTML Navigation** (`mode === 'navigate'`, public pages only) | `pages-cache` | `NetworkFirst` | 24 Hours | 32 | 3 seconds | `/offline` |
| **Static Bundles & Fonts** (`/_next/static/*`, `.woff2`) | `static-resources` | `CacheFirst` | 1 Year | 64 | N/A | Precache |
| **Images** (local icons, splash, Unsplash, Cloudinary) | `image-cache` | `StaleWhileRevalidate` | 30 Days | 100 | N/A | N/A |
| **Public Read APIs** (`/api/jobs*`, `/api/categories`) | `public-api-cache` | `StaleWhileRevalidate` | 24 Hours | 60 | N/A | Cached API |
| **Authenticated Routes** (`/dashboard/**`, `/admin/**`) | *Bypassed* | `NetworkOnly` | None (No Cache) | 0 | Direct | `/offline` (Notice) |
| **Private / Auth APIs** (`/api/auth/*`, `/api/applications/*`) | *Bypassed* | `NetworkOnly` | None (No Cache) | 0 | Direct | Error response |

---

## 3. Web Push Notifications

### Configuration
Push notifications use standard RFC 8292 VAPID encryption with `web-push`.
- Public Key: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- Private Key: `VAPID_PRIVATE_KEY`
- Subject: `VAPID_SUBJECT` (e.g. `mailto:support@verdant.com`)

### Generating New VAPID Keys
To generate fresh keys:
```bash
npm run vapid
```
This updates `.env.local` automatically and creates the necessary environment entries.

### Push Endpoints
- **Subscribe**: `POST /api/push/subscribe` (registers browser push endpoint, public key, and auth secret to MongoDB `PushSubscription` model tied to the current user).
- **Unsubscribe**: `POST /api/push/unsubscribe` (removes endpoint record).
- **Test Push**: `POST /api/push/test` (sends a verification push alert to current user or given subscription).

### Automatic Lifecycle Events
1. **Candidate Application**: When a jobseeker submits an application via `/api/applications`, a push notification is automatically dispatched to the employer.
2. **Status Changes**: When an employer moves an application status (e.g., Shortlisted, Interview, Offer), an immediate push alert is dispatched to the candidate's mobile or desktop device.
3. **App Badging**: Received notifications increment the application badge via `navigator.setAppBadge()`, and clicking the notification clears the badge via `navigator.clearAppBadge()`.

---

## 4. Icons & Asset Generation

All icons, splash screens, and form-factor screenshots are derived from the master vector graphic:
`design/verdant-icon.svg`

### Icon Generator Script
```bash
npm run icons
```
This single command uses `sharp` to render:
- **Standard Icons**: 48, 72, 96, 128, 144, 192, 256, 384, 512 (`public/icons/icon-*.png`)
- **Maskable Icons**: 192, 512 (`public/icons/maskable-icon-*.png`) with an 80% safe zone on `#1E9A56` solid canvas.
- **Apple Touch Icon**: 180x180 (`public/icons/apple-touch-icon.png`)
- **Safari Pinned Tab Icon**: (`public/icons/mask-icon.svg`)
- **Windows Tiles**: 144x144, 150x150, 310x310 (`public/icons/ms-tile-*.png`)
- **Shortcut Icons**: 96x96 for Browse Jobs, Saved Jobs, Post a Job, My Applications (`public/icons/shortcuts/*.png`)
- **iOS Splash Screens**: 8 portrait screen resolutions (`public/splash/apple-splash-*.png`)
- **Rich Install Screenshots**: Wide (1280x720) and Narrow (750x1334) (`public/screenshots/screenshot-*.png`)

---

## 5. Local Development & Testing Guide

### Option A: Testing PWA in Production Build (Recommended)
```bash
# 1. Build the Next.js app with Serwist service worker
npm run build

# 2. Start the production server
npm run start
```
Visit `http://localhost:3000` in Google Chrome or Microsoft Edge.
- Open Chrome DevTools (`F12`) -> **Application** tab.
- Check **Manifest**: Verify theme color, icons, screenshots, and shortcuts appear without errors.
- Check **Service Workers**: Confirm `/sw.js` is registered, active, and running.
- In **Network** tab: Toggle **Offline** and refresh: confirm the custom `/offline` page loads gracefully with recently viewed roles.

### Option B: Testing Service Worker in Dev Mode
Edit `.env.local`:
```env
NEXT_PUBLIC_PWA_DEV=true
```
Run `npm run dev`. The service worker will register in development mode for rapid iteration.

---

## 6. Known Browser Quirks & Platform Guidelines

### iOS & iPadOS (Safari / WebKit)
- **Install Flow**: Safari on iOS does not fire the `beforeinstallprompt` event. The app detects iOS Safari and surfaces an intuitive modal instructing the user to tap **Share** -> **Add to Home Screen**.
- **Push Notifications on iOS**: Web Push requires iOS 16.4+ and requires the user to first install the app to their Home Screen before granting notification permissions.
- **Splash Screens**: iOS does not dynamically generate splash screens from the manifest; it requires explicit `<link rel="apple-touch-startup-image">` tags, which are configured in `app/layout.js`.

### Android & Chromium (Chrome, Edge, Brave, Samsung Internet)
- Supports native `beforeinstallprompt` banner.
- Full support for maskable icons and form-factor rich install preview modals.
- Full support for Web Push, Badging API, and background synchronization.

### Windows & macOS (Desktop Standalone)
- Display mode `window-controls-overlay` provides a titlebar area while blending the app controls into the native OS window frame.
- Keyboard shortcuts and standard desktop navigation behave natively.
