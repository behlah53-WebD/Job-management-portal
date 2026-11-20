import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Company from '@/models/Company';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const mine = searchParams.get('mine');

    await dbConnect();

    if (mine === 'true') {
      const session = await getServerAuthSession();
      if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const company = await Company.findOne({ owner: session.user.id }).lean();
      if (!company) return NextResponse.json(null);
      return NextResponse.json(company);
    }

    const companies = await Company.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(companies);
  } catch (error) {
    console.error('Companies GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user || (session.user.role !== 'employer' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    await dbConnect();

    // If admin is modifying a specific company by companyId
    if (session.user.role === 'admin' && body.companyId) {
      const { companyId, ...fields } = body;
      const updated = await Company.findByIdAndUpdate(companyId, fields, { new: true });
      if (!updated) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, company: updated });
    }

    // Otherwise, employer updating their own company
    const updated = await Company.findOneAndUpdate(
      { owner: session.user.id },
      { ...body },
      { new: true, upsert: true }
    );
    return NextResponse.json({ success: true, company: updated });
  } catch (error) {
    console.error('Company PUT error:', error);
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
  }
}
