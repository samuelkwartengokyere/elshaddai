'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Users, 
  Trash2, 
  Edit,
  Mail,
  Phone,
  Loader2,
  X,
  Star,
  Globe,
  MapPin,
  Calendar,
  RefreshCw,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock
} from 'lucide-react';
import Image from 'next/image'
import ImageUpload from '@/components/ImageUpload';

interface Counsellor {
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
  createdAt?: string;
  updatedAt?: string;
}

interface Availability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

import { TOPICS, CounsellingSlot, UpsertSlotData } from '@/types/counselling';

export default function CounsellingAdminPage() {
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCounsellor, setEditingCounsellor] = useState<Counsellor | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    email: '',
    phone: '',
    specialization: [] as string[],
    imageUrl: '',
    isOnline: true,
    isInPerson: true,
    yearsOfExperience: 0,
    availability: [] as Availability[]
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  // Slots tab state
  const [activeTab, setActiveTab] = useState<'counsellors' | 'slots'>('counsellors');
  const [slots, setSlots] = useState<CounsellingSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotForm, setSlotForm] = useState<UpsertSlotData>({ date: '', max_slots: 10 });
  const [bulkDates, setBulkDates] = useState<string[]>([]);
  const [bulkMaxSlots, setBulkMaxSlots] = useState(10);

  // Computed stats for overall slots
  const overallStats = useMemo(() => {
    const totalDays = slots.length;
    const totalCapacity = slots.reduce((sum, s) => sum + s.max_slots, 0);
    const totalBooked = slots.reduce((sum, s) => sum + s.booked_slots, 0);
    const totalAvailable = slots.reduce((sum, s) => sum + s.available_slots, 0);
    const fillRate = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;
    const fullyBookedDays = slots.filter(s => s.available_slots === 0 && s.max_slots > 0).length;
    const availableDays = slots.filter(s => s.available_slots > 0).length;
    const emptyDays = slots.filter(s => s.max_slots === 0).length;
    return { totalDays, totalCapacity, totalBooked, totalAvailable, fillRate, fullyBookedDays, availableDays, emptyDays };
  }, [slots]);

  // Computed stats for single date selection
  const singleDateStats = useMemo(() => {
    if (!slotForm.date) return null;
    const existingSlot = slots.find(s => s.date === slotForm.date);
    const currentMax = existingSlot?.max_slots ?? 0;
    const newMax = slotForm.max_slots;
    const existingBookings = existingSlot?.booked_slots ?? 0;
    const change = newMax - currentMax;
    const wouldBeOverbooked = newMax < existingBookings;
    const newAvailable = Math.max(0, newMax - existingBookings);
    return { date: slotForm.date, currentMax, newMax, existingBookings, change, wouldBeOverbooked, newAvailable, hasExisting: !!existingSlot };
  }, [slotForm, slots]);

  // Computed stats for bulk date selection
  const bulkStats = useMemo(() => {
    if (bulkDates.length === 0) return null;
    const totalNewSlots = bulkDates.length * bulkMaxSlots;
    let existingBookings = 0;
    let existingCapacity = 0;
    let daysWithExisting = 0;
    let wouldBeOverbooked = 0;
    bulkDates.forEach(date => {
      const existing = slots.find(s => s.date === date);
      if (existing) {
        existingBookings += existing.booked_slots;
        existingCapacity += existing.max_slots;
        daysWithExisting++;
        if (bulkMaxSlots < existing.booked_slots) wouldBeOverbooked++;
      }
    });
    const netChange = totalNewSlots - existingCapacity;
    const dateRange = bulkDates.length > 1
      ? `${new Date(bulkDates[0] + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(bulkDates[bulkDates.length - 1] + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : new Date(bulkDates[0] + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { daysCount: bulkDates.length, totalNewSlots, existingBookings, existingCapacity, daysWithExisting, netChange, wouldBeOverbooked, dateRange };
  }, [bulkDates, bulkMaxSlots, slots]);

  // Slot management handlers
  const handleSetSlot = async () => {
    if (!slotForm.date) {
      setError('Date is required');
      return;
    }
    try {
      setLoadingSlots(true);
      const response = await fetch('/api/counselling-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slotForm)
      });
      const data = await response.json();
      if (data.success) {
        fetchSlots();
        setSlotForm({ date: '', max_slots: 10 });
        setSuccess('Slot updated successfully!');
      } else {
        setError(data.error || 'Failed to update slot');
      }
    } catch (error) {
      console.error('Set slot error:', error);
      setError('Failed to update slot');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (bulkDates.length === 0) {
      setError('No dates selected');
      return;
    }
    try {
      setLoadingSlots(true);
      const updates = bulkDates.map(date => ({
        date,
        max_slots: bulkMaxSlots
      }));
      const response = await fetch('/api/counselling-slots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (data.success) {
        fetchSlots();
        setSuccess(`Updated ${data.data?.updated || 0} slots`);
      } else {
        setError(data.error || 'Bulk update failed');
      }
    } catch (error) {
      console.error('Bulk update error:', error);
      setError('Bulk update failed');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleEditSlot = (date: string, maxSlots: number) => {
    setSlotForm({ date, max_slots: maxSlots });
  };

  const fetchCounsellors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (showAll) params.append('includeInactive', 'true');

      const response = await fetch(`/api/counsellors?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setCounsellors(data.data.counsellors);
        setPagination(prev => ({
          ...prev,
          total: data.data.total,
          totalPages: Math.ceil(data.data.total / pagination.limit)
        }));
      }
    } catch (error) {
      console.error('Error fetching counselors:', error);
      setError('Failed to load counselors');
    } finally {
      setLoading(false);
    }
  };

  // Fetch counsellors on mount/change
  useEffect(() => {
    fetchCounsellors();
  }, [pagination.page, showAll]);

  // Fetch slots when slots tab activated
  const fetchSlots = async () => {
    setLoadingSlots(true);
    try {
      const response = await fetch('/api/counselling-slots?days=30');
      const data = await response.json();
      if (data.success) {
        setSlots(data.data.slots);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'slots') {
      fetchSlots();
    }
  }, [activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCounsellors();
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      title: '',
      bio: '',
      email: '',
      phone: '',
      specialization: [],
      imageUrl: '',
      isOnline: true,
      isInPerson: true,
      yearsOfExperience: 0,
      availability: []
    });
    setEditingCounsellor(null);
    setError('');
    setSuccess('');
    setShowCreateModal(true);
  };

  const openEditModal = (counsellor: Counsellor) => {
    setModalMode('edit');
    setEditingCounsellor(counsellor);
    setFormData({
      name: counsellor.name,
      title: counsellor.title,
      bio: counsellor.bio,
      email: counsellor.email,
      phone: counsellor.phone || '',
      specialization: counsellor.specialization,
      imageUrl: counsellor.imageUrl,
      isOnline: counsellor.isOnline,
      isInPerson: counsellor.isInPerson,
      yearsOfExperience: counsellor.yearsOfExperience,
      availability: counsellor.availability
    });
    setError('');
    setSuccess('');
    setShowCreateModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/counsellors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Counsellor added successfully!');
        setShowCreateModal(false);
        setFormData({
          name: '',
          title: '',
          bio: '',
          email: '',
          phone: '',
          specialization: [],
          imageUrl: '',
          isOnline: true,
          isInPerson: true,
          yearsOfExperience: 0,
          availability: []
        });
        fetchCounsellors();
      } else {
        setError(data.error || 'Failed to add counsellor');
      }
    } catch (error) {
      console.error('Create error:', error);
      setError('An error occurred while adding counsellor');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCounsellor) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/counsellors?id=${editingCounsellor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Counsellor updated successfully!');
        setShowCreateModal(false);
        setEditingCounsellor(null);
        fetchCounsellors();
      } else {
        setError(data.error || 'Failed to update counsellor');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError('An error occurred while updating counsellor');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this counsellor?')) return;
    
    setDeletingId(id);
    try {
      const response = await fetch(`/api/counsellors?id=${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Counsellor deleted successfully!');
        fetchCounsellors();
      } else {
        alert(data.error || 'Failed to delete counsellor');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting');
    } finally {
      setDeletingId(null);
    }
  };

  const addAvailabilitySlot = () => {
    setFormData(prev => ({
      ...prev,
      availability: [
        ...prev.availability,
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }
      ]
    }));
  };

  const removeAvailabilitySlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index)
    }));
  };

  const updateAvailabilitySlot = (index: number, field: keyof Availability, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const toggleSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec]
    }));
  };

  const filteredCounsellors = search
    ? counsellors.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.specialization.some(s => s.toLowerCase().includes(search.toLowerCase()))
      )
    : counsellors;

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('counsellors')}
          className={`pb-4 px-1 border-b-2 font-medium ${
            activeTab === 'counsellors'
              ? 'border-[#C8102E] text-[#C8102E]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Counsellors
        </button>
        <button
          onClick={() => setActiveTab('slots')}
          className={`ml-8 pb-4 px-1 border-b-2 font-medium ${
            activeTab === 'slots'
              ? 'border-[#C8102E] text-[#C8102E]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Daily Slots
        </button>
      </div>

      {/* Counsellors Tab */}
      {activeTab === 'counsellors' && (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <form onSubmit={handleSearch} className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search counselors..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent w-64"
                  />
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showAll}
                    onChange={(e) => {
                      setShowAll(e.target.checked);
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">Show inactive</span>
                </label>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300"
                >
                  Search
                </button>
              </form>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Counsellor
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Total Counsellors</p>
              <p className="text-2xl font-bold">{pagination.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Active</p>
              <p className="text-2xl font-bold text-green-500">
                {counsellors.filter(c => c.isActive).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">Online Sessions</p>
              <p className="text-2xl font-bold text-blue-500">
                {counsellors.filter(c => c.isOnline).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-600 text-sm">In-Person</p>
              <p className="text-2xl font-bold text-purple-500">
                {counsellors.filter(c => c.isInPerson).length}
              </p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <span className="ml-2 text-gray-600">Loading counselors...</span>
            </div>
          )}

          {/* Counsellors Grid */}
          {!loading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCounsellors.map((counsellor) => (
                  <div 
                    key={counsellor.id} 
                    className={`bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition duration-300 ${!counsellor.isActive ? 'opacity-60' : ''}`}
                  >
                    {/* Image */}
                    <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                      {counsellor.imageUrl ? (
                        <Image 
                          src={counsellor.imageUrl} 
                          alt={counsellor.name}
                          fill
                          className="object-cover object-[center_20%]"
                        />
                      ) : (
                        <Users className="h-16 w-16 text-gray-400" />
                      )}
                      {!counsellor.isActive && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                          Inactive
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-800">{counsellor.name}</h3>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <span className="text-sm font-medium">{counsellor.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-accent font-medium mb-2">{counsellor.title}</p>
                      
                      <div className="flex gap-2 mb-3">
                        {counsellor.isOnline && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center">
                            <Globe className="h-3 w-3 mr-1" /> Online
                          </span>
                        )}
                        {counsellor.isInPerson && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center">
                            <MapPin className="h-3 w-3 mr-1" /> In-Person
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {counsellor.specialization.slice(0, 3).map((spec) => (
                          <span key={spec} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {spec}
                          </span>
                        ))}
                        {counsellor.specialization.length > 3 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            +{counsellor.specialization.length - 3}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">{counsellor.bio}</p>
                      
                      <div className="space-y-2 text-sm text-gray-500">
                        {counsellor.email && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="truncate">{counsellor.email}</span>
                          </div>
                        )}
                        {counsellor.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>{counsellor.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex justify-between mt-4 pt-4 border-t">
                        <button
                          onClick={() => handleDelete(counsellor.id)}
                          disabled={deletingId === counsellor.id}
                          className="flex items-center text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          {deletingId === counsellor.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(counsellor)}
                          className="flex items-center text-accent hover:text-red-600"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredCounsellors.length === 0 && (
                <div className="text-center py-20 bg-white rounded-lg shadow">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">No counselors found</h3>
                  <p className="text-gray-600 mb-4">
                    {search 
                      ? 'Try adjusting your search'
                      : 'Add your first counsellor to get started'}
                  </p>
                  <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 inline-flex items-center"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Counsellor
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Slots Tab */}
      {activeTab === 'slots' && (
        <div>
          {/* Overall Stats */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overall Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-medium">Total Days</p>
                    <p className="text-2xl font-bold text-gray-800">{overallStats.totalDays}</p>
                  </div>
                  <CalendarDays className="h-8 w-8 text-blue-200" />
                </div>
                <p className="text-xs text-gray-400 mt-1">{overallStats.availableDays} available, {overallStats.fullyBookedDays} full</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-medium">Total Capacity</p>
                    <p className="text-2xl font-bold text-gray-800">{overallStats.totalCapacity}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-200" />
                </div>
                <p className="text-xs text-gray-400 mt-1">{overallStats.emptyDays} days with 0 slots</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-medium">Total Booked</p>
                    <p className="text-2xl font-bold text-gray-800">{overallStats.totalBooked}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-200" />
                </div>
                <p className="text-xs text-gray-400 mt-1">{overallStats.fillRate}% fill rate</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-medium">Available</p>
                    <p className="text-2xl font-bold text-gray-800">{overallStats.totalAvailable}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-200" />
                </div>
                <p className="text-xs text-gray-400 mt-1">{Math.round(overallStats.totalAvailable / Math.max(overallStats.totalDays, 1))} avg per day</p>
              </div>
            </div>
          </div>

          {/* Selected Days Preview */}
          {(singleDateStats || bulkStats) && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Selection Preview
              </h3>
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                {singleDateStats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500 uppercase font-medium">Selected Date</p>
                      <p className="text-lg font-bold text-indigo-700">{new Date(singleDateStats.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {singleDateStats.hasExisting ? 'Existing slot will be updated' : 'New slot will be created'}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500 uppercase font-medium">Slot Change</p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-800">{singleDateStats.currentMax}</span>
                        {singleDateStats.change >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                        <span className="text-lg font-bold text-gray-800">{singleDateStats.newMax}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {singleDateStats.change > 0 ? `+${singleDateStats.change} slots` : singleDateStats.change < 0 ? `${singleDateStats.change} slots` : 'No change'}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-xs text-gray-500 uppercase font-medium">After Update</p>
                      <p className="text-lg font-bold text-gray-800">{singleDateStats.newAvailable} available</p>
                      {singleDateStats.wouldBeOverbooked ? (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Would exceed existing {singleDateStats.existingBookings} bookings
                        </p>
                      ) : singleDateStats.existingBookings > 0 ? (
                        <p className="text-xs text-gray-400 mt-1">{singleDateStats.existingBookings} existing bookings preserved</p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-1">No existing bookings</p>
                      )}
                    </div>
                  </div>
                )}

                {bulkStats && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-gray-500 uppercase font-medium">Days Selected</p>
                        <p className="text-xl font-bold text-indigo-700">{bulkStats.daysCount}</p>
                        <p className="text-xs text-gray-400 mt-1">{bulkStats.dateRange}</p>
                      </div>

                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-gray-500 uppercase font-medium">Total New Slots</p>
                        <p className="text-xl font-bold text-gray-800">{bulkStats.totalNewSlots}</p>
                        <p className="text-xs text-gray-400 mt-1">{bulkMaxSlots} per day</p>
                      </div>

                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-gray-500 uppercase font-medium">Net Change</p>
                        <div className="flex items-center gap-1">
                          <p className={`text-xl font-bold ${bulkStats.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {bulkStats.netChange > 0 ? '+' : ''}{bulkStats.netChange}
                          </p>
                          {bulkStats.netChange !== 0 && (
                            bulkStats.netChange > 0
                              ? <TrendingUp className="h-5 w-5 text-green-500" />
                              : <TrendingDown className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">from {bulkStats.existingCapacity} current</p>
                      </div>

                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-gray-500 uppercase font-medium">Existing Bookings</p>
                        <p className="text-xl font-bold text-gray-800">{bulkStats.existingBookings}</p>
                        <p className="text-xs text-gray-400 mt-1">across {bulkStats.daysWithExisting} day(s)</p>
                      </div>
                    </div>

                    {bulkStats.wouldBeOverbooked > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-700">
                          <span className="font-semibold">Warning:</span> {bulkStats.wouldBeOverbooked} day(s) have more existing bookings than the new slot limit. Those days will show negative availability.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Slots Controls */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Single Date */}
              <div>
                <label className="block text-sm font-medium mb-2">Set Single Day</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={slotForm.date}
                    onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={slotForm.max_slots}
                    onChange={(e) => setSlotForm({ ...slotForm, max_slots: parseInt(e.target.value) || 10 })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="10"
                  />
                  <button
                    onClick={handleSetSlot}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
                  >
                    Set
                  </button>
                </div>
              </div>

              {/* Bulk Update */}
              <div>
                <label className="block text-sm font-medium mb-2">Bulk Update</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={bulkDates.length || ''}
                    onChange={(e) => {
                      const num = parseInt(e.target.value) || 0;
                      const dates: string[] = [];
                      const today = new Date();
                      for (let i = 0; i < num; i++) {
                        const date = new Date(today);
                        date.setDate(today.getDate() + i);
                        dates.push(date.toISOString().split('T')[0]);
                      }
                      setBulkDates(dates);
                    }}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Days"
                  />
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={bulkMaxSlots}
                    onChange={(e) => setBulkMaxSlots(parseInt(e.target.value) || 10)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="10"
                  />
                  <button
                    onClick={handleBulkUpdate}
                    disabled={bulkDates.length === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 whitespace-nowrap"
                  >
                    Bulk Set
                  </button>
                </div>
              </div>

              {/* Refresh */}
              <div className="flex items-end">
                <button
                  onClick={fetchSlots}
                  disabled={loadingSlots}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
                >
                  {loadingSlots ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Slots Table */}
          {loadingSlots ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin h-8 w-8 text-gray-400 mr-2" />
              <span>Loading slots...</span>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No slots data</h3>
              <p className="text-gray-500 mb-4">Use Quick Actions to set up daily limits</p>
              <button
                onClick={fetchSlots}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Load Slots
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Max Slots
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booked
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {slots.map((slot) => (
                    <tr key={slot.date} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(slot.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {slot.max_slots}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {slot.booked_slots}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          slot.available_slots === 0 
                            ? 'bg-gray-100 text-gray-800' 
                            : slot.available_slots < 3 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {slot.available_slots}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditSlot(slot.date, slot.max_slots)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md" onClick={() => setShowCreateModal(false)} />
          {/* Modal content */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">
                {modalMode === 'create' ? 'Add Counsellor' : 'Edit Counsellor'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={modalMode === 'create' ? handleCreate : handleUpdate} className="p-4">
              {/* Error/Success Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  {success}
                </div>
              )}

              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title/Position *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="e.g., Senior Pastoral Counsellor"
                />
              </div>

              {/* Bio */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio *
                </label>
                <textarea
                  required
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  rows={3}
                  placeholder="Brief biography..."
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="+233 XX XXX XXXX"
                  />
                </div>
              </div>

              {/* Profile Image */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>
                <div className="flex items-center gap-4">
                  <ImageUpload
                    value={formData.imageUrl}
                    onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                    label="Upload Photo"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">Or enter a URL:</p>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Years of Experience */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>

              {/* Session Types */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Types
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isOnline}
                      onChange={(e) => setFormData(prev => ({ ...prev, isOnline: e.target.checked }))}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Online Sessions</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isInPerson}
                      onChange={(e) => setFormData(prev => ({ ...prev, isInPerson: e.target.checked }))}
                      className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">In-Person Sessions</span>
                  </label>
                </div>
              </div>

              {/* Specializations */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specializations
                </label>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpecialization(spec)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        formData.specialization.includes(spec)
                          ? 'bg-accent text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Availability
                  </label>
                  <button
                    type="button"
                    onClick={addAvailabilitySlot}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Time Slot
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.availability.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <select
                        value={slot.dayOfWeek}
                        onChange={(e) => updateAvailabilitySlot(index, 'dayOfWeek', parseInt(e.target.value))}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {DAYS_OF_WEEK.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateAvailabilitySlot(index, 'startTime', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateAvailabilitySlot(index, 'endTime', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeAvailabilitySlot(index)}
                        className="text-red-500 hover:text-red-700 ml-auto"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {formData.availability.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No availability set</p>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || formData.specialization.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                >
                  {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {uploading 
                    ? 'Saving...'
                    : (modalMode === 'create' ? 'Add Counsellor' : 'Save Changes')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}