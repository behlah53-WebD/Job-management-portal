import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/ratelimit';

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid work or personal email address'),
});

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limiter = await rateLimit(`newsletter_${ip}`, 5, 60 * 1000);
    if (!limiter.success) {
      return NextResponse.json(
        { error: 'Too many subscription attempts. Please try again in a few moments.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = newsletterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // In a full production setup, this would sync with Mailchimp/Resend/Sendgrid or a DB collection
    return NextResponse.json(
      {
        success: true,
        message: `Welcome to the loop! Curated career dispatches will arrive at ${email} 🌱`,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Newsletter error:', err);
    return NextResponse.json({ error: 'Failed to subscribe. Please try again later.' }, { status: 500 });
  }
}
