import { test, expect } from '@playwright/test';

const EMPLOYER = {
  email: 'aarav@floralabs.io',
  password: 'Employer@123',
};

const VIEWPORTS = [
  { width: 360, height: 740, label: '360x740' },
  { width: 390, height: 844, label: '390x844' },
  { width: 412, height: 915, label: '412x915' },
];

const ROUTES = [
  { slug: 'overview', path: '/dashboard/employer' },
  { slug: 'my-jobs', path: '/dashboard/employer/my-jobs' },
  { slug: 'post-job', path: '/dashboard/employer/post-job' },
  { slug: 'pipeline', path: '/dashboard/employer/applicants' },
  { slug: 'company', path: '/dashboard/employer/company' },
  { slug: 'settings', path: '/dashboard/employer/settings' },
  { slug: 'jobs-public', path: '/jobs', public: true },
];

async function loginAsEmployer(context) {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  // Obtain the session token with node fetch (real headers), then inject it into
  // the browser context. Playwright's context.request.fetch strips Set-Cookie
  // headers, so node fetch is used for the auth calls.
  const csrfRes = await fetch(`${base}/api/auth/csrf`);
  const { csrfToken } = await csrfRes.json();
  const csrfCookie = (csrfRes.headers.get('set-cookie') || '').split('\n')[0];
  const loginRes = await fetch(`${base}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: csrfCookie },
    body: new URLSearchParams({ csrfToken, email: EMPLOYER.email, password: EMPLOYER.password, json: 'true' }).toString(),
  });
  const setCookie = loginRes.headers.get('set-cookie') || '';
  const tokenMatch = setCookie.match(/(?:__Secure-)?next-auth\.session-token=([^;]+)/);
  if (!tokenMatch) throw new Error('Login did not issue a session token');
  await context.addCookies([
    { name: 'next-auth.session-token', value: tokenMatch[1], domain: 'localhost', path: '/', secure: false, httpOnly: true, sameSite: 'Lax' },
  ]);
}

function rectsIntersect(a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

test.describe('Employer dashboard mobile layout guardrails', () => {
  for (const vp of VIEWPORTS) {
    test.describe(`viewport ${vp.label}`, () => {
      for (const route of ROUTES) {
        test(route.slug, async ({ page, context }) => {
          if (!route.public) await loginAsEmployer(context);

          await page.setViewportSize({ width: vp.width, height: vp.height });
          await page.goto(route.path, { waitUntil: 'domcontentloaded' });
          // Wait for the shell's <main> to render (auth middleware may redirect
          // to /login if the session cookie wasn't accepted).
          await page.waitForSelector('main', { state: 'present', timeout: 8000 });
          await page.waitForTimeout(300);

          // Screenshot for each route/viewport
          await page.screenshot({
            path: `visual/employer_audit/mobile_${vp.label.replace('x', 'x')}_after_${route.slug}.png`,
            fullPage: true,
          });

          const result = await page.evaluate(() => {
            const innerW = window.innerWidth;
            const scrollW = document.documentElement.scrollWidth;
            const main = document.querySelector('main');
            const mainRect = main ? main.getBoundingClientRect() : null;

            // (c) narrow text detection: h1/h2/h3/label/button under 40px wide with > 3 chars
            const narrowText = [];
            for (const el of document.querySelectorAll('h1, h2, h3, label, button')) {
              const r = el.getBoundingClientRect();
              if (r.width <= 0 || r.height <= 0) continue;
              const computed = window.getComputedStyle(el);
              if (computed.visibility === 'hidden' || computed.display === 'none') continue;
              const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
              if (r.width < 40 && text.length > 3) {
                narrowText.push({ tag: el.tagName, text: text.slice(0, 50), width: Math.round(r.width) });
              }
            }

            // Fixed bars (app bar and bottom nav)
            const bar = document.querySelector('[class*="MobileTopBar_bar"], header[class*="bar"]');
            const nav = document.querySelector('[class*="barPill"], [class*="MobileTabBar_barPill"]');
            const barRect = bar ? bar.getBoundingClientRect() : null;
            const navRect = nav ? nav.getBoundingClientRect() : null;

            // (d) overlap: headings / primary buttons must not intersect fixed bars
            const intersect = (x, y) => !(x.right < y.left || x.left > y.right || x.bottom < y.top || x.top > y.bottom);
            let overlap = [];
            const targets = Array.from(
              document.querySelectorAll('h1, h2, h3, button, a[role="button"], [role="button"]')
            );
            for (const el of targets) {
              const r = el.getBoundingClientRect();
              if (r.width <= 0 || r.height <= 0) continue;
              if (barRect && intersect(r, barRect)) overlap.push({ tag: el.tagName, text: el.textContent.trim().slice(0, 40), with: 'app-bar' });
              if (navRect && intersect(r, navRect)) overlap.push({ tag: el.tagName, text: el.textContent.trim().slice(0, 40), with: 'bottom-nav' });
            }

            return {
              scrollWidth: scrollW,
              innerWidth: innerW,
              mainLeft: mainRect ? Math.round(mainRect.left) : null,
              mainWidth: mainRect ? Math.round(mainRect.width) : null,
              narrowText,
              overlap,
              barRect: barRect ? { ...barRect, position: window.getComputedStyle(bar).position } : null,
              navRect: navRect ? { ...navRect, position: window.getComputedStyle(nav).position } : null,
            };
          });

          // (a) no horizontal scroll
          expect(result.scrollWidth).toBeLessThanOrEqual(result.innerWidth);

          // (b) main content starts near the left edge and uses nearly full width
          expect(result.mainLeft).toBeLessThanOrEqual(24);
          expect(result.mainWidth).toBeGreaterThanOrEqual(result.innerWidth - 48);

          // (c) no letter-per-line squeezed text
          expect(result.narrowText).toEqual([]);

          // (d) fixed bars do not overlap headings/primary buttons
          expect(result.overlap).toEqual([]);

          // App bar is fixed full-width; bottom nav fixed/inset
          if (result.barRect) {
            expect(result.barRect.position).toBe('fixed');
            expect(result.barRect.width).toBeGreaterThanOrEqual(result.innerWidth - 2);
          }
          if (result.navRect) {
            expect(['fixed', 'sticky']).toContain(result.navRect.position);
          }
        });
      }
    });
  }
});
