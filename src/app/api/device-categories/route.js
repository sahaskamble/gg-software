import { getXataClient } from '@/xata';
import { NextResponse } from 'next/server';

const xata = getXataClient();

// GET all categories
export async function GET() {
  try {
    const categories = await xata.db.DeviceCategory.getAll();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST new category
export async function POST(req) {
  try {
    const data = await req.json();
    
    if (!data.name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = await xata.db.DeviceCategory.create({
      CategoryName: data.name
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
