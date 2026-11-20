import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const notifications = await Notification.find({ user: session.user.id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    // Deduplicate any identical notification messages sent in the same time frame
    const seen = new Set();
    const uniqueNotifications = [];
    for (const notif of notifications) {
      const key = `${notif.message}_${notif.type}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueNotifications.push(notif);
      }
    }

    return NextResponse.json(uniqueNotifications);
  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
