import { NextRequest, NextResponse } from 'next/server';
import { isDbConfigured } from '@/lib/db';
import type { Counsellor } from '@/types/counselling';

// Helper function to enrich counsellor data from database format to API format
async function enrichCounsellor(dbCounsellor: any): Promise<Counsellor> {
  return {
    id: dbCounsellor.id,
    name: dbCounsellor.name,
    title: dbCounsellor.title || '',
    specialization: dbCounsellor.specialization || [],
    bio: dbCounsellor.bio || '',
    imageUrl: dbCounsellor.image || '',
    email: dbCounsellor.email || '',
    phone: dbCounsellor.phone || '',
    availability: dbCounsellor.availability || [],
    isOnline: dbCounsellor.is_online !== false,
    isInPerson: dbCounsellor.is_in_person !== false,
    yearsOfExperience: dbCounsellor.years_of_experience || 0,
    rating: dbCounsellor.rating || 0,
    reviewCount: dbCounsellor.review_count || 0,
    isActive: dbCounsellor.is_available === true,
    createdAt: dbCounsellor.created_at,
    updatedAt: dbCounsellor.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured'
      }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const offset = (page - 1) * limit;

    const { supabaseAdmin } = await import('@/lib/supabase');
    
    let query = supabaseAdmin
      .from('counsellors')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('name', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_available', true);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching counsellors:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch counsellors' },
        { status: 500 }
      );
    }

    const enriched = await Promise.all((data || []).map(enrichCounsellor));

    return NextResponse.json({
      success: true,
      data: {
        counsellors: enriched,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Counsellors GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.title || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Name, title, and email are required' },
        { status: 400 }
      );
    }

    const { supabaseAdmin } = await import('@/lib/supabase');
    
    // Insert new counsellor
    const { data, error } = await supabaseAdmin
      .from('counsellors')
      .insert({
        name: body.name,
        title: body.title,
        bio: body.bio || '',
        image: body.imageUrl || '',
        email: body.email,
        phone: body.phone || '',
        specialization: body.specialization || [],
        availability: body.availability || [],
        is_online: body.isOnline !== false,
        is_in_person: body.isInPerson !== false,
        years_of_experience: body.yearsOfExperience || 0,
        is_available: true, // New counsellors are active by default
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating counsellor:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to create counsellor' },
        { status: 500 }
      );
    }

    const enriched = await enrichCounsellor(data);

    return NextResponse.json({
      success: true,
      data: enriched,
      message: 'Counsellor created successfully'
    });
  } catch (error: any) {
    console.error('Counsellors POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create counsellor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID required' },
        { status: 400 }
      );
    }

    const { supabaseAdmin } = await import('@/lib/supabase');
    
    // Prepare update data - handle isActive field correctly
    const updateData: any = {
      name: body.name,
      title: body.title,
      bio: body.bio,
      image: body.imageUrl,
      email: body.email,
      phone: body.phone,
      specialization: body.specialization,
      availability: body.availability,
      is_online: body.isOnline !== false,
      is_in_person: body.isInPerson !== false,
      years_of_experience: body.yearsOfExperience || 0,
      updated_at: new Date().toISOString()
    };
    
    // Handle isActive field - map to is_available in database
    // Check for isActive in body (from frontend) or fallback to existing value
    if (body.isActive !== undefined) {
      updateData.is_available = body.isActive === true;
    }
    
    // Update counsellor
    const { data, error } = await supabaseAdmin
      .from('counsellors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating counsellor:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to update counsellor' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Counsellor not found' },
        { status: 404 }
      );
    }

    const enriched = await enrichCounsellor(data);

    return NextResponse.json({
      success: true,
      data: enriched,
      message: 'Counsellor updated successfully'
    });
  } catch (error: any) {
    console.error('Counsellors PUT error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update counsellor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID required' },
        { status: 400 }
      );
    }

    const { supabaseAdmin } = await import('@/lib/supabase');
    
    // Delete counsellor
    const { error } = await supabaseAdmin
      .from('counsellors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting counsellor:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to delete counsellor' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Counsellor deleted successfully'
    });
  } catch (error: any) {
    console.error('Counsellors DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete counsellor' },
      { status: 500 }
    );
  }
}