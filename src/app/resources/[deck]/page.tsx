import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ArrowLeft, ShieldAlert } from 'lucide-react';
import { getDeckBySlug, DECKS } from '@/lib/resources/decks';
import DeckViewer from '@/components/resources/DeckViewer';

// Generate static parameters during compilation for solid builds
export async function generateStaticParams() {
  return DECKS.map((deck) => ({
    deck: deck.slug,
  }));
}

type Props = {
  params: Promise<{ deck: string }>;
};

export default async function DeckViewerPage({ params }: Props) {
  const { deck: deckSlug } = await params;
  const deck = getDeckBySlug(deckSlug);

  if (!deck) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#122321] selection:bg-[#0E5E5A]/20">
      
      {/* Navigation header */}
      <header className="border-b border-[#e2ded5] bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="font-bold text-md text-[#0E5E5A] hover:text-[#E05E1B] transition-colors font-outfit">
              Parents Health OS
            </Link>
            <span className="text-[#e2ded5]">/</span>
            <Link href="/resources" className="text-sm font-semibold text-[#4a5553] hover:text-[#0E5E5A] transition-colors">
              Library
            </Link>
            <span className="text-[#e2ded5] hidden sm:inline">/</span>
            <span className="text-xs font-mono font-bold text-[#E05E1B] bg-[#E05E1B]/5 px-2.5 py-0.5 rounded-full border border-[#E05E1B]/10 hidden sm:inline uppercase tracking-wide">
              {deck.category}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide bg-[#0E5E5A]/10 text-[#0E5E5A] border border-[#0E5E5A]/20">
              SECURE DECK VIEWER
            </span>
          </div>
        </div>
      </header>

      {/* Main presentation zone */}
      <main className="max-w-7xl mx-auto px-6 py-8 md:py-12 space-y-8">
        
        {/* Title Details Area */}
        <div className="space-y-3 pb-6 border-b border-[#e2ded5]">
          <div className="flex items-center space-x-2 text-[#E05E1B]">
            <BookOpen className="w-5 h-5 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Presenting Asset</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#122321] tracking-tight leading-tight">
            {deck.title}
          </h1>

          <p className="editorial-text text-sm md:text-base text-[#4a5553] max-w-4xl leading-relaxed">
            {deck.description}
          </p>
        </div>

        {/* The Slide Canvas Viewer Frame Component */}
        <DeckViewer deck={deck} />

      </main>

      {/* Footer disclaimer summary */}
      <footer className="bg-white border-t border-[#e2ded5] py-8 text-center mt-20 text-xs text-[#4a5553]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-medium">
          <p>© 2026 Parents Health OS. Curated and Designed for remote Indian family care.</p>
          <Link href="/resources" className="hover:text-[#0E5E5A] hover:underline transition-colors flex items-center">
            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-[#E05E1B]" />
            Return to Main Resource Deck Index
          </Link>
        </div>
      </footer>

    </div>
  );
}
