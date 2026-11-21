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

  // 1. Employee / Seeker
  console.log('Testing Employee (Job Seeker)...');
  const seekerContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const seekerPage = await seekerContext.newPage();
  await seekerPage.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await seekerPage.fill('input[type="email"]', 'ananya@gmail.com');
  await seekerPage.fill('input[type="password"]', 'Seeker@123');
  await seekerPage.click('button[type="submit"]');
  await seekerPage.waitForURL('**/dashboard/**', { timeout: 15000 });
  await seekerPage.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });

  const seekerLinks = await seekerPage.$$eval('[class*="desktopNav"] a', (el) =>
    el.map((a) => a.innerText.trim())
  );
  console.log('Seeker desktop navbar links:', seekerLinks);
  await seekerPage.screenshot({ path: 'visual/navbar_seeker_logged_in.png' });

  // 2. Employer
  console.log('Testing Employer...');
  const employerContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const employerPage = await employerContext.newPage();
  await employerPage.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await employerPage.fill('input[type="email"]', 'aarav@floralabs.io');
  await employerPage.fill('input[type="password"]', 'Employer@123');
  await employerPage.click('button[type="submit"]');
  await employerPage.waitForURL('**/dashboard/**', { timeout: 15000 });
  await employerPage.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });

  const employerLinks = await employerPage.$$eval('[class*="desktopNav"] a', (el) =>
    el.map((a) => a.innerText.trim())
  );
  console.log('Employer desktop navbar links:', employerLinks);
  await employerPage.screenshot({ path: 'visual/navbar_employer_logged_in.png' });

  // 3. Guest
  console.log('Testing Guest...');
  const guestContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const guestPage = await guestContext.newPage();
  await guestPage.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
  const guestLinks = await guestPage.$$eval('[class*="desktopNav"] a', (el) =>
    el.map((a) => a.innerText.trim())
  );
  console.log('Guest desktop navbar links:', guestLinks);
  await guestPage.screenshot({ path: 'visual/navbar_guest_logged_out.png' });

  await browser.close();
}

main().catch(console.error);
