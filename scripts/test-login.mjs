import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright';

async function testRole(email, password, roleName) {
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
  
  if (email) {
    await page.goto('http://localhost:3000/login');
    await page.fill('#login-email', email);
    await page.fill('#login-password', password);
    await page.click('button[type="submit"]');
    // Wait for redirection
    await page.waitForTimeout(3000);
  }

  await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
  const links = await page.$$eval('[class*="desktopNav"] a', (els) =>
    els.map((a) => a.innerText.trim())
  );
  console.log(`${roleName} Navbar links on /jobs:`, links);
  await page.screenshot({ path: `visual/navbar_${roleName.toLowerCase().replace(/\s+/g, '_')}.png` });

  await browser.close();
}

async function main() {
  await testRole('ananya@gmail.com', 'Seeker@123', 'Employee Seeker');
  await testRole('aarav@floralabs.io', 'Employer@123', 'Employer');
  await testRole(null, null, 'Guest Visitor');
}

main().catch(console.error);
