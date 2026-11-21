import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright';

async function main() {
  const chromePath = path.join(
    process.env.LOCALAPPDATA || 'C:\\Users\\Murtaza\\AppData\\Local',
    'ms-playwright',
    'chromium-1255',
    'chrome-win64',
    'chrome.exe'
  );

  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });

  // Login as seeker
  const csrfRes = await fetch('http://localhost:3000/api/auth/csrf');
  const { csrfToken } = await csrfRes.json();
  const csrfCookie = csrfRes.headers.get('set-cookie') || '';

  const body = new URLSearchParams({
    csrfToken,
    email: 'ananya@gmail.com',
    password: 'Seeker@123',
    json: 'true',
  });

  const loginRes = await fetch('http://localhost:3000/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: csrfCookie },
    body: body.toString(),
  });

  const tokenMatch = (loginRes.headers.get('set-cookie') || '').match(/next-auth\.session-token=([^;]+)/);
  if (tokenMatch) {
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: tokenMatch[1],
        domain: 'localhost',
        path: '/',
      },
    ]);
  }

  const page = await context.newPage();

  // 1. Applications page
  console.log('Navigating to applications page...');
  await page.goto('http://localhost:3000/dashboard/seeker/applications', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const firstTabRect = await page.evaluate(() => {
    const tab = document.querySelector('button[role="tab"]');
    if (!tab) return null;
    const r = tab.getBoundingClientRect();
    const computed = window.getComputedStyle(tab);
    const parent = tab.parentElement;
    const parentComputed = window.getComputedStyle(parent);
    return {
      text: tab.innerText.replace(/\n/g, ' '),
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height,
      parentMargin: parentComputed.margin,
      parentPadding: parentComputed.padding,
      parentMask: parentComputed.maskImage || parentComputed.webkitMaskImage,
    };
  });
  console.log('First tab rect & styles:', JSON.stringify(firstTabRect, null, 2));

  await page.screenshot({ path: 'visual/test_applications_390.png' });
  console.log('Saved visual/test_applications_390.png');

  // 2. Overview page
  console.log('Navigating to seeker overview page...');
  await page.goto('http://localhost:3000/dashboard/seeker', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const statsInfo = await page.evaluate(() => {
    const grid = document.querySelector('[class*="mobileStatsGrid"]');
    if (!grid) return null;
    const cards = Array.from(grid.children).map((c) => {
      const r = c.getBoundingClientRect();
      return {
        text: c.innerText.replace(/\n/g, ' | '),
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
      };
    });
    return {
      gridDisplay: window.getComputedStyle(grid).display,
      gridTemplateColumns: window.getComputedStyle(grid).gridTemplateColumns,
      cards,
    };
  });
  console.log('Stats grid info:', JSON.stringify(statsInfo, null, 2));

  await page.screenshot({ path: 'visual/test_seeker_overview_390.png' });
  console.log('Saved visual/test_seeker_overview_390.png');

  // 3. Jobs page
  console.log('Navigating to jobs page...');
  await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const controlsInitial = await page.evaluate(() => {
    const el = document.querySelector('[class*="stickyControlsBar"]');
    return el
      ? {
          position: window.getComputedStyle(el).position,
          top: el.getBoundingClientRect().top,
          visible: el.getBoundingClientRect().height > 0,
        }
      : null;
  });
  console.log('Controls initial position:', JSON.stringify(controlsInitial, null, 2));

  await page.evaluate(() => window.scrollBy(0, 450));
  await page.waitForTimeout(500);

  const controlsScrolled = await page.evaluate(() => {
    const el = document.querySelector('[class*="stickyControlsBar"]');
    return el
      ? {
          position: window.getComputedStyle(el).position,
          top: el.getBoundingClientRect().top,
          scrollY: window.scrollY,
        }
      : null;
  });
  console.log('Controls scrolled position:', JSON.stringify(controlsScrolled, null, 2));

  await page.screenshot({ path: 'visual/test_jobs_scrolled_390.png' });
  console.log('Saved visual/test_jobs_scrolled_390.png');

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
