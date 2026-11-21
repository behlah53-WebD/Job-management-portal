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

  console.log('Logging in...');
  await page.goto('http://localhost:3000/login');
  await page.fill('#login-email', 'ananya@gmail.com');
  await page.fill('#login-password', 'Seeker@123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard/**', { timeout: 10000 });
  console.log('Logged in at:', page.url());

  // Test what next-auth signOut({ redirect: false }) does in browser console
  const res = await page.evaluate(async () => {
    // call next-auth signOut
    // Let's see what next-auth exports on window or by importing
    // Or let's trigger fetch('/api/auth/signout')
    const csrfRes = await fetch('/api/auth/csrf');
    const { csrfToken } = await csrfRes.json();
    const signOutRes = await fetch('/api/auth/signout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ csrfToken, callbackUrl: '/' }),
    });
    return { status: signOutRes.status, url: signOutRes.url };
  });

  console.log('Signout API response:', res);

  await browser.close();
}

main().catch(console.error);
