/**
 * Database Helper Module
 * 
 * Provides a unified interface for database operations.
 * Uses Supabase when configured, falls back to in-memory storage.
 * 
 * To configure Supabase:
 * - Add NEXT_PUBLIC_SUPABASE_URL to .env.local
 * - Add NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local
 * - Add SUPABASE_SERVICE_ROLE_KEY to .env.local (for admin operations)
 */

import { isSupabaseConfigured } from './supabase'
import { getSupabaseAdminAsync } from './supabase'

import type { SupabaseClient } from '@supabase/supabase-js'

// Lazy admin client
let _supabaseAdmin: SupabaseClient | null = null
async function getSupabaseAdmin(): Promise<SupabaseClient> {
  if (!_supabaseAdmin) {
    _supabaseAdmin = await getSupabaseAdminAsync()
  }
  return _supabaseAdmin!
}

// Type definitions
export interface DbAdmin {
  is_active: boolean
  id: string
  email: string
  name: string
  role: string
  password_hash?: string
  profile_image?: string
  created_at: string
  updated_at: string
}

export interface DbSettings {
  id: string
  key: string
  value: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface DbEvent {
  id: string
  title: string
  description?: string
  date: string
  end_date?: string | null
  time?: string
  end_time?: string | null
  location?: string
  category?: string
  image_url?: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface DbTestimony {
  id: string
  name: string
  content: string
  image?: string
  video_url?: string
  is_approved: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface DbTeam {
  id: string
  name: string
  role: string
  bio?: string
  image?: string
  email?: string
  phone?: string
  department?: string
  is_active: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface DbMedia {
  id: string
  title?: string
  description?: string | null
  url: string
  type: string
  category?: string
  tags?: string[]
  is_featured?: boolean
  created_at: string
}

export interface DbCalendarEvent {
  id: string
  title: string
  description?: string
  start: string
  end?: string
  all_day: boolean
  location?: string
  event_type?: string
  color?: string
  created_at: string
  updated_at: string
}

export interface DbLiveStream {
  id: string
  title: string
  description?: string
  stream_url?: string
  is_live: boolean
  scheduled_time?: string
  ended_at?: string
  created_at: string
  updated_at: string
}

export interface DbDonation {
  id: string
  amount: number
  amount_usd?: number
  currency: string
  exchange_rate: number
  frequency: string
  donor_name: string
  donor_email: string
  donor_phone?: string
  donor_country?: string
  payment_method?: string
  payment_channel?: string
  status: string
  paystack_reference?: string
  transaction_reference?: string
  donation_type?: string
  is_anonymous: boolean
  notes?: string
  receipt_sent: boolean
  created_at: string
}

export interface DbCounsellingBooking {
  id: string
  name: string
  email: string
  phone: string
  age?: string
  gender?: string
  preferred_counsellor?: string
  booking_date: string
  time_slot: string
  issue_type?: string
  notes?: string
  status: string
  created_at: string
  updated_at: string
}

export interface DbCounsellor {
  id: string
  name: string
  title?: string
  bio?: string
  image?: string
  email?: string
  phone?: string
  specialization?: string[]
  is_available: boolean
  created_at: string
  updated_at: string
}

// Check if Supabase is available
export function isDbConfigured(): boolean {
  return isSupabaseConfigured()
}

// Generic table operations
async function getAll<T>(table: string, orderBy?: string, orderDirection?: 'asc' | 'desc'): Promise<T[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabaseAdmin = await getSupabaseAdmin()
  
  let query = supabaseAdmin.from(table).select('*')
  
  if (orderBy) {
    query = query.order(orderBy, { ascending: orderDirection !== 'desc' })
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error(`Error fetching from ${table}:`, error)
    throw error
  }
  
  return data || []
}

async function getById<T>(table: string, id: string): Promise<T | null> {
  if (!isSupabaseConfigured()) {
    return null
  }
  
  const supabaseAdmin = await getSupabaseAdmin()
  
  const { data, error } = await supabaseAdmin
    .from(table)
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error(`Error fetching from ${table}:`, error)
    throw error
  }
  
  return data
}

async function insert<T>(table: string, data: Partial<T>): Promise<T> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured')
  }
  
  const supabaseAdmin = await getSupabaseAdmin()
  
  const { data: result, error } = await supabaseAdmin
    .from(table)
    .insert(data)
    .select()
    .single()
  
  if (error) {
    console.error(`Error inserting into ${table}:`, error)
    throw error
  }
  
  return result
}

async function update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured')
  }
  
  const supabaseAdmin = await getSupabaseAdmin()
  
  const { data: result, error } = await supabaseAdmin
    .from(table)
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error(`Error updating ${table}:`, error)
    throw error
  }
  
  return result
}

async function remove(table: string, id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured')
  }
  
  const supabaseAdmin = await getSupabaseAdmin()
  
  const { error } = await supabaseAdmin
    .from(table)
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error(`Error deleting from ${table}:`, error)
    throw error
  }
}

// Admin operations
export const adminsDb = {
  async getAll(): Promise<DbAdmin[]> {
    return getAll<DbAdmin>('admins', 'created_at', 'desc')
  },
  
  async getById(id: string): Promise<DbAdmin | null> {
    return getById<DbAdmin>('admins', id)
  },
  
  async getByEmail(email: string): Promise<DbAdmin | null> {
    if (!isSupabaseConfigured()) {
      const isProd = process.env.NODE_ENV === 'production'
      if (isProd) {
        throw new Error('Supabase database required in production - check environment variables')
      }
      console.warn('[DB WARN] Supabase not configured - login will fail for all admins')
      return null
    }
    
    const supabaseAdmin = await getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }
    
    return data
  },
  
  async create(data: Partial<DbAdmin>): Promise<DbAdmin> {
    return insert<DbAdmin>('admins', {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  },
  
  async update(id: string, data: Partial<DbAdmin>): Promise<DbAdmin> {
    return update<DbAdmin>('admins', id, data)
  },
  
  async delete(id: string): Promise<void> {
    return remove('admins', id)
  }
}

// Settings operations
export const settingsDb = {
  async get(key: string): Promise<DbSettings | null> {
    if (!isSupabaseConfigured()) {
      return null
    }
    
    const supabaseAdminInstance = await getSupabaseAdmin()
    const { data, error } = await supabaseAdminInstance
      .from('settings')
      .select('*')
      .eq('key', key)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }
    
    return data
  },
  
  async set(key: string, value: Record<string, unknown>): Promise<DbSettings> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured')
    }
    
    const supabaseAdmin = await getSupabaseAdmin()
    
    // Try to update first
    const { data: existing } = await supabaseAdmin
      .from('settings')
      .select('id')
      .eq('key', key)
      .single()
    
    if (existing) {
      return update<DbSettings>('settings', existing.id, { value })
    }
    
    return insert<DbSettings>('settings', {
      key,
      value,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  }
}

// Events operations
export const eventsDb = {
  async getAll(): Promise<DbEvent[]> {
    return getAll<DbEvent>('events', 'date', 'asc')
  },
  
  async getById(id: string): Promise<DbEvent | null> {
    return getById<DbEvent>('events', id)
  },
  
  async create(data: Partial<DbEvent>): Promise<DbEvent> {
    return insert<DbEvent>('events', {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  },
  
  async update(id: string, data: Partial<DbEvent>): Promise<DbEvent> {
    return update<DbEvent>('events', id, data)
  },
  
  async delete(id: string): Promise<void> {
    return remove('events', id)
  }
}

// Testimonies operations
export const testimoniesDb = {
  async getAll(): Promise<DbTestimony[]> {
    return getAll<DbTestimony>('testimonies', 'created_at', 'desc')
  },
  
  async getById(id: string): Promise<DbTestimony | null> {
    return getById<DbTestimony>('testimonies', id)
  },
  
  async create(data: Partial<DbTestimony>): Promise<DbTestimony> {
    return insert<DbTestimony>('testimonies', {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  },
  
  async update(id: string, data: Partial<DbTestimony>): Promise<DbTestimony> {
    return update<DbTestimony>('testimonies', id, data)
  },
  
  async delete(id: string): Promise<void> {
    return remove('testimonies', id)
  }
}

// Teams operations
export const teamsDb = {
  async getAll(): Promise<DbTeam[]> {
    return getAll<DbTeam>('teams', 'order_index', 'asc')
  },
  
  async getById(id: string): Promise<DbTeam | null> {
    return getById<DbTeam>('teams', id)
  },
  
  async create(data: Partial<DbTeam>): Promise<DbTeam> {
    return insert<DbTeam>('teams', {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  },
  
  async update(id: string, data: Partial<DbTeam>): Promise<DbTeam> {
    return update<DbTeam>('teams', id, data)
  },
  
  async delete(id: string): Promise<void> {
    return remove('teams', id)
  }
}

// Media operations
export const mediaDb = {
  async getAll(): Promise<DbMedia[]> {
    return getAll<DbMedia>('media', 'created_at', 'desc')
  },
  
  async getById(id: string): Promise<DbMedia | null> {
    return getById<DbMedia>('media', id)
  },
  
  async create(data: Partial<DbMedia>): Promise<DbMedia> {
    return insert<DbMedia>('media', {
      ...data,
      created_at: new Date().toISOString()
    })
  },
  
  async update(id: string, data: Partial<DbMedia>): Promise<DbMedia> {
    return update<DbMedia>('media', id, data)
  },
  
  async delete(id: string): Promise<void> {
    return remove('media', id)
  }
}

// Calendar events operations
export const calendarEventsDb = {
  async getAll(): Promise<DbCalendarEvent[]> {
    return getAll<DbCalendarEvent>('calendar_events', 'start', 'asc')
  },
  
  async getById(id: string): Promise<DbCalendarEvent | null> {
    return getById<DbCalendarEvent>('calendar_events', id)
  },
  
  async create(data: Partial<DbCalendarEvent>): Promise<DbCalendarEvent> {
    return insert<DbCalendarEvent>('calendar_events', {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  },
  
  async update(id: string, data: Partial<DbCalendarEvent>): Promise<DbCalendarEvent> {
    return update<DbCalendarEvent>('calendar_events', id, data)
  },
  
  async delete(id: string): Promise<void> {
    return remove('calendar_events', id)
  }
}

// Live streams operations
export const liveStreamsDb = {
  async getAll(): Promise<DbLiveStream[]> {
    return getAll<DbLiveStream>('live_streams', 'created_at', 'desc')
  },
  
  async getById(id: string): Promise<DbLiveStream | null> {
    return getById<DbLiveStream>('live_streams', id)
  },
  
  async create(data: Partial<DbLiveStream>): Promise<DbLiveStream> {
    return insert<DbLiveStream>('live_streams', {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  },
  
  async update(id: string, data: Partial<DbLiveStream>): Promise<DbLiveStream> {
    return update<DbLiveStream>('live_streams', id, data)
  },
  
  async delete(id: string): Promise<void> {
    return remove('live_streams', id)
  }
}

// Donations operations
export const donationsDb = {
  async getAll(): Promise<DbDonation[]> {
    return getAll<DbDonation>('donations', 'created_at', 'desc')
  },
  
  async getById(id: string): Promise<DbDonation | null> {
    return getById<DbDonation>('donations', id)
  },
  
  async create(data: Partial<DbDonation>): Promise<DbDonation> {
    return insert<DbDonation>('donations', {
      ...data,
      created_at: new Date().toISOString()
    })
  },
  
  async update(id: string, data: Partial<DbDonation>): Promise<DbDonation> {
    return update<DbDonation>('donations', id, data)
  }
}

// Counselling bookings operations
export const counsellingBookingsDb = {
  async getAll(): Promise<DbCounsellingBooking[]> {
    return getAll<DbCounsellingBooking>('counselling_bookings', 'booking_date', 'desc')
  },
  
  async getById(id: string): Promise<DbCounsellingBooking | null> {
    return getById<DbCounsellingBooking>('counselling_bookings', id)
  },
  
  async create(data: Partial<DbCounsellingBooking>): Promise<DbCounsellingBooking> {
    return insert<DbCounsellingBooking>('counselling_bookings', {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  },
  
  async update(id: string, data: Partial<DbCounsellingBooking>): Promise<DbCounsellingBooking> {
    return update<DbCounsellingBooking>('counselling_bookings', id, data)
  },
  
  async delete(id: string): Promise<void> {
    return remove('counselling_bookings', id)
  }
}

// Counsellors operations
export const counsellorsDb = {
  async getAll(): Promise<DbCounsellor[]> {
    return getAll<DbCounsellor>('counsellors', 'name', 'asc')
  },
  
  async getPaginated(page: number = 1, limit: number = 10, includeInactive: boolean = false): Promise<{
    counsellors: DbCounsellor[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    if (!isSupabaseConfigured()) {
      return { counsellors: [], total: 0, page, limit, totalPages: 0 };
    }

    const supabaseAdmin = await getSupabaseAdmin()
    const offset = (page - 1) * limit;
    
    let query = supabaseAdmin
      .from('counsellors')
      .select('*', { count: 'exact', head: false })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (!includeInactive) {
      query = query.eq('is_available', true);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching paginated counsellors:', error);
      throw error;
    }

    return {
      counsellors: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },
  
  async getById(id: string): Promise<DbCounsellor | null> {
    return getById<DbCounsellor>('counsellors', id)
  },
  
  async create(data: Partial<DbCounsellor>): Promise<DbCounsellor> {
    return insert<DbCounsellor>('counsellors', {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  },
  
  async update(id: string, data: Partial<DbCounsellor>): Promise<DbCounsellor> {
    return update<DbCounsellor>('counsellors', id, data)
  },
  
  async delete(id: string): Promise<void> {
    return remove('counsellors', id)
  }
}

// Counselling slots operations (daily global limits)
export interface DbCounsellingSlot {
  id: string
  date: string
  max_slots: number
  booked_slots: number
  created_at: string
  updated_at: string
}

export const counsellingSlotsDb = {
  async getAll(): Promise<DbCounsellingSlot[]> {
    return getAll<DbCounsellingSlot>('counselling_slots', 'date', 'asc')
  },
  
  async getFuture(days: number = 30): Promise<DbCounsellingSlot[]> {
    if (!isSupabaseConfigured()) return []
    
    const supabaseAdmin = await getSupabaseAdmin()
    if (!supabaseAdmin) {
      console.warn('[DB] Supabase admin client not available - service role key may be missing')
      return []
    }
    
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)
    
    const { data, error } = await supabaseAdmin
      .from('counselling_slots')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true })
    
    if (error) throw error
    return data || []
  },
  
  async getByDate(date: string): Promise<DbCounsellingSlot | null> {
    if (!isSupabaseConfigured()) return null
    
    const supabaseAdmin = await getSupabaseAdmin()
    if (!supabaseAdmin) {
      console.warn('[DB] Supabase admin client not available - service role key may be missing')
      return null
    }
    
    // Call Supabase function to ensure slot exists
    const { data, error } = await supabaseAdmin.rpc('ensure_counselling_slot', { date_param: date })
    
    if (error) {
      console.error('ensure_counselling_slot error:', error)
      // Fallback query by date column (not id, since id is UUID)
      const { data: slotData, error: slotError } = await supabaseAdmin
        .from('counselling_slots')
        .select('*')
        .eq('date', date)
        .limit(1)
        .maybeSingle()
      
      if (slotError) {
        console.error('Fallback slot query error:', slotError)
        throw slotError
      }
      
      return slotData as DbCounsellingSlot | null
    }
    
    return data as DbCounsellingSlot
  },
  
  async create(data: Partial<DbCounsellingSlot>): Promise<DbCounsellingSlot> {
    return insert<DbCounsellingSlot>('counselling_slots', data)
  },
  
  async update(id: string, data: Partial<DbCounsellingSlot>): Promise<DbCounsellingSlot> {
    return update<DbCounsellingSlot>('counselling_slots', id, data)
  },
  
  async incrementBooked(date: string): Promise<DbCounsellingSlot> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured for slot increment')
    }
    
    const slot = await this.getByDate(date)
    if (!slot) throw new Error(`No slot for date ${date}`)
    
    return update<DbCounsellingSlot>(`counselling_slots`, slot.id, {
      booked_slots: slot.booked_slots + 1
    })
  },
  
  async decrementBooked(date: string): Promise<DbCounsellingSlot> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured for slot decrement')
    }
    
    const slot = await this.getByDate(date)
    if (!slot || slot.booked_slots === 0) throw new Error(`Invalid slot for date ${date}`)
    
    return update<DbCounsellingSlot>(`counselling_slots`, slot.id, {
      booked_slots: slot.booked_slots - 1
    })
  },
  
  async setMaxSlots(date: string, max_slots: number): Promise<DbCounsellingSlot> {
    if (!Number.isFinite(max_slots) || Number.isNaN(max_slots)) {
      throw new Error('max_slots must be a valid number')
    }
    if (max_slots < 0 || max_slots > 100) {
      throw new Error('max_slots must be between 0 and 100')
    }

    let slot = await this.getByDate(date)
    
    // If slot doesn't exist, create it
    if (!slot) {
      slot = await insert<DbCounsellingSlot>('counselling_slots', {
        date,
        max_slots,
        booked_slots: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      return slot
    }
    
    return update<DbCounsellingSlot>(`counselling_slots`, slot.id, {
      max_slots
    })
  },
  
  async delete(date: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured')
    }
    
    const supabaseAdmin = await getSupabaseAdmin()
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available - service role key may be missing')
    }
    
    const { error } = await supabaseAdmin
      .from('counselling_slots')
      .delete()
      .eq('date', date)
    
    if (error) {
      console.error('Error deleting slot:', error)
      throw error
    }
  }
}


