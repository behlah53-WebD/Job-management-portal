import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import JobSeekerProfile from '@/models/JobSeekerProfile';
import Company from '@/models/Company';
import { registerSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/ratelimit';

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limiter = await rateLimit(`auth_reg_${ip}`, 10, 60 * 1000);
    if (!limiter.success) {
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${limiter.retryAfter}s.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      const errorMsg = validation.error.errors[0]?.message || 'Invalid registration data';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { name, email, password, role, companyName } = validation.data;

    try {
      await dbConnect();

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${name.replace(/\s+/g, '')}`,
      });

      if (role === 'jobseeker') {
        await JobSeekerProfile.create({
          user: user._id,
          skills: [],
          experience: [],
          education: [],
        });
      } else if (role === 'employer') {
        await Company.create({
          owner: user._id,
          name: companyName || `${name}'s Organization`,
          location: 'Remote',
          industry: 'Technology',
          isVerified: true,
        });
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Account created successfully! Welcome to Verdant 🌿',
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
        { status: 201 }
      );
    } catch (dbErr) {
      console.error('DB Register error:', dbErr.message);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again in a moment.' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Registration handler error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
