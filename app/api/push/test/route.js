import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { sendPush, sendPushDirect } from '@/lib/pwa/push';

export async function POST(req) {
  try {
    const session = await getServerAuthSession();
    const body = await req.json().catch(() => ({}));
    const { subscription } = body;

    const testPayload = {
      title: 'Verdant PWA Notifications 🌿',
      body: 'Web push is configured and working perfectly on your device!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      data: { url: '/dashboard/seeker' },
      tag: 'verdant-test',
    };

    if (subscription && subscription.endpoint) {
      const directSuccess = await sendPushDirect(subscription, testPayload);
      return NextResponse.json({ success: directSuccess, method: 'direct' });
    }

    if (session?.user?.id) {
      const result = await sendPush(session.user.id, testPayload);
      return NextResponse.json({ success: result.success > 0, result, method: 'userId' });
    }

    return NextResponse.json({ error: 'No subscription or authenticated user found' }, { status: 400 });
  } catch (error) {
    console.error('Push test error:', error);
    return NextResponse.json({ error: 'Failed to test push' }, { status: 500 });
  }
}
