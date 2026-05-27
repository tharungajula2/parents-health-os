'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, AlertTriangle, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { DECKS, RESOURCE_LEVEL_DISCLAIMER } from '@/lib/resources/decks';
import ResourceDeckCard from '@/components/resources/ResourceDeckCard';

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#122321] selection:bg-[#0E5E5A]/20">
      
      {/* Visual Navigation Header Banner */}
      <header className="border-b border-[#e2ded5] bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-[#0E5E5A] hover:text-[#E05E1B] transition-colors font-bold text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <span className="data-label">RELEASE 1.0</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide bg-[#0E5E5A]/10 text-[#0E5E5A] border border-[#0E5E5A]/20">
              SANDBOX MODE ACTIVE
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 space-y-16">
        
        {/* Editorial Title & Subtitle Hero Area */}
        <div className="space-y-6 max-w-4xl">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-[#E05E1B]" />
            <span className="data-label uppercase tracking-widest text-[#E05E1B] font-extrabold font-mono">Knowledge Base</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#122321] font-outfit">
            Parents Health OS <span className="brand-heading">Resource Library</span>
          </h1>
          
          <p className="editorial-text text-lg md:text-xl text-[#4a5553] font-medium leading-relaxed">
            Founder-built health education and product operating decks for Indian families, caregivers, and partners. 
            Designed to empower home-care operations with structural clarity and strategic insights.
          </p>
        </div>

        {/* Responsive Two-Column Deck Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {DECKS.map((deck) => (
            <ResourceDeckCard key={deck.slug} deck={deck} />
          ))}
        </div>

        {/* Resource-Level Clinical Safety Warning Banner */}
        <div className="bg-white rounded-3xl border border-[#e2ded5] p-6 md:p-8 shadow-sm space-y-4 max-w-4xl">
          <div className="flex items-center space-x-3 text-[#122321]">
            <AlertTriangle className="w-6 h-6 text-[#E05E1B] flex-shrink-0" />
            <h3 className="text-lg font-bold">Public Knowledge Disclaimer & Safety Protocol</h3>
          </div>

          <div className="space-y-3 text-xs md:text-sm leading-relaxed text-[#4a5553] editorial-text">
            <p className="font-semibold text-[#122321]">
              Please read carefully before exploring these decks:
            </p>
            <p className="text-sm font-medium">
              {RESOURCE_LEVEL_DISCLAIMER}
            </p>
            <p className="text-xs text-[#4a5553]/80 pt-2 border-t border-[#e2ded5]">
              These files are loaded securely inside the Parents Health OS presentation framework. In accordance with platform privacy and asset protection rules, download capabilities, extraction APIs, and raw export formats are fully restricted.
            </p>
          </div>
        </div>

      </main>

      {/* Warm Grounded Footer */}
      <footer className="border-t border-[#e2ded5] bg-white py-12 mt-20 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#4a5553] font-medium">
          <p>© 2026 Parents Health OS. Designed and Engineered by Tharun Gajula.</p>
          <div className="flex items-center space-x-6">
            <Link href="/" className="hover:text-[#0E5E5A] transition-colors">Home Dashboard</Link>
            <a href="https://github.com/tharungajula2/parents-health-os" target="_blank" rel="noopener noreferrer" className="hover:text-[#0E5E5A] transition-colors inline-flex items-center">
              GitHub Repo
              <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
