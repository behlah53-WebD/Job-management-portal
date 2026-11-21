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
  await page.waitForTimeout(3000);

  const sidebarButtons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.innerText.trim(),
      className: b.className,
      id: b.id,
    }));
  });
  console.log('Buttons found:', sidebarButtons);

  await browser.close();
}

main().catch(console.error);
