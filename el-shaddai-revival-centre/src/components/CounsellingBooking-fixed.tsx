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

      {/* Step Content */}
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

          {/* Continue Button - Only shows when counsellor is selected */}
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
              <img src={selectedCounsellor.imageUrl || '/file.svg'} alt={selectedCounsellor.name} className="w-16 h-16 rounded-full object-cover" />
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
            />
          )}

          {/* Validation Errors */}
          {(errors.preferredDate || errors.preferredTime) && (
            <div className="text-red-500 text-sm">{errors.preferredDate || errors.preferredTime}</div>
          )}

          {/* Continue Button - Only shows when date and time are selected */}
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

      {/* ... rest of the component remains the same, with second img fixed similarly ... */}
      {currentStep === 'details' && (
        <div className="space-y-6">
          {/* ... details step content ... */}
        </div>
      )}

      {currentStep === 'confirm' && (
        <div className="space-y-6">
          {/* ... confirm step with fixed img ... */}
          <div className="flex items-center gap-4">
            <img src={selectedCounsellor?.imageUrl || '/file.svg'} alt={selectedCounsellor?.name || ''} className="w-16 h-16 rounded-full object-cover" />
            <div>
              <p className="font-semibold text-gray-800">{selectedCounsellor?.name}</p>
              <p className="text-sm text-gray-600">{selectedCounsellor?.title}</p>
            </div>
          </div>
          {/* ... rest of confirm step ... */}
        </div>
      )}

      {/* ... success step ... */}
    </div>
  );
}
