import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('--- Generated VAPID Keys ---');
console.log('Public Key: ', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
console.log('----------------------------');

const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envExamplePath = path.resolve(process.cwd(), '.env.example');

let envLocal = fs.existsSync(envLocalPath) ? fs.readFileSync(envLocalPath, 'utf8') : '';

if (!envLocal.includes('NEXT_PUBLIC_VAPID_PUBLIC_KEY')) {
  envLocal += `\n# Web Push Notifications (PWA)\nNEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}\nVAPID_PRIVATE_KEY=${vapidKeys.privateKey}\nVAPID_SUBJECT=mailto:support@verdant.com\n`;
  fs.writeFileSync(envLocalPath, envLocal);
  console.log('Appended VAPID keys to .env.local');
} else {
  console.log('VAPID keys already exist in .env.local');
}

let envExample = fs.existsSync(envExamplePath) ? fs.readFileSync(envExamplePath, 'utf8') : '';
if (!envExample.includes('NEXT_PUBLIC_VAPID_PUBLIC_KEY')) {
  envExample += `\n# Web Push Notifications (PWA)\nNEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_vapid_key_here\nVAPID_PRIVATE_KEY=your_private_vapid_key_here\nVAPID_SUBJECT=mailto:support@verdant.com\n\n# PWA Development Mode\nNEXT_PUBLIC_PWA_DEV=false\n`;
  fs.writeFileSync(envExamplePath, envExample);
  console.log('Appended VAPID placeholders to .env.example');
}
