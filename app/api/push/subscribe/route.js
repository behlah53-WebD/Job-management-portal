import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PushSubscription from '@/models/PushSubscription';
import { getServerAuthSession } from '@/lib/auth';

export async function POST(req) {
  try {
    const body = await req.json();
    const { subscription, userAgent } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }

    await dbConnect();
    const session = await getServerAuthSession();
    const userId = session?.user?.id || null;

    // Upsert subscription
    await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        user: userId,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        userAgent: userAgent || '',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, message: 'Push subscription registered.' });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ error: 'Failed to subscribe to push' }, { status: 500 });
  }
}
