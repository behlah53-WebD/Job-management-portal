import { setVapidDetails, sendNotification } from 'web-push';
import dbConnect from '@/lib/dbConnect';
import PushSubscription from '@/models/PushSubscription';

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@verdant.com';

if (publicVapidKey && privateVapidKey) {
  try {
    setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
  } catch (err) {
    console.warn('VAPID setup warning:', err.message);
  }
}

/**
 * Send push notification to all subscriptions belonging to a user ID.
 * Automatically cleans up expired (404/410) subscriptions.
 */
export async function sendPush(userId, payload) {
  if (!publicVapidKey || !privateVapidKey) {
    console.warn('Cannot send push: VAPID keys not configured.');
    return { success: 0, failed: 0 };
  }

  await dbConnect();
  const subscriptions = await PushSubscription.find({ user: userId });
  if (!subscriptions || subscriptions.length === 0) {
    return { success: 0, failed: 0 };
  }

  const notificationPayload = JSON.stringify({
    title: payload.title || 'Verdant Update',
    body: payload.body || '',
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: payload.badge || '/icons/icon-96x96.png',
    data: payload.data || { url: '/dashboard/seeker' },
    tag: payload.tag || 'verdant-alert',
  });

  let successCount = 0;
  let failedCount = 0;

  for (const sub of subscriptions) {
    const pushConfig = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      },
    };

    try {
      await sendNotification(pushConfig, notificationPayload);
      successCount++;
    } catch (err) {
      failedCount++;
      // Clean up dead subscriptions
      if (err.statusCode === 404 || err.statusCode === 410) {
        await PushSubscription.deleteOne({ _id: sub._id }).catch(() => {});
      } else {
        console.error('Webpush error:', err.message);
      }
    }
  }

  return { success: successCount, failed: failedCount };
}

/**
 * Send push notification directly to a given subscription object.
 */
export async function sendPushDirect(subscription, payload) {
  if (!publicVapidKey || !privateVapidKey) return false;

  const notificationPayload = JSON.stringify({
    title: payload.title || 'Verdant Notification',
    body: payload.body || '',
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: payload.badge || '/icons/icon-96x96.png',
    data: payload.data || { url: '/dashboard/seeker' },
    tag: payload.tag || 'verdant-test',
  });

  try {
    await sendNotification(subscription, notificationPayload);
    return true;
  } catch (err) {
    console.error('sendPushDirect error:', err.message);
    return false;
  }
}
