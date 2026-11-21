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

  await page.goto('http://localhost:3000/login');
  await page.fill('#login-email', 'ananya@gmail.com');
  await page.fill('#login-password', 'Seeker@123');
  await page.screenshot({ path: 'visual/login_before_submit.png' });

  // Click submit
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'visual/login_after_submit_1s.png' });

  await page.waitForTimeout(3000);
  console.log('URL at 4s:', page.url());
  await page.screenshot({ path: 'visual/login_after_submit_4s.png' });

  await browser.close();
}

main().catch(console.error);
