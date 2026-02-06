'use client';

import React from 'react';
import Image from 'next/image';
import { Star, MapPin, Video, Users, Clock } from 'lucide-react';
import { Counsellor } from '@/types/counselling';

interface CounsellorCardProps {
  counsellor: Counsellor;
  onSelect: (counsellor: Counsellor) => void;
  isSelected?: boolean;
}

export default function CounsellorCard({ counsellor, onSelect, isSelected }: CounsellorCardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer border-2 ${
        isSelected ? 'border-[#C8102E] ring-2 ring-[#C8102E] ring-opacity-50' : 'border-transparent hover:border-gray-200'
      }`}
      onClick={() => onSelect(counsellor)}
    >
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0">
          <Image
            src={counsellor.imageUrl}
            alt={counsellor.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 192px"
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {counsellor.isOnline && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Video size={12} /> Online
              </span>
            )}
            {counsellor.isInPerson && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <MapPin size={12} /> In-Person
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-bold text-[#003399]">{counsellor.name}</h3>
              <p className="text-sm text-gray-600">{counsellor.title}</p>
            </div>
            {/* Rating */}
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
              <Star className="text-yellow-500 fill-yellow-500" size={16} />
              <span className="font-semibold text-gray-800">{counsellor.rating}</span>
              <span className="text-gray-500 text-sm">({counsellor.reviewCount})</span>
            </div>
          </div>

          {/* Specializations */}
          <div className="flex flex-wrap gap-1 mb-3">
            {counsellor.specialization.slice(0, 3).map((spec) => (
              <span
                key={spec}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
              >
                {spec}
              </span>
            ))}
            {counsellor.specialization.length > 3 && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                +{counsellor.specialization.length - 3} more
              </span>
            )}
          </div>

          {/* Bio */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{counsellor.bio}</p>

          {/* Footer Info */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{counsellor.yearsOfExperience} years exp.</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{counsellor.availability.length} days/week</span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              <span className="font-medium">Email:</span> {counsellor.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

