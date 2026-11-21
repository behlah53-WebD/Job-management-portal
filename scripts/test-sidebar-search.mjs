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

  // 1. Initial desktop screenshot
  await page.screenshot({ path: 'visual/desktop_no_top_search_initial.png' });
  console.log('Saved visual/desktop_no_top_search_initial.png');

  // Check sidebar elements
  const sidebarInfo = await page.evaluate(() => {
    const sidebar = document.querySelector('[class*="filterSidebar"]');
    const searchForm = document.querySelector('[class*="sidebarSearchForm"]');
    const topBar = document.querySelector('[class*="searchHeader"]');
    return {
      hasOldSearchHeader: !!topBar,
      hasSidebarSearch: !!searchForm,
      sidebarTop: sidebar ? sidebar.getBoundingClientRect().top : null,
    };
  });
  console.log('Sidebar info:', sidebarInfo);

  // 2. Scroll desktop by 300px
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'visual/desktop_no_top_search_scrolled.png' });
  console.log('Saved visual/desktop_no_top_search_scrolled.png');

  // 3. Test typing in sidebar search
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  const keywordInput = page.locator('input[placeholder*="Title, skill"]').first();
  await keywordInput.fill('Designer');
  await page.waitForTimeout(600); // wait for debounce
  await page.screenshot({ path: 'visual/desktop_sidebar_search_typed.png' });
  console.log('Saved visual/desktop_sidebar_search_typed.png');

  await browser.close();
}

main().catch(console.error);
