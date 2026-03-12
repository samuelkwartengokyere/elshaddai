import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for counselors
interface StoredCounsellor {
  id: string;
  name: string;
  title: string;
  specialization: string[];
  bio: string;
  imageUrl: string;
  email: string;
  phone?: string;
  availability: Availability[];
  isOnline: boolean;
  isInPerson: boolean;
  yearsOfExperience: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Availability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

// NO MOCK DATA - Empty initial state for admin-created counsellors only
const inMemoryCounsellors: StoredCounsellor[] = [];

// GET - Fetch all active counselors
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    let counsellors = inMemoryCounsellors;
    
    if (!includeInactive) {
      counsellors = counsellors.filter(c => c.isActive);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        counsellors,
        total: counsellors.length,
      },
    });
  } catch (error) {
    console.error('Error fetching counselors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch counselors' },
      { status: 500 }
    );
  }
}

// POST - Create a new counselor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'title', 'bio', 'email', 'specialization'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Generate ID
    const id = `counsellor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create new counselor
    const newCounsellor: StoredCounsellor = {
      id,
      name: body.name,
      title: body.title,
      specialization: body.specialization || [],
      bio: body.bio,
      imageUrl: body.imageUrl || '',
      email: body.email,
      phone: body.phone || '',
      availability: body.availability || [],
      isOnline: body.isOnline ?? true,
      isInPerson: body.isInPerson ?? true,
      yearsOfExperience: body.yearsOfExperience || 0,
      rating: 0,
      reviewCount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    inMemoryCounsellors.push(newCounsellor);
    
    return NextResponse.json({
      success: true,
      data: newCounsellor,
      message: 'Counsellor created successfully',
    });
  } catch (error) {
    console.error('Error creating counselor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create counselor' },
      { status: 500 }
    );
  }
}

// PUT - Update a counselor
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Counsellor ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Find the counselor
    const index = inMemoryCounsellors.findIndex(c => c.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Counsellor not found' },
        { status: 404 }
      );
    }
    
    // Update counselor
    const updatedCounsellor: StoredCounsellor = {
      ...inMemoryCounsellors[index],
      name: body.name ?? inMemoryCounsellors[index].name,
      title: body.title ?? inMemoryCounsellors[index].title,
      specialization: body.specialization ?? inMemoryCounsellors[index].specialization,
      bio: body.bio ?? inMemoryCounsellors[index].bio,
      imageUrl: body.imageUrl ?? inMemoryCounsellors[index].imageUrl,
      email: body.email ?? inMemoryCounsellors[index].email,
      phone: body.phone ?? inMemoryCounsellors[index].phone,
      availability: body.availability ?? inMemoryCounsellors[index].availability,
      isOnline: body.isOnline ?? inMemoryCounsellors[index].isOnline,
      isInPerson: body.isInPerson ?? inMemoryCounsellors[index].isInPerson,
      yearsOfExperience: body.yearsOfExperience ?? inMemoryCounsellors[index].yearsOfExperience,
      isActive: body.isActive ?? inMemoryCounsellors[index].isActive,
      updatedAt: new Date(),
    };
    
    inMemoryCounsellors[index] = updatedCounsellor;
    
    return NextResponse.json({
      success: true,
      data: updatedCounsellor,
      message: 'Counsellor updated successfully',
    });
  } catch (error) {
    console.error('Error updating counselor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update counselor' },
      { status: 500 }
    );
  }
}

// DELETE - Delete (deactivate) a counselor
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Counsellor ID is required' },
        { status: 400 }
      );
    }
    
    // Find the counselor
    const index = inMemoryCounsellors.findIndex(c => c.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Counsellor not found' },
        { status: 404 }
      );
    }
    
    // Soft delete - set isActive to false
    inMemoryCounsellors[index].isActive = false;
    inMemoryCounsellors[index].updatedAt = new Date();
    
    return NextResponse.json({
      success: true,
      message: 'Counsellor deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting counselor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete counselor' },
      { status: 500 }
    );
  }
}

