'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, Star, Clock, Video, MapPin, Loader2 } from 'lucide-react';
import CounsellorCard from './CounsellorCard';
import TimeSlotPicker from './TimeSlotPicker';
import {
  Counsellor,
  BookingFormData,
  TimeSlot,
  SESSION_DURATIONS,
  TOPICS,
  formatDateForDisplay,
  formatTimeForDisplay,
} from '@/types/counselling';

interface CounsellingBookingProps {
  initialCountry?: string;
}

type BookingStep = 'counsellor' | 'datetime' | 'details' | 'confirm' | 'success';

interface ApiResponse {
  success: boolean;
  data?: {
    confirmationNumber: string;
    booking: {
      id: string;
      confirmationNumber: string;
      status: string;
      preferredDate: string;
      preferredTime: string;
      bookingType: string;
      topic: string;
      teamsMeetingUrl?: string;
      counsellor: {
        name: string;
        title: string;
      };
    };
  };
  error?: string;
  errors?: string[];
}

export default function CounsellingBooking({ initialCountry = 'GH' }: CounsellingBookingProps) {
  // Current step
  const [currentStep, setCurrentStep] = useState<BookingStep>('counsellor');

  // Counsellor selection
  const [selectedCounsellor, setSelectedCounsellor] = useState<Counsellor | null>(null);

  // Fetched counselors from API
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [loadingCounsellors, setLoadingCounsellors] = useState(true);
  const [counsellorsError, setCounsellorsError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: initialCountry,
    city: '',
    counsellorId: '',
    bookingType: 'online',
    preferredDate: '',
    preferredTime: '',
    sessionDuration: 60,
    topic: '',
    notes: '',
  });

  // Time slots
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [dailySlots, setDailySlots] = useState<Record<string, { max_slots: number; booked_slots: number; available_slots: number }>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Booking result
  const [bookingResult, setBookingResult] = useState<ApiResponse['data'] | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch counselors from API on mount
  useEffect(() => {
    const fetchCounsellors = async () => {
      setLoadingCounsellors(true);
      setCounsellorsError(null);
      try {
        const response = await fetch('/api/counsellors');
        const data = await response.json();
        
        if (data.success) {
          setCounsellors(data.data.counsellors);
        } else {
          setCounsellorsError('Failed to load counselors');
        }
      } catch (error) {
        console.error('Error fetching counselors:', error);
        setCounsellorsError('Failed to load counselors');
      } finally {
        setLoadingCounsellors(false);
      }
    };

    fetchCounsellors();
  }, []);

  // Fetch time slots when counsellor is selected
  useEffect(() => {
    if (selectedCounsellor) {
      fetchTimeSlots();
    }
  }, [selectedCounsellor]);

  const fetchTimeSlots = async () => {
    if (!selectedCounsellor) return;

    setLoadingSlots(true);
    try {
      const response = await fetch(
        `/api/counselling?counsellorId=${selectedCounsellor.id}&bookingType=${formData.bookingType}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      
      // Try to parse the response as JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse time slots response:', parseError);
        console.error('Response text:', text);
        throw new Error('Invalid JSON response from server');
      }

      if (data.success && data.data?.availableSlots) {
        setTimeSlots(data.data.availableSlots);
        if (data.data.dailySlots) {
          const ds: Record<string, { max_slots: number; booked_slots: number; available_slots: number }> = {};
          data.data.dailySlots.forEach((s: any) => { ds[s.date] = s; });
          setDailySlots(ds);
        }
      } else if (data.success && data.data?.slots) {
        // Fallback for API that returns 'slots' instead of 'availableSlots'
        setTimeSlots(data.data.slots);
      } else {
        console.warn('Unexpected API response structure:', data);
      }
    } catch (error) {
      console.error('Failed to fetch time slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Handle form field changes
  const handleFieldChange = (field: keyof BookingFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Refetch slots if booking type changes
    if (field === 'bookingType' && selectedCounsellor) {
      fetchTimeSlots();
    }
  };

  // Handle counsellor selection
  const handleCounsellorSelect = (counsellor: Counsellor) => {
    setSelectedCounsellor(counsellor);
    setFormData((prev) => ({ ...prev, counsellorId: counsellor.id }));
    // Auto-continue to next step
    setTimeout(() => {
      setCurrentStep('datetime');
    }, 300);
  };

  // Validate current step
  const validateStep = (step: BookingStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'counsellor':
        if (!formData.counsellorId) {
          newErrors.counsellor = 'Please select a counsellor';
        }
        break;
      case 'datetime':
        if (!formData.preferredDate) {
          newErrors.preferredDate = 'Please select a date';
        }
        if (!formData.preferredTime) {
          newErrors.preferredTime = 'Please select a time';
        }
        break;
      case 'details':
        if (!formData.firstName.trim()) {
          newErrors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
          newErrors.lastName = 'Last name is required';
        }
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        }
        if (!formData.country) {
          newErrors.country = 'Country is required';
        }
        if (!formData.topic.trim()) {
          newErrors.topic = 'Please specify a topic';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const goToStep = (step: BookingStep) => {
    const currentIndex = steps.findIndex((s) => s.key === currentStep);
    const targetIndex = steps.findIndex((s) => s.key === step);

    // Allow navigation to any step (both forward and backward)
    // Users can continue to next steps or go back to previous steps
    setCurrentStep(step);
  };

  // Submit booking
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setBookingError(null);

    try {
      const response = await fetch('/api/counselling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setBookingResult(data.data || null);
        setCurrentStep('success');
      } else {
        setBookingError(data.error || 'Failed to create booking');
      }
    } catch (error) {
      setBookingError('Failed to create booking. Please try again.');
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset booking
  const resetBooking = () => {
    setCurrentStep('counsellor');
    setSelectedCounsellor(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: initialCountry,
      city: '',
      counsellorId: '',
      bookingType: 'online',
      preferredDate: '',
      preferredTime: '',
      sessionDuration: 60,
      topic: '',
      notes: '',
    });
    setTimeSlots([]);
    setBookingResult(null);
    setBookingError(null);
    setErrors({});
  };

  // Steps configuration
  const steps = [
    { key: 'counsellor', label: 'Select Counsellor' },
    { key: 'datetime', label: 'Date & Time' },
    { key: 'details', label: 'Your Details' },
    { key: 'confirm', label: 'Confirm' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      {currentStep !== 'success' && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = step.key === currentStep;
              const isCompleted = index < currentStepIndex;
              const isFuture = index > currentStepIndex;

              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-[#C8102E] text-white'
                          : isFuture
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? <Check size={20} /> : index + 1}
                    </div>
                    <span
                      className={`text-xs mt-2 hidden sm:block ${
                        isActive ? 'text-[#C8102E] font-medium' : isFuture ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Alert */}
      {bookingError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{bookingError}</p>
        </div>
      )}

      {/* Step: Select Counsellor */}
      {currentStep === 'counsellor' && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#003399]">Select a Counsellor</h2>
            <p className="text-gray-600">Choose a counsellor who specializes in your area of need</p>
          </div>

          {/* Booking Type Selection */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => handleFieldChange('bookingType', 'online')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
                formData.bookingType === 'online'
                  ? 'border-[#C8102E] bg-red-50 text-[#C8102E]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Video size={20} />
              <span className="font-medium">Online</span>
            </button>
            <button
              type="button"
              onClick={() => handleFieldChange('bookingType', 'in-person')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
                formData.bookingType === 'in-person'
                  ? 'border-[#C8102E] bg-red-50 text-[#C8102E]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <MapPin size={20} />
              <span className="font-medium">In-Person</span>
            </button>
          </div>

          {/* Counsellor Cards */}
          {loadingCounsellors ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-[#C8102E]" size={40} />
            </div>
          ) : counsellorsError ? (
            <div className="text-center py-12 text-red-500">
              <p>{counsellorsError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 text-[#C8102E] underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {counsellors.filter((c: Counsellor) =>
                formData.bookingType === 'online' ? c.isOnline : c.isInPerson
              ).map((counsellor: Counsellor) => (
                <div
                  key={counsellor.id}
                  onClick={() => handleCounsellorSelect(counsellor)}
                  className={`cursor-pointer ${
                    formData.counsellorId === counsellor.id ? 'ring-2 ring-[#C8102E] rounded-xl' : ''
                  }`}
                >
                  <CounsellorCard
                    counsellor={counsellor}
                    onSelect={handleCounsellorSelect}
                    isSelected={formData.counsellorId === counsellor.id}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Validation Error */}
          {errors.counsellor && (
            <div className="text-red-500 text-sm text-center mt-4">{errors.counsellor}</div>
          )}

          {/* Continue Button */}
          {formData.counsellorId && (
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => goToStep('datetime')}
                className="flex items-center gap-2 px-6 py-3 bg-[#C8102E] text-white rounded-lg hover:bg-[#A00D25] transition-colors"
              >
                Continue <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step: Date & Time */}
      {currentStep === 'datetime' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => goToStep('counsellor')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-[#003399]">Select Date & Time</h2>
              <p className="text-gray-600">
                Choose your preferred appointment time with {selectedCounsellor?.name}
              </p>
            </div>
          </div>

          {/* Selected Counsellor Summary */}
          {selectedCounsellor && (
            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
              <img 
                src={selectedCounsellor.imageUrl || '/file.svg'} 
                alt={selectedCounsellor.name} 
                className="w-16 h-16 rounded-full object-cover object-top"
              />
              <div>
                <h3 className="font-semibold text-gray-800">{selectedCounsellor.name}</h3>
                <p className="text-sm text-gray-600">{selectedCounsellor.title}</p>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span>{selectedCounsellor.rating}</span>
                </div>
              </div>
            </div>
          )}

          {/* Session Duration */}
          <div>
            <label className="block font-medium text-gray-800 mb-2">Session Duration</label>
            <div className="flex gap-2">
              {SESSION_DURATIONS.map((duration) => (
                <button
                  key={duration.value}
                  type="button"
                  onClick={() => handleFieldChange('sessionDuration', duration.value)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.sessionDuration === duration.value
                      ? 'border-[#C8102E] bg-red-50 text-[#C8102E]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {duration.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot Picker */}
          {loadingSlots ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-[#C8102E]" size={40} />
            </div>
          ) : (
            <TimeSlotPicker
              slots={timeSlots}
              selectedDate={formData.preferredDate}
              selectedTime={formData.preferredTime}
              onDateChange={(date) => handleFieldChange('preferredDate', date)}
              onTimeChange={(time) => handleFieldChange('preferredTime', time)}
              dailySlots={dailySlots}
            />
          )}

          {/* Validation Errors */}
          {(errors.preferredDate || errors.preferredTime) && (
            <div className="text-red-500 text-sm">{errors.preferredDate || errors.preferredTime}</div>
          )}

          {/* Continue Button */}
          {formData.preferredDate && formData.preferredTime && (
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => goToStep('details')}
                className="flex items-center gap-2 px-6 py-3 bg-[#C8102E] text-white rounded-lg hover:bg-[#A00D25] transition-colors"
              >
                Continue <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step: Details */}
      {currentStep === 'details' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => goToStep('datetime')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-[#003399]">Your Details</h2>
              <p className="text-gray-600">Enter your contact information</p>
            </div>
          </div>

          {/* Selected Counsellor & Time Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Counsellor</h4>
              <div className="flex items-center gap-3">
                <img 
                  src={selectedCounsellor?.imageUrl || '/file.svg'} 
                  alt={selectedCounsellor?.name || ''} 
                className="w-12 h-12 rounded-full object-cover object-top"
                />
                <div>
                  <p className="font-semibold">{selectedCounsellor?.name}</p>
                  <p className="text-sm text-gray-500">{selectedCounsellor?.title}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Appointment</h4>
              <p className="text-sm">{formatDateForDisplay(formData.preferredDate)} at {formatTimeForDisplay(formData.preferredTime)}</p>
              <p className="text-sm text-gray-500">{formData.sessionDuration} minutes ({formData.bookingType})</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
                placeholder="John"
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
                placeholder="Doe"
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
                placeholder="john@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
                placeholder="+233 123 456 789"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleFieldChange('country', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
                placeholder="Ghana"
              />
              {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleFieldChange('city', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8102E] focus:border-transparent"
                placeholder="Accra"
              />
            </div>
          </div>

          {/* Topic Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Counselling Topic *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleFieldChange('topic', topic)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.topic === topic
                      ? 'border-[#C8102E] bg-red-50 text-[#C8102E]'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
            {errors.topic && <p className="mt-2 text-sm text-red-600">{errors.topic}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C8102E] focus:border-transparent resize-vertical"
              placeholder="Any additional information or specific concerns..."
            />
          </div>

          {/* Continue Button */}
          {Object.keys(errors).length === 0 && (
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => goToStep('confirm')}
                className="flex items-center gap-2 px-8 py-4 bg-[#C8102E] text-white rounded-xl hover:bg-[#A00D25] transition-all font-semibold shadow-lg"
              >
                Review & Confirm <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step: Confirm */}
      {currentStep === 'confirm' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => goToStep('details')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-[#003399]">Confirm Booking</h2>
              <p className="text-gray-600">Please review your booking details</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border-2 border-dashed border-gray-200">
            {/* Counsellor Info */}
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={selectedCounsellor?.imageUrl || '/file.svg'} 
                alt={selectedCounsellor?.name || ''} 
                className="w-16 h-16 rounded-full object-cover object-top"
              />
              <div>
                <p className="font-semibold text-xl text-gray-800">{selectedCounsellor?.name}</p>
                <p className="text-lg text-gray-600">{selectedCounsellor?.title}</p>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Appointment Details</h4>
                <div className="space-y-2 text-lg">
                  <div className="flex items-center gap-3">
                    <Clock size={20} className="text-[#C8102E]" />
                    <span>{formatDateForDisplay(formData.preferredDate)} at {formatTimeForDisplay(formData.preferredTime)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {formData.bookingType === 'online' ? <Video size={20} className="text-[#C8102E]" /> : <MapPin size={20} className="text-[#C8102E]" />}
                    <span>{formData.sessionDuration} min {formData.bookingType} session</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Topic</h4>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-lg font-medium">{formData.topic}</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h4 className="font-semibold text-gray-800 mb-4">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}</div>
                <div><span className="font-medium">Email:</span> {formData.email}</div>
                <div><span className="font-medium">Phone:</span> {formData.phone}</div>
                <div><span className="font-medium">Location:</span> {formData.country}, {formData.city}</div>
              </div>
            </div>

            {/* Notes */}
            {formData.notes && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3">Notes</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{formData.notes}</p>
              </div>
            )}

            <div className="pt-6 border-t flex justify-end gap-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-4 bg-[#C8102E] text-white rounded-xl hover:bg-[#A00D25] transition-all font-semibold shadow-xl flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Creating Booking...
                  </>
                ) : (
                  <>
                    Confirm & Book Now
                    <Check size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step: Success */}
      {currentStep === 'success' && bookingResult && (
        <div className="text-center space-y-8 py-12">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-green-600 mb-4">Booking Confirmed!</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your counselling session has been successfully booked. You will receive a confirmation email shortly.
            </p>
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="font-bold text-2xl text-green-800 mb-4">Confirmation #{bookingResult.confirmationNumber}</h3>
              <div className="grid md:grid-cols-2 gap-6 text-lg">
                <div>
                  <p className="font-semibold text-gray-800">Counsellor</p>
                  <p>{bookingResult.booking.counsellor.name}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Date & Time</p>
                  <p>{formatDateForDisplay(bookingResult.booking.preferredDate)} at {formatTimeForDisplay(bookingResult.booking.preferredTime)}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Topic</p>
                  <p>{bookingResult.booking.topic}</p>
                </div>
                {bookingResult.booking.teamsMeetingUrl && (
                  <div>
                    <p className="font-semibold text-gray-800">Meeting Link</p>
                    <a href={bookingResult.booking.teamsMeetingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Join Meeting
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={resetBooking}
              className="px-8 py-3 bg-[#C8102E] text-white rounded-xl hover:bg-[#A00D25] transition-all font-semibold"
            >
              Book Another Session
            </button>
            <a
              href="/counselling"
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
            >
              Back to Counselling
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

