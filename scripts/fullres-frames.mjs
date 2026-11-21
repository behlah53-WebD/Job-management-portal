import path from 'path';
import fs from 'fs';
import http from 'http';
import { chromium } from 'playwright';

async function main() {
  const videoFilePath = path.resolve('C:/Users/Murtaza/.gemini/antigravity/brain/482d1c4e-2a33-4fdb-b50e-01b0330ed699/.user_uploaded/media_1795288826895_9aa664b0.mp4');
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'video/mp4' });
    fs.createReadStream(videoFilePath).pipe(res);
  });
  await new Promise((r) => server.listen(9877, r));

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
  const page = await browser.newPage();
  await page.setContent('<video id="v" src="http://localhost:9877"></video>');
  const dims = await page.evaluate(async () => {
    const v = document.getElementById('v');
    await new Promise((r) => (v.onloadedmetadata = r));
    return { w: v.videoWidth, h: v.videoHeight, duration: v.duration };
  });
  console.log('Video dimensions:', dims);

  await page.setViewportSize({ width: dims.w, height: dims.h });
  await page.setContent(`
    <html>
      <body style="margin:0;overflow:hidden;background:#000;">
        <video id="v" src="http://localhost:9877" style="width:${dims.w}px;height:${dims.h}px;display:block;"></video>
      </body>
    </html>
  `);

  for (const t of [0, 2, 4, 6]) {
    await page.evaluate(async (time) => {
      const v = document.getElementById('v');
      v.currentTime = time;
      await new Promise((r) => (v.onseeked = r));
    }, t);
    await page.waitForTimeout(100);
    const p = `visual/frames/fullres_${t}s.png`;
    await page.screenshot({ path: p });
    console.log(`Saved ${p}`);
  }

  await browser.close();
  server.close();
}

main().catch(console.error);
