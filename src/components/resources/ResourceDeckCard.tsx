'use client';

import React from 'react';
import { BookOpen, Presentation, Calendar, Award } from 'lucide-react';
import Link from 'next/link';
import { DeckMetadata } from '@/lib/resources/decks';

interface ResourceDeckCardProps {
  deck: DeckMetadata;
}

export default function ResourceDeckCard({ deck }: ResourceDeckCardProps) {
  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col justify-between h-full relative overflow-hidden bg-white border border-[#e2ded5] shadow-sm hover:shadow-md transition-all duration-300">
      
      {/* Visual top accent bar */}
      <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#0E5E5A] to-[#E05E1B]" />

      <div className="space-y-4">
        {/* Category & Status Row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0E5E5A]/10 text-[#0E5E5A]">
            {deck.category === 'Health Curriculum' ? (
              <BookOpen className="w-3 h-3 mr-1" />
            ) : (
              <Presentation className="w-3 h-3 mr-1" />
            )}
            {deck.category}
          </span>

          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide bg-[#E05E1B]/10 text-[#E05E1B] border border-[#E05E1B]/20">
            <Award className="w-2.5 h-2.5 mr-0.5" />
            {deck.statusBadge}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-[#122321] leading-snug line-clamp-2 hover:text-[#0E5E5A] transition-colors">
          {deck.title}
        </h3>

        {/* Description */}
        <p className="editorial-text text-sm text-[#4a5553] leading-relaxed line-clamp-3">
          {deck.description}
        </p>
      </div>

      {/* Meta Info & CTA Action Button */}
      <div className="mt-8 pt-6 border-t border-[#e2ded5] flex items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#1c3330] font-bold">
          <span>{deck.slideCount} Slides</span>
        </div>

        <Link 
          href={`/resources/${deck.slug}`}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#0E5E5A] hover:bg-[#E05E1B] text-white text-xs font-bold transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer text-white-only"
        >
          Read Deck
        </Link>
      </div>
    </div>
  );
}
