import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';

export async function POST() {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    await Notification.updateMany({ user: session.user.id, isRead: false }, { isRead: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notifications read-all POST error:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
