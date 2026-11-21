import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'disconnected';

  try {
    await dbConnect();
    if (mongoose.connection.readyState === 1) {
      dbStatus = 'connected';
    }
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  const latencyMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: 'ok',
      service: 'Verdant Job Portal',
      database: dbStatus,
      latency: `${latencyMs}ms`,
      timestamp: Date.now(),
      uptime: process.uptime(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}
