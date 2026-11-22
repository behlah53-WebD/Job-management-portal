import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    localStorage.removeItem('verdant_pwa_dismissed_at');
    const e = new Event('beforeinstallprompt', { bubbles: true, cancelable: true });
    e.prompt = () => {};
    e.userChoice = Promise.resolve({ outcome: 'accepted' });
    window.dispatchEvent(e);
  });

  await page.waitForTimeout(500);
  const prompt = page.locator('[aria-label="Install Verdant App"]');
  const isVis = await prompt.isVisible();
  console.log('Desktop visible:', isVis);
  if (isVis) {
    const box = await prompt.boundingBox();
    console.log('Desktop prompt position & dimensions:', box);
    await page.screenshot({ path: 'visual/install_prompt_verification/desktop_prompt_verified.png' });
  }

  await browser.close();
}

test().catch(console.error);
