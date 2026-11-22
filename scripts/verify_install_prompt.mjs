import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = path.resolve('visual/install_prompt_verification');

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

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(() => {
    localStorage.removeItem('verdant_pwa_dismissed_at');
  });

  const page = await context.newPage();

  console.log('Navigating to homepage on desktop...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Trigger beforeinstallprompt event
  console.log('Dispatching beforeinstallprompt on desktop...');
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt');
    event.prompt = () => {};
    event.userChoice = Promise.resolve({ outcome: 'accepted' });
    window.dispatchEvent(event);
  });
  await page.waitForTimeout(700);

  const prompt = await page.locator('[aria-label="Install Verdant App"]');
  const isDeskVisible = await prompt.isVisible();
  console.log('Install prompt visible on desktop:', isDeskVisible);
  if (isDeskVisible) {
    const box = await prompt.boundingBox();
    console.log('Desktop prompt position:', box);
    await page.screenshot({ path: path.join(OUT_DIR, 'desktop_install_prompt_bottom_right.png') });
    console.log('Saved desktop_install_prompt_bottom_right.png');
  }

  // Mobile test
  console.log('Navigating to homepage on mobile (390px)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt');
    event.prompt = () => {};
    event.userChoice = Promise.resolve({ outcome: 'accepted' });
    window.dispatchEvent(event);
  });
  await page.waitForTimeout(700);

  const isMobileVisible = await prompt.isVisible();
  console.log('Install prompt visible on mobile:', isMobileVisible);
  if (isMobileVisible) {
    const box = await prompt.boundingBox();
    console.log('Mobile prompt position:', box);
    await page.screenshot({ path: path.join(OUT_DIR, 'mobile_install_prompt_bottom_right.png') });
    console.log('Saved mobile_install_prompt_bottom_right.png');
  }

  await browser.close();
  console.log('All screenshots captured!');
}

main().catch(console.error);
