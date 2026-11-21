import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright';

async function prepareContextForUser(browser, creds) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  if (!creds) return context;

  const csrfRes = await fetch('http://localhost:3000/api/auth/csrf');
  const { csrfToken } = await csrfRes.json();
  const csrfCookie = csrfRes.headers.get('set-cookie') || '';

  const body = new URLSearchParams({
    csrfToken,
    email: creds.email,
    password: creds.password,
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
  return context;
}

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

  // 1. Employee (Job Seeker)
  const seekerContext = await prepareContextForUser(browser, {
    email: 'ananya@gmail.com',
    password: 'Seeker@123',
  });
  const seekerPage = await seekerContext.newPage();
  await seekerPage.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
  const seekerNavLinks = await seekerPage.$$eval('nav[aria-label="Main"] a', (links) =>
    links.map((a) => a.innerText.trim()).filter(Boolean)
  );
  console.log('Seeker (Employee) Navbar links:', seekerNavLinks);
  await seekerPage.screenshot({ path: 'visual/navbar_employee.png' });

  // 2. Employer
  const employerContext = await prepareContextForUser(browser, {
    email: 'aarav@floralabs.io',
    password: 'Employer@123',
  });
  const employerPage = await employerContext.newPage();
  await employerPage.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
  const employerNavLinks = await employerPage.$$eval('nav[aria-label="Main"] a', (links) =>
    links.map((a) => a.innerText.trim()).filter(Boolean)
  );
  console.log('Employer Navbar links:', employerNavLinks);
  await employerPage.screenshot({ path: 'visual/navbar_employer.png' });

  // 3. Guest (Logged out)
  const guestContext = await prepareContextForUser(browser, null);
  const guestPage = await guestContext.newPage();
  await guestPage.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
  const guestNavLinks = await guestPage.$$eval('nav[aria-label="Main"] a', (links) =>
    links.map((a) => a.innerText.trim()).filter(Boolean)
  );
  console.log('Guest (Logged out) Navbar links:', guestNavLinks);
  await guestPage.screenshot({ path: 'visual/navbar_guest.png' });

  await browser.close();
}

main().catch(console.error);
