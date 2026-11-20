import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PushSubscription from '@/models/PushSubscription';

export async function POST(req) {
  try {
    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
    }

    await dbConnect();
    await PushSubscription.deleteOne({ endpoint });

    return NextResponse.json({ success: true, message: 'Push subscription removed.' });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
