import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = path.resolve('visual/admin_settings_verification');

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

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
  });

  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  console.log('Logging in as Admin...');
  await page.goto(`${BASE_URL}/login`);
  await page.waitForTimeout(1000);
  await page.fill('#login-email', 'admin@verdant.com');
  await page.fill('#login-password', 'Admin@123');
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  await page.waitForTimeout(1000);

  // Test at 360px and 390px (mobile)
  for (const w of [360, 390]) {
    await page.setViewportSize({ width: w, height: 800 });
    await page.goto(`${BASE_URL}/dashboard/admin/settings`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(700);

    const shotPath = path.join(OUT_DIR, `admin_settings_mobile_${w}px.png`);
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot to ${shotPath}`);

    // Verify toggle text width and wrapping
    const statusTextEl = await page.locator('[class*="toggleStatusText"]').first();
    const box = await statusTextEl.boundingBox();
    console.log(`[${w}px] Status text width: ${box?.width}px, height: ${box?.height}px (Height should be <= 24px, not wrapping vertically)`);
  }

  // Test at 1280px (desktop)
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${BASE_URL}/dashboard/admin/settings`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);
  const deskShotPath = path.join(OUT_DIR, 'admin_settings_desktop_1280px.png');
  await page.screenshot({ path: deskShotPath });
  console.log(`Saved desktop screenshot to ${deskShotPath}`);

  await browser.close();
  console.log('Admin Settings Verification completed successfully!');
}

main().catch(console.error);
