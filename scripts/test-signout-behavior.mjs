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
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Logging in...');
  await page.goto('http://localhost:3000/login');
  await page.fill('#login-email', 'ananya@gmail.com');
  await page.fill('#login-password', 'Seeker@123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard/**', { timeout: 10000 });
  console.log('Current URL after login:', page.url());
  await page.waitForTimeout(1000);

  let pageReloadCount = 0;
  page.on('domcontentloaded', () => {
    pageReloadCount++;
    console.log(`DOM Content Loaded event fired (#${pageReloadCount})`);
  });

  const logoutBtn = page.locator('button:has-text("Sign out")').first();
  console.log('Clicking Sign out...');
  await logoutBtn.click();

  // Monitor over 4 seconds
  for (let i = 1; i <= 4; i++) {
    await page.waitForTimeout(1000);
    console.log(`URL at ${i}s: ${page.url()}, Button text: ${await logoutBtn.textContent().catch(() => 'detached')}`);
    await page.screenshot({ path: `visual/soft_signout_${i}s.png` });
  }

  console.log(`Total full reloads after clicking Sign out: ${pageReloadCount}`);
  await browser.close();
}

main().catch(console.error);
