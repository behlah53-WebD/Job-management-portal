import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = path.resolve('visual/employer_audit');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const chromePath = path.join(
  process.env.LOCALAPPDATA || 'C:\\Users\\Murtaza\\AppData\\Local',
  'ms-playwright',
  'chromium-1255',
  'chrome-win64',
  'chrome.exe'
);

const routes = [
  { name: 'overview', url: '/dashboard/employer' },
  { name: 'post_job', url: '/dashboard/employer/post-job' },
  { name: 'my_jobs', url: '/dashboard/employer/my-jobs' },
  { name: 'applicants', url: '/dashboard/employer/applicants' },
  { name: 'company', url: '/dashboard/employer/company' },
  { name: 'settings', url: '/dashboard/employer/settings' },
  { name: 'jobs_public', url: '/jobs' },
];

async function login(page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForTimeout(2000); // Ensure Next.js hydration
  await page.fill('#login-email', 'aarav@floralabs.io');
  await page.fill('#login-password', 'Employer@123');
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  await page.waitForTimeout(1000);
}

async function captureRoutes(context, prefix, isMobile = false) {
  const page = await context.newPage();
  await login(page);

  for (const r of routes) {
    try {
      await page.goto(`${BASE_URL}${r.url}`);
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(OUT_DIR, `${prefix}_${r.name}.png`),
        fullPage: isMobile,
      });
      console.log(`Captured ${prefix}_${r.name}.png`);
    } catch (e) {
      console.error(`Failed ${prefix}_${r.name}:`, e.message);
    }
  }
  await page.close();
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
  });

  // 1. Desktop 1280px
  console.log('Capturing Desktop 1280px...');
  const desktopCtx1280 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await captureRoutes(desktopCtx1280, 'desktop_1280_before', false);
  await desktopCtx1280.close();

  // 2. Desktop 1536px
  console.log('Capturing Desktop 1536px...');
  const desktopCtx1536 = await browser.newContext({ viewport: { width: 1536, height: 900 } });
  await captureRoutes(desktopCtx1536, 'desktop_1536_before', false);
  await desktopCtx1536.close();

  // 3. Mobile 390px
  console.log('Capturing Mobile 390px...');
  const mobileCtx390 = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await captureRoutes(mobileCtx390, 'mobile_390_before', true);
  await mobileCtx390.close();

  // 4. Tablet 768px
  console.log('Capturing Tablet 768px...');
  const tabletCtx768 = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    isMobile: true,
    hasTouch: true,
  });
  await captureRoutes(tabletCtx768, 'tablet_768_before', true);
  await tabletCtx768.close();

  await browser.close();
  console.log('Done capturing all baseline screenshots!');
}

main().catch(console.error);
