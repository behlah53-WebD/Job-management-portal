import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServerAuthSession } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import JobSeekerProfile from '@/models/JobSeekerProfile';
import { profileUpdateSchema } from '@/lib/validators';
import { sanitizeNoSql } from '@/lib/ratelimit';

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id).select('-password').lean();
    let profile = await JobSeekerProfile.findOne({ user: session.user.id }).lean();

    if (!profile) {
      profile = await JobSeekerProfile.create({
        user: session.user.id,
        headline: '',
        skills: [],
      });
    }

    return NextResponse.json({ user, profile });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawBody = await req.json();
    const body = sanitizeNoSql(rawBody);
    const { name, phone, location, avatar, currentPassword, newPassword, ...profileData } = body;

    await dbConnect();

    // Handle password change if requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Please enter your current password' }, { status: 400 });
      }
      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
      }
      const existingUser = await User.findById(session.user.id).select('+password');
      if (!existingUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      const isMatch = await bcrypt.compare(currentPassword, existingUser.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await User.findByIdAndUpdate(session.user.id, { password: hashedPassword });
    }

    // Update User fields
    const sanitizedUserFields = {};
    if (name && typeof name === 'string') sanitizedUserFields.name = name.trim().slice(0, 60);
    if (phone !== undefined && typeof phone === 'string') sanitizedUserFields.phone = phone.trim().slice(0, 30);
    if (location !== undefined && typeof location === 'string') sanitizedUserFields.location = location.trim().slice(0, 100);
    if (avatar && typeof avatar === 'string') sanitizedUserFields.avatar = avatar.trim();

    if (Object.keys(sanitizedUserFields).length > 0) {
      await User.findByIdAndUpdate(session.user.id, sanitizedUserFields);
    }

    // Validate and update profile fields
    const profileValidation = profileUpdateSchema.safeParse(profileData);
    const validProfileData = profileValidation.success ? profileValidation.data : {};

    const updatedProfile = await JobSeekerProfile.findOneAndUpdate(
      { user: session.user.id },
      { ...validProfileData },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated with care 🌿',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
