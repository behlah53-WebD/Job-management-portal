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
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  const csrfRes = await fetch('http://localhost:3000/api/auth/csrf');
  const csrfCookie = csrfRes.headers.get('set-cookie') || '';
  const { csrfToken } = await csrfRes.json();

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

  const rawCookies = loginRes.headers.get('set-cookie') || '';
  const tokenMatch = rawCookies.match(/next-auth\.session-token=([^;]+)/);
  if (tokenMatch) {
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: tokenMatch[1],
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
      },
    ]);
  }

  const page = await context.newPage();
  await page.goto('http://localhost:3000/dashboard/seeker/profile', { waitUntil: 'networkidle' });
  await page.waitForSelector('[class*="coverStrip"]', { timeout: 10000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'visual/profile_desktop_loaded.png' });
  console.log('Saved visual/profile_desktop_loaded.png');

  const rects = await page.evaluate(() => {
    const cover = document.querySelector('[class*="desktopProfile"] [class*="coverStrip"]');
    const name = document.querySelector('[class*="desktopProfile"] [class*="userName"]');
    const btn = document.querySelector('[class*="desktopProfile"] [class*="editHeadlineBtn"]');
    const avatar = document.querySelector('[class*="desktopProfile"] [class*="avatarWrapper"]');
    return {
      coverBottom: cover ? cover.getBoundingClientRect().bottom : null,
      nameTop: name ? name.getBoundingClientRect().top : null,
      nameOverlap: name && cover ? cover.getBoundingClientRect().bottom - name.getBoundingClientRect().top : null,
      btnTop: btn ? btn.getBoundingClientRect().top : null,
      btnOverlap: btn && cover ? cover.getBoundingClientRect().bottom - btn.getBoundingClientRect().top : null,
      avatarTop: avatar ? avatar.getBoundingClientRect().top : null,
      avatarBottom: avatar ? avatar.getBoundingClientRect().bottom : null,
    };
  });
  console.log('Profile rects:', rects);

  await browser.close();
}

main().catch(console.error);
