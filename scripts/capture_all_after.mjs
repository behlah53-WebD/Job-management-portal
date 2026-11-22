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

const viewports = [
  { prefix: 'desktop_1280_after', width: 1280, height: 900, isMobile: false },
  { prefix: 'desktop_1536_after', width: 1536, height: 900, isMobile: false },
  { prefix: 'tablet_768_after', width: 768, height: 1024, isMobile: true },
  { prefix: 'mobile_430_after', width: 430, height: 932, isMobile: true },
  { prefix: 'mobile_412_after', width: 412, height: 915, isMobile: true },
  { prefix: 'mobile_390_after', width: 390, height: 844, isMobile: true },
  { prefix: 'mobile_360_after', width: 360, height: 800, isMobile: true },
  { prefix: 'mobile_320_after', width: 320, height: 640, isMobile: true },
];

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
  });

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Log in once
  console.log('Logging in as Employer...');
  await page.goto(`${BASE_URL}/login`);
  await page.waitForTimeout(1500);
  await page.fill('#login-email', 'aarav@floralabs.io');
  await page.fill('#login-password', 'Employer@123');
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  await page.waitForTimeout(1000);
  console.log('Logged in successfully!');

  for (const vp of viewports) {
    console.log(`Setting viewport: ${vp.prefix} (${vp.width}x${vp.height})...`);
    await page.setViewportSize({ width: vp.width, height: vp.height });

    for (const r of routes) {
      await page.goto(`${BASE_URL}${r.url}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(700);
      await page.screenshot({
        path: path.join(OUT_DIR, `${vp.prefix}_${r.name}.png`),
        fullPage: vp.isMobile,
      });
      console.log(`Saved ${vp.prefix}_${r.name}.png`);
    }
  }

  await browser.close();
  console.log('ALL AFTER SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

main().catch(console.error);
