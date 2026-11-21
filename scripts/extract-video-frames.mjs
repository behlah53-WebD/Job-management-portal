import http from 'http';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

async function main() {
  const videoFilePath = path.resolve('C:/Users/Murtaza/.gemini/antigravity/brain/482d1c4e-2a33-4fdb-b50e-01b0330ed699/.user_uploaded/media_1795288826895_9aa664b0.mp4');
  const stat = fs.statSync(videoFilePath);
  
  const server = http.createServer((req, res) => {
    if (req.url === '/video.mp4') {
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoFilePath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': stat.size,
          'Content-Type': 'video/mp4',
        });
        fs.createReadStream(videoFilePath).pipe(res);
      }
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
          <body style="margin:0; background:#000; overflow:hidden;">
            <video id="vid" src="/video.mp4" playsinline muted controls style="display:block;"></video>
          </body>
        </html>
      `);
    }
  });

  await new Promise(resolve => server.listen(9876, resolve));

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

  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto('http://localhost:9876');

  const { w, h, duration } = await page.evaluate(async () => {
    const vid = document.getElementById('vid');
    if (vid.readyState < 1) {
      await new Promise(resolve => {
        vid.onloadedmetadata = resolve;
      });
    }
    return { w: vid.videoWidth, h: vid.videoHeight, duration: vid.duration };
  });

  console.log(`Video info: ${w}x${h}, duration: ${duration}s`);
  await page.setViewportSize({ width: w, height: h });

  if (!fs.existsSync('visual/frames_hd')) {
    fs.mkdirSync('visual/frames_hd', { recursive: true });
  }

  for (const t of [0, 1.5, 3.0, 4.5, 6.0]) {
    await page.evaluate(async (time) => {
      const vid = document.getElementById('vid');
      vid.currentTime = time;
      await new Promise(resolve => {
        vid.onseeked = resolve;
      });
    }, t);
    await page.waitForTimeout(100);
    const framePath = `visual/frames_hd/frame_${t.toFixed(1)}s.png`;
    const vid = await page.$('#vid');
    if (vid) {
      await vid.screenshot({ path: framePath });
      console.log(`Saved ${framePath}`);
    }
  }

  await browser.close();
  server.close();
}

main().catch(console.error);
