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

    const { getSupabaseAdmin } = await import('@/lib/supabase');
    const supabaseAdmin = await getSupabaseAdmin();
    
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }
    
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

    const { getSupabaseAdmin } = await import('@/lib/supabase');
    const supabaseAdmin = await getSupabaseAdmin();
    
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }
    
    // Insert new counsellor - only columns guaranteed to exist in current schema
    const insertData: any = {
      name: body.name,
      title: body.title,
      bio: body.bio || '',
      image: body.imageUrl || '',
      email: body.email,
      phone: body.phone || '',
      specialization: body.specialization || [],
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Log what the frontend sent (for debugging)
    console.log('Creating counsellor with yearsOfExperience:', body.yearsOfExperience);

    // Try insert with extended columns first
    let data = null;
    let error = null;

    try {
      const result = await supabaseAdmin
        .from('counsellors')
        .insert({
          ...insertData,
          years_of_experience: body.yearsOfExperience || 0,
          is_online: body.isOnline !== false,
          is_in_person: body.isInPerson !== false,
          availability: body.availability || []
        })
        .select()
        .single();
      data = result.data;
      error = result.error;
    } catch (e: any) {
      console.log('Extended insert threw exception:', e?.message || e);
      error = e;
    }

    // If columns don't exist, fallback to basic insert (only existing columns)
    const isMissingColumnError = error && (
      (error.message && (
        error.message.includes("Could not find") ||
        error.message.includes("column") ||
        error.message.includes("does not exist") ||
        error.message.includes("schema cache")
      )) ||
      (error.code && error.code === "PGRST204")
    );

    if (isMissingColumnError) {
      console.warn('Extended columns missing in DB, falling back to basic columns. Run SUPABASE_MIGRATION_COUNSELLORS.sql to add them.');
      const basicResult = await supabaseAdmin
        .from('counsellors')
        .insert(insertData)
        .select()
        .single();
      data = basicResult.data;
      error = basicResult.error;
    }

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

    const { getSupabaseAdmin } = await import('@/lib/supabase');
    const supabaseAdmin = await getSupabaseAdmin();
    
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }
    
    // Prepare basic update data (columns guaranteed to exist)
    const basicUpdateData: any = {
      name: body.name,
      title: body.title,
      bio: body.bio,
      image: body.imageUrl,
      email: body.email,
      phone: body.phone,
      specialization: body.specialization,
      updated_at: new Date().toISOString()
    };
    
    // Handle isActive field - map to is_available in database
    if (body.isActive !== undefined) {
      basicUpdateData.is_available = body.isActive === true;
    }

    // Try update with extended columns first
    let { data, error } = await supabaseAdmin
      .from('counsellors')
      .update({
        ...basicUpdateData,
        availability: body.availability,
        is_online: body.isOnline !== false,
        is_in_person: body.isInPerson !== false,
        years_of_experience: body.yearsOfExperience || 0
      })
      .eq('id', id)
      .select()
      .single();

    // If columns don't exist, fallback to basic update
    if (error && error.message && error.message.includes("Could not find")) {
      const basicResult = await supabaseAdmin
        .from('counsellors')
        .update(basicUpdateData)
        .eq('id', id)
        .select()
        .single();
      data = basicResult.data;
      error = basicResult.error;
    }

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

    const { getSupabaseAdmin } = await import('@/lib/supabase');
    const supabaseAdmin = await getSupabaseAdmin();
    
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }
    
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