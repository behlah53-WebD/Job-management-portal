import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServerAuthSession } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import JobSeekerProfile from '@/models/JobSeekerProfile';

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id).lean();
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

    const body = await req.json();
    const { name, phone, location, avatar, currentPassword, newPassword, ...profileData } = body;

    await dbConnect();

    // Handle password change if requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Please enter your current password' }, { status: 400 });
      }
      const existingUser = await User.findById(session.user.id).select('+password');
      if (!existingUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      const isMatch = await bcrypt.compare(currentPassword, existingUser.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.findByIdAndUpdate(session.user.id, { password: hashedPassword });
    }

    // Update User fields
    await User.findByIdAndUpdate(session.user.id, {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(location !== undefined && { location }),
      ...(avatar && { avatar }),
    });

    // Update or upsert Profile
    const updatedProfile = await JobSeekerProfile.findOneAndUpdate(
      { user: session.user.id },
      { ...profileData },
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
