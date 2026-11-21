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

  const metrics0 = await page.evaluate(() => {
    const nav = document.querySelector('header') || document.querySelector('nav');
    const searchHeader = document.querySelector('[class*="searchHeader"]');
    const filterSidebar = document.querySelector('[class*="filterSidebar"]');
    const mainLayout = document.querySelector('[class*="mainLayout"]');
    const resultsHeader = document.querySelector('[class*="resultsHeader"]');

    return {
      navHeight: nav ? nav.getBoundingClientRect().height : null,
      searchHeaderHeight: searchHeader ? searchHeader.getBoundingClientRect().height : null,
      searchHeaderTop: searchHeader ? searchHeader.getBoundingClientRect().top : null,
      searchHeaderBottom: searchHeader ? searchHeader.getBoundingClientRect().bottom : null,
      filterSidebarTop: filterSidebar ? filterSidebar.getBoundingClientRect().top : null,
      mainLayoutPaddingTop: mainLayout ? window.getComputedStyle(mainLayout).paddingTop : null,
      resultsHeaderTop: resultsHeader ? resultsHeader.getBoundingClientRect().top : null,
    };
  });
  console.log('Initial metrics at scrollY=0:', metrics0);

  for (const scrollAmount of [100, 250, 400]) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollAmount);
    await page.waitForTimeout(200);
    const m = await page.evaluate(() => {
      const searchHeader = document.querySelector('[class*="searchHeader"]');
      const filterSidebar = document.querySelector('[class*="filterSidebar"]');
      const firstCard = document.querySelector('[class*="jobCard"]');
      return {
        scrollY: window.scrollY,
        searchHeaderBottom: searchHeader.getBoundingClientRect().bottom,
        filterSidebarTop: filterSidebar.getBoundingClientRect().top,
        gapBetweenSearchAndFilter: filterSidebar.getBoundingClientRect().top - searchHeader.getBoundingClientRect().bottom,
        firstCardTop: firstCard ? firstCard.getBoundingClientRect().top : null,
        firstCardGapFromSearch: firstCard ? firstCard.getBoundingClientRect().top - searchHeader.getBoundingClientRect().bottom : null,
      };
    });
    console.log(`Metrics at scrollY=${scrollAmount}:`, m);
  }

  await browser.close();
}

main().catch(console.error);
