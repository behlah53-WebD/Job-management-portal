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
  await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });

  const cardDims = await page.evaluate(() => {
    const card = document.querySelector('[class*="filterCard"]');
    const sidebar = document.querySelector('[class*="filterSidebar"]');
    return {
      cardHeight: card ? card.getBoundingClientRect().height : null,
      sidebarHeight: sidebar ? sidebar.getBoundingClientRect().height : null,
      sidebarTop: sidebar ? sidebar.getBoundingClientRect().top : null,
      sidebarBottom: sidebar ? sidebar.getBoundingClientRect().bottom : null,
      windowHeight: window.innerHeight,
      cardOverflow: card ? window.getComputedStyle(card).overflow : null,
      sidebarOverflow: sidebar ? window.getComputedStyle(sidebar).overflow : null,
      maxHeight: card ? window.getComputedStyle(card).maxHeight : null,
    };
  });
  console.log('Filter card dimensions:', cardDims);

  await browser.close();
}

main().catch(console.error);
