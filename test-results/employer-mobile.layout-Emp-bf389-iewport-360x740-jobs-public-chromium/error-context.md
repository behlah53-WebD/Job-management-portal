# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: employer-mobile.layout.spec.js >> Employer dashboard mobile layout guardrails >> viewport 360x740 >> jobs-public
- Location: tests\employer-mobile.layout.spec.js:53:9

# Error details

```
Error: page.waitForSelector: state: expected one of (attached|detached|visible|hidden)
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - banner:
      - navigation "Main" [ref=e4]:
        - generic [ref=e5]:
          - link "Verdant Home" [ref=e7] [cursor=pointer]:
            - /url: /
            - generic [ref=e8]: Verdant
          - button "Open navigation" [ref=e16] [cursor=pointer]
  - generic [ref=e20]:
    - generic [ref=e22]:
      - textbox "Search job title, skills, company..." [ref=e27]
      - textbox "City or 'Remote'..." [ref=e33]
      - button "Search Jobs" [ref=e34] [cursor=pointer]
    - generic [ref=e36]:
      - generic [ref=e37]: 0 roles
      - generic [ref=e38]:
        - button "Sort jobs" [ref=e39] [cursor=pointer]:
          - generic [ref=e43]: Recent
        - button "Filter jobs" [ref=e44] [cursor=pointer]:
          - generic [ref=e46]: Filters
        - generic [ref=e47]:
          - button "List view" [ref=e48] [cursor=pointer]
          - button "Grid view" [ref=e50] [cursor=pointer]
  - contentinfo [ref=e111]:
    - generic [ref=e112]:
      - generic [ref=e113]:
        - generic [ref=e114]:
          - link "Verdant Home" [ref=e116] [cursor=pointer]:
            - /url: /
            - generic [ref=e117]: Verdant
          - paragraph [ref=e124]: Grow your career in a serene space. Verdant bridges high-trust companies with candidates who value thoughtful craft and intentional growth.
          - generic [ref=e125]:
            - link "Twitter" [ref=e126] [cursor=pointer]:
              - /url: https://twitter.com
            - link "LinkedIn" [ref=e129] [cursor=pointer]:
              - /url: https://linkedin.com
            - link "GitHub" [ref=e134] [cursor=pointer]:
              - /url: https://github.com
            - link "Instagram" [ref=e138] [cursor=pointer]:
              - /url: https://instagram.com
        - generic [ref=e142]:
          - button "For Job Seekers" [ref=e144] [cursor=pointer]
          - button "For Employers" [ref=e149] [cursor=pointer]
          - button "Platform" [ref=e154] [cursor=pointer]
          - generic [ref=e158]:
            - heading "Stay in the Loop" [level=4] [ref=e159]
            - paragraph [ref=e160]: Receive weekly curated roles and career growth essays.
            - generic [ref=e161]:
              - textbox "your.email@work.com" [ref=e162]
              - button "Subscribe" [ref=e163] [cursor=pointer]
      - generic [ref=e166]:
        - paragraph [ref=e167]: © 2026 Verdant. All rights reserved. Made with care for flourishing careers.
        - generic [ref=e168]:
          - link "Privacy" [ref=e169] [cursor=pointer]:
            - /url: /privacy
          - generic [ref=e170]: •
          - link "Terms" [ref=e171] [cursor=pointer]:
            - /url: /terms
          - generic [ref=e172]: •
          - link "Cookies" [ref=e173] [cursor=pointer]:
            - /url: /cookies
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const EMPLOYER = {
  4   |   email: 'aarav@floralabs.io',
  5   |   password: 'Employer@123',
  6   | };
  7   | 
  8   | const VIEWPORTS = [
  9   |   { width: 360, height: 740, label: '360x740' },
  10  |   { width: 390, height: 844, label: '390x844' },
  11  |   { width: 412, height: 915, label: '412x915' },
  12  | ];
  13  | 
  14  | const ROUTES = [
  15  |   { slug: 'overview', path: '/dashboard/employer' },
  16  |   { slug: 'my-jobs', path: '/dashboard/employer/my-jobs' },
  17  |   { slug: 'post-job', path: '/dashboard/employer/post-job' },
  18  |   { slug: 'pipeline', path: '/dashboard/employer/applicants' },
  19  |   { slug: 'company', path: '/dashboard/employer/company' },
  20  |   { slug: 'settings', path: '/dashboard/employer/settings' },
  21  |   { slug: 'jobs-public', path: '/jobs', public: true },
  22  | ];
  23  | 
  24  | async function loginAsEmployer(context) {
  25  |   const base = process.env.BASE_URL || 'http://localhost:3000';
  26  |   // Obtain the session token with node fetch (real headers), then inject it into
  27  |   // the browser context. Playwright's context.request.fetch strips Set-Cookie
  28  |   // headers, so node fetch is used for the auth calls.
  29  |   const csrfRes = await fetch(`${base}/api/auth/csrf`);
  30  |   const { csrfToken } = await csrfRes.json();
  31  |   const csrfCookie = (csrfRes.headers.get('set-cookie') || '').split('\n')[0];
  32  |   const loginRes = await fetch(`${base}/api/auth/callback/credentials`, {
  33  |     method: 'POST',
  34  |     headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: csrfCookie },
  35  |     body: new URLSearchParams({ csrfToken, email: EMPLOYER.email, password: EMPLOYER.password, json: 'true' }).toString(),
  36  |   });
  37  |   const setCookie = loginRes.headers.get('set-cookie') || '';
  38  |   const tokenMatch = setCookie.match(/(?:__Secure-)?next-auth\.session-token=([^;]+)/);
  39  |   if (!tokenMatch) throw new Error('Login did not issue a session token');
  40  |   await context.addCookies([
  41  |     { name: 'next-auth.session-token', value: tokenMatch[1], domain: 'localhost', path: '/', secure: false, httpOnly: true, sameSite: 'Lax' },
  42  |   ]);
  43  | }
  44  | 
  45  | function rectsIntersect(a, b) {
  46  |   return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  47  | }
  48  | 
  49  | test.describe('Employer dashboard mobile layout guardrails', () => {
  50  |   for (const vp of VIEWPORTS) {
  51  |     test.describe(`viewport ${vp.label}`, () => {
  52  |       for (const route of ROUTES) {
  53  |         test(route.slug, async ({ page, context }) => {
  54  |           if (!route.public) await loginAsEmployer(context);
  55  | 
  56  |           await page.setViewportSize({ width: vp.width, height: vp.height });
  57  |           const gotoRes = await page.goto(route.path, { waitUntil: 'domcontentloaded' });
  58  |           console.log(`DEBUG goto ${route.path}: status=${gotoRes?.status()} url=${page.url()}`);
  59  |           // Wait for the shell's <main> to render (auth middleware may redirect
  60  |           // to /login if the session cookie wasn't accepted).
> 61  |           await page.waitForSelector('main', { state: 'present', timeout: 8000 });
      |                      ^ Error: page.waitForSelector: state: expected one of (attached|detached|visible|hidden)
  62  |           await page.waitForTimeout(300);
  63  | 
  64  |           // Screenshot for each route/viewport
  65  |           await page.screenshot({
  66  |             path: `visual/employer_audit/mobile_${vp.label.replace('x', 'x')}_after_${route.slug}.png`,
  67  |             fullPage: true,
  68  |           });
  69  | 
  70  |           const result = await page.evaluate(() => {
  71  |             const innerW = window.innerWidth;
  72  |             const scrollW = document.documentElement.scrollWidth;
  73  |             const main = document.querySelector('main');
  74  |             const mainRect = main ? main.getBoundingClientRect() : null;
  75  | 
  76  |             // (c) narrow text detection: h1/h2/h3/label/button under 40px wide with > 3 chars
  77  |             const narrowText = [];
  78  |             for (const el of document.querySelectorAll('h1, h2, h3, label, button')) {
  79  |               const r = el.getBoundingClientRect();
  80  |               if (r.width <= 0 || r.height <= 0) continue;
  81  |               const computed = window.getComputedStyle(el);
  82  |               if (computed.visibility === 'hidden' || computed.display === 'none') continue;
  83  |               const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
  84  |               if (r.width < 40 && text.length > 3) {
  85  |                 narrowText.push({ tag: el.tagName, text: text.slice(0, 50), width: Math.round(r.width) });
  86  |               }
  87  |             }
  88  | 
  89  |             // Fixed bars (app bar and bottom nav)
  90  |             const bar = document.querySelector('[class*="MobileTopBar_bar"], header[class*="bar"]');
  91  |             const nav = document.querySelector('[class*="barPill"], [class*="MobileTabBar_barPill"]');
  92  |             const barRect = bar ? bar.getBoundingClientRect() : null;
  93  |             const navRect = nav ? nav.getBoundingClientRect() : null;
  94  | 
  95  |             // (d) overlap: headings / primary buttons must not intersect fixed bars
  96  |             const intersect = (x, y) => !(x.right < y.left || x.left > y.right || x.bottom < y.top || x.top > y.bottom);
  97  |             let overlap = [];
  98  |             const targets = Array.from(
  99  |               document.querySelectorAll('h1, h2, h3, button, a[role="button"], [role="button"]')
  100 |             );
  101 |             for (const el of targets) {
  102 |               const r = el.getBoundingClientRect();
  103 |               if (r.width <= 0 || r.height <= 0) continue;
  104 |               if (barRect && intersect(r, barRect)) overlap.push({ tag: el.tagName, text: el.textContent.trim().slice(0, 40), with: 'app-bar' });
  105 |               if (navRect && intersect(r, navRect)) overlap.push({ tag: el.tagName, text: el.textContent.trim().slice(0, 40), with: 'bottom-nav' });
  106 |             }
  107 | 
  108 |             return {
  109 |               scrollWidth: scrollW,
  110 |               innerWidth: innerW,
  111 |               mainLeft: mainRect ? Math.round(mainRect.left) : null,
  112 |               mainWidth: mainRect ? Math.round(mainRect.width) : null,
  113 |               narrowText,
  114 |               overlap,
  115 |               barRect: barRect ? { ...barRect, position: window.getComputedStyle(bar).position } : null,
  116 |               navRect: navRect ? { ...navRect, position: window.getComputedStyle(nav).position } : null,
  117 |             };
  118 |           });
  119 | 
  120 |           // (a) no horizontal scroll
  121 |           expect(result.scrollWidth).toBeLessThanOrEqual(result.innerWidth);
  122 | 
  123 |           // (b) main content starts near the left edge and uses nearly full width
  124 |           expect(result.mainLeft).toBeLessThanOrEqual(24);
  125 |           expect(result.mainWidth).toBeGreaterThanOrEqual(result.innerWidth - 48);
  126 | 
  127 |           // (c) no letter-per-line squeezed text
  128 |           expect(result.narrowText).toEqual([]);
  129 | 
  130 |           // (d) fixed bars do not overlap headings/primary buttons
  131 |           expect(result.overlap).toEqual([]);
  132 | 
  133 |           // App bar is fixed full-width; bottom nav fixed/inset
  134 |           if (result.barRect) {
  135 |             expect(result.barRect.position).toBe('fixed');
  136 |             expect(result.barRect.width).toBeGreaterThanOrEqual(result.innerWidth - 2);
  137 |           }
  138 |           if (result.navRect) {
  139 |             expect(['fixed', 'sticky']).toContain(result.navRect.position);
  140 |           }
  141 |         });
  142 |       }
  143 |     });
  144 |   }
  145 | });
  146 | 
```