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

  // Initial card metrics
  const initial = await page.evaluate(() => {
    const card = document.querySelector('[class*="filterCard"]');
    return {
      clientHeight: card.clientHeight,
      scrollHeight: card.scrollHeight,
      canScroll: card.scrollHeight > card.clientHeight,
      scrollTop: card.scrollTop,
      maxHeight: window.getComputedStyle(card).maxHeight,
      overflowY: window.getComputedStyle(card).overflowY,
      bottom: card.getBoundingClientRect().bottom,
      windowHeight: window.innerHeight,
    };
  });
  console.log('Initial filter card metrics:', initial);

  // Hover over filter card and wheel scroll
  const cardLocator = page.locator('[class*="filterSidebar"] > div').first();
  const box = await cardLocator.boundingBox();
  console.log('Card bounding box:', box);

  // Move mouse over filter card
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  // Scroll down 250px on the card
  await page.mouse.wheel(0, 250);
  await page.waitForTimeout(300);

  const afterScroll = await page.evaluate(() => {
    const card = document.querySelector('[class*="filterCard"]');
    return {
      scrollTop: card.scrollTop,
      scrollHeight: card.scrollHeight,
      clientHeight: card.clientHeight,
    };
  });
  console.log('Filter card after wheel scroll:', afterScroll);

  await page.screenshot({ path: 'visual/filter_card_scrolled.png' });
  console.log('Saved visual/filter_card_scrolled.png');

  await browser.close();
}

main().catch(console.error);
