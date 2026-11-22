import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = path.resolve('visual/jobs_navbar_fix');

const chromePath = path.join(
  process.env.LOCALAPPDATA || 'C:\\Users\\Murtaza\\AppData\\Local',
  'ms-playwright',
  'chromium-1255',
  'chrome-win64',
  'chrome.exe'
);

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Navigating to login page...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

  console.log('Filling login form...');
  await page.fill('#login-email', 'ananya@gmail.com');
  await page.fill('#login-password', 'Seeker@123');
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  console.log('Waiting for login redirect...');
  await page.waitForURL('**/dashboard/**', { timeout: 10000 }).catch(async (e) => {
    console.log('Wait for URL timed out, current URL:', page.url());
  });
  console.log('Current URL after login attempt:', page.url());

  console.log('Navigating to /jobs on 390px mobile...');
  await page.goto(`${BASE_URL}/jobs`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Take screenshot of mobile view
  await page.screenshot({ path: path.join(OUT_DIR, 'jobs_mobile_seeker_390px.png'), fullPage: false });
  console.log('Saved jobs_mobile_seeker_390px.png');

  // Check the title in MobileTopBar
  const topBarTitle = await page.locator('header h1').first().innerText().catch(() => 'no h1');
  console.log('TopBar title:', topBarTitle);

  // Check bounding box of MobileTopBar
  const topBar = await page.locator('header').first();
  const topBarBox = await topBar.boundingBox();
  console.log('TopBar box:', topBarBox);

  // Check mobile search card inputs
  const inputs = await page.locator('input').all();
  for (const inp of inputs) {
    const ph = await inp.getAttribute('placeholder');
    const vis = await inp.isVisible();
    const box = await inp.boundingBox();
    console.log(`Input placeholder: "${ph}", visible: ${vis}, box:`, box);
  }

  // 360px
  await page.setViewportSize({ width: 360, height: 740 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, 'jobs_mobile_seeker_360px.png'), fullPage: false });
  console.log('Saved jobs_mobile_seeker_360px.png');

  // Desktop 1280px
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT_DIR, 'jobs_desktop_seeker_1280px.png'), fullPage: false });
  console.log('Saved jobs_desktop_seeker_1280px.png');

  await browser.close();
  console.log('Verification finished successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
