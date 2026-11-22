import { chromium } from 'playwright';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:3000';
const EMPLOYER = { email: 'aarav@floralabs.io', password: 'Employer@123' };

const VIEWPORTS = [
  { width: 360, height: 740, label: '360x740' },
  { width: 390, height: 844, label: '390x844' },
  { width: 412, height: 915, label: '412x915' },
];

const VIEWPORT_LABELS = VIEWPORTS.map((v) => v.label);

const ROUTES = [
  { slug: 'overview', path: '/dashboard/employer', public: false },
  { slug: 'my-jobs', path: '/dashboard/employer/my-jobs', public: false },
  { slug: 'post-job', path: '/dashboard/employer/post-job', public: false },
  { slug: 'pipeline', path: '/dashboard/employer/applicants', public: false },
  { slug: 'company', path: '/dashboard/employer/company', public: false },
  { slug: 'settings', path: '/dashboard/employer/settings', public: false },
  { slug: 'jobs-public', path: '/jobs', public: true },
];

const OUT = 'C:/Users/Murtaza/AppData/Local/Temp/kilo/guardrail';
fs.mkdirSync(OUT, { recursive: true });

async function loginAsEmployer(context) {
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const { csrfToken } = await csrfRes.json();
  const csrfCookie = (csrfRes.headers.get('set-cookie') || '').split('\n')[0];
  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: csrfCookie },
    body: new URLSearchParams({ csrfToken, email: EMPLOYER.email, password: EMPLOYER.password, json: 'true' }).toString(),
  });
  const setCookie = loginRes.headers.get('set-cookie') || '';
  const m = setCookie.match(/(?:__Secure-)?next-auth\.session-token=([^;]+)/);
  if (!m) throw new Error('Login did not issue a session token');
  await context.addCookies([{ name: 'next-auth.session-token', value: m[1], domain: 'localhost', path: '/', secure: false, httpOnly: true, sameSite: 'Lax' }]);
}

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  let failures = 0;
  let total = 0;

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    try {
      for (const route of ROUTES) {
        total++;
        const page = await context.newPage();
        let error = null;
        try {
          if (!route.public) await loginAsEmployer(context);
          await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
          await page.waitForTimeout(800);

          // Screenshot for each route/viewport
          await page.screenshot({ path: `${OUT}/${vp.label}_${route.slug}.png`, fullPage: true });

          const result = await page.evaluate(() => {
            const innerW = window.innerWidth;
            const scrollW = document.documentElement.scrollWidth;
            const main = document.querySelector('main');
            const mainRect = main ? main.getBoundingClientRect() : null;

            const narrowText = [];
            for (const el of document.querySelectorAll('h1, h2, h3, label, button')) {
              const r = el.getBoundingClientRect();
              if (r.width <= 0 || r.height <= 0) continue;
              const cs = window.getComputedStyle(el);
              if (cs.visibility === 'hidden' || cs.display === 'none') continue;
              const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
              if (r.width < 40 && text.length > 3) narrowText.push({ tag: el.tagName, text: text.slice(0, 50), width: Math.round(r.width) });
            }

            const bar = document.querySelector('[class*="MobileTopBar_bar"]');
            const nav = document.querySelector('[class*="MobileTabBar_barWrapper"]');
            const pageBody = document.querySelector('[class*="pageBody"]');
            const barCS = bar ? window.getComputedStyle(bar) : null;
            const navCS = nav ? window.getComputedStyle(nav) : null;
            const pbCS = pageBody ? window.getComputedStyle(pageBody) : null;

            return {
              url: location.href,
              scrollWidth: scrollW,
              innerWidth: innerW,
              mainLeft: mainRect ? Math.round(mainRect.left) : null,
              mainWidth: mainRect ? Math.round(mainRect.width) : null,
              narrowText,
              barPosition: barCS ? barCS.position : null,
              barWidth: barCS ? barCS.width : null,
              navPosition: navCS ? navCS.position : null,
              pbPaddingTop: pbCS ? pbCS.paddingTop : null,
              pbPaddingBottom: pbCS ? pbCS.paddingBottom : null,
              bodyOverflowX: window.getComputedStyle(document.body).overflowX,
              htmlOverflowX: window.getComputedStyle(document.documentElement).overflowX,
            };
          });

          // (a) no horizontal scroll
          if (result.scrollWidth > result.innerWidth) {
            error = `horizontal scroll: scrollW=${result.scrollWidth} > innerW=${result.innerWidth}`;
          }
          // (b) main full width (skip /jobs: on mobile it hides desktop <main> and uses .mobileLayout)
          else if (route.path !== '/jobs' && (result.mainLeft == null || result.mainLeft > 24)) {
            error = `main left=${result.mainLeft} > 24`;
          }
          else if (route.path !== '/jobs' && (result.mainWidth == null || result.mainWidth < result.innerWidth - 48)) {
            error = `main width=${result.mainWidth} < ${result.innerWidth - 48}`;
          }
          // (c) no squeezed text (skip /jobs: separate mobile layout)
          else if (route.path !== '/jobs' && result.narrowText.length > 0) {
            error = `narrow text: ${JSON.stringify(result.narrowText.slice(0, 5))}`;
          }
          // (d) fixed bars out of flow + content padded so top/bottom content clears them
          // (/jobs is a public page with its own Navbar, not the employer mobile app bar)
          else if (route.path !== '/jobs' && result.barPosition !== 'fixed') {
            error = `app bar not fixed: ${result.barPosition}`;
          }
          else if (route.path !== '/jobs' && result.barWidth && parseFloat(result.barWidth) < result.innerWidth - 2) {
            error = `app bar not full width: ${result.barWidth}`;
          }
          else if (result.navPosition && !['fixed', 'sticky'].includes(result.navPosition)) {
            error = `bottom nav not fixed/sticky: ${result.navPosition}`;
          }
          else if (result.pbPaddingTop && parseFloat(result.pbPaddingTop) < 55) {
            error = `pageBody padding-top too small: ${result.pbPaddingTop}`;
          }
          else if (result.pbPaddingBottom && parseFloat(result.pbPaddingBottom) < 60) {
            error = `pageBody padding-bottom too small: ${result.pbPaddingBottom}`;
          }
          // body/html must not overflow horizontally
          else if (result.bodyOverflowX !== 'clip' && result.bodyOverflowX !== 'hidden') {
            error = `body overflow-x: ${result.bodyOverflowX}`;
          }
          else if (result.htmlOverflowX !== 'clip' && result.htmlOverflowX !== 'hidden') {
            error = `html overflow-x: ${result.htmlOverflowX}`;
          }

          if (error) {
            failures++;
            await page.screenshot({ path: `${OUT}/${vp.label}_${route.slug}-FAIL.png`, fullPage: true });
            console.log(`FAIL w=${vp.width} ${route.path} (${result.url}): ${error}`);
          } else {
            console.log(`PASS w=${vp.width} ${route.path} (${result.url}) main ${result.mainLeft}x${result.mainWidth} scrollW=${result.scrollWidth}`);
          }
        } catch (e) {
          failures++;
          console.log(`ERROR w=${vp.width} ${route.path}: ${e.message}`);
          try { await page.screenshot({ path: `${OUT}/${vp.label}_${route.slug}-ERROR.png`, fullPage: true }); } catch {}
        } finally {
          await page.close();
        }
      }
    } finally {
      await context.close();
    }
  }

  await browser.close();
  console.log(`\n${total - failures}/${total} checks passed.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
