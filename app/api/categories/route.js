import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getCategories } from '@/lib/dataService';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import { getServerAuthSession } from '@/lib/auth';

export async function GET() {
  try {
    const categories = await getCategories();
    const res = NextResponse.json(categories);
    res.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res;
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

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    await dbConnect();
    const cat = await Category.create({
      name: name.trim(),
      slug: slug || name.trim().toLowerCase().replace(/\s+/g, '-'),
      icon: icon || 'Briefcase',
    });

    try {
      revalidatePath('/');
      revalidatePath('/jobs');
    } catch {}

    return NextResponse.json({ success: true, category: cat });
  } catch (error) {
    console.error('Category POST error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
