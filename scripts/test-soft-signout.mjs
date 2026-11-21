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

  await page.goto('http://localhost:3000/login');
  await page.fill('#login-email', 'ananya@gmail.com');
  await page.fill('#login-password', 'Seeker@123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard/**', { timeout: 10000 });
  console.log('Logged in at:', page.url());

  // Listen to navigation events
  let reloaded = false;
  page.on('load', () => {
    reloaded = true;
    console.log('BROWSER LOAD EVENT FIRED (Page reloaded)');
  });

  // Now let's test signing out via next-auth with redirect: false and router.push
  await page.evaluate(async () => {
    const nextAuth = window.__NEXTAUTH;
    console.log('__NEXTAUTH available?', !!nextAuth);
  });

  await browser.close();
}

main().catch(console.error);
