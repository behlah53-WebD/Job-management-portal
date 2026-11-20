import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/dataService';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import { getServerAuthSession } from '@/lib/auth';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, slug, icon } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    await dbConnect();
    const cat = await Category.create({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      icon: icon || 'Briefcase',
    });
    return NextResponse.json({ success: true, category: cat });
  } catch (error) {
    console.error('Category POST error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
