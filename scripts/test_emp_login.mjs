import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
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

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  console.log('Navigating to /login...');
  await page.goto(`${BASE_URL}/login`);
  await page.waitForTimeout(1500); // Wait for React hydration

  // Click the Employer demo button directly to log in seamlessly
  const demoButtons = await page.$$('button');
  let clickedDemo = false;
  for (const b of demoButtons) {
    const text = await b.innerText();
    if (text.includes('Employer') && text.includes('Aarav')) {
      await b.click();
      clickedDemo = true;
      break;
    }
  }

  if (clickedDemo) {
    console.log('Clicked Employer Demo card, now clicking submit...');
    await page.waitForTimeout(500);
    await page.click('button[type="submit"]');
  } else {
    console.log('Filling inputs manually...');
    await page.fill('#login-email', 'aarav@floralabs.io');
    await page.fill('#login-password', 'Employer@123');
    await page.click('button[type="submit"]');
  }

  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
  console.log('Landed at:', page.url());

  await page.goto(`${BASE_URL}/dashboard/employer`);
  await page.waitForTimeout(1000);
  console.log('Employer dashboard url:', page.url());
  await page.screenshot({ path: 'visual/employer_audit/mobile_390_overview_check.png' });
  console.log('Screenshot saved!');

  await browser.close();
}

main().catch(console.error);
