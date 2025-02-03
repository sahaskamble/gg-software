import { getXataClient } from '@/xata';
import { NextResponse } from 'next/server';

const xata = getXataClient();

// GET single category
export async function GET(req, { params }) {
  try {
    const category = await xata.db.DeviceCategory.read(params.id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(req, { params }) {
  try {
    const category = await xata.db.DeviceCategory.read(params.id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    await xata.db.DeviceCategory.delete(params.id);
    
    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
