import React, { useState } from 'react';
import { HelpCircle, Info, BookOpen, X, Search, Sparkles, CheckCircle2 } from 'lucide-react';
import { GLOSSARY, GlossaryTerm } from '../lib/glossary';

interface TermInfoButtonProps {
  termId: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
  onSelectTerm?: (termId: string) => void;
}

export const TermInfoButton: React.FC<TermInfoButtonProps> = ({
  termId,
  className = '',
  size = 'xs',
  onSelectTerm
}) => {
  const term = GLOSSARY[termId];
  if (!term) return null;

  const sizeClasses = {
    xs: 'w-3.5 h-3.5 p-0.5',
    sm: 'w-4 h-4 p-0.5',
    md: 'w-5 h-5 p-1'
  }[size];

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (onSelectTerm) {
          onSelectTerm(termId);
        } else {
          // Trigger a global custom event so any active modal listener picks it up
          window.dispatchEvent(new CustomEvent('open-term-explainer', { detail: { termId } }));
        }
      }}
      className={`inline-flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-colors ${sizeClasses} ${className}`}
      title={`Explain "${term.title}"`}
      aria-label={`About ${term.title}`}
    >
      <HelpCircle className="w-full h-full" />
    </button>
  );
};

interface TermExplainerModalProps {
  termId: string | null;
  onClose: () => void;
}

export const TermExplainerModal: React.FC<TermExplainerModalProps> = ({
  termId,
  onClose
}) => {
  if (!termId) return null;
  const term = GLOSSARY[termId];
  if (!term) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 inline-block mb-1">
                {term.category}
              </span>
              <h3 className="text-base font-bold text-white leading-snug">{term.title}</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Concise Short Definition (<100 words) */}
        <div className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <p>{term.shortDefinition}</p>
        </div>

        {/* Why it Matters */}
        {term.whyItMatters && (
          <div className="text-xs text-emerald-300/90 font-sans flex items-start gap-2 bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-300 block font-medium">Why this matters:</strong>
              <span>{term.whyItMatters}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 italic">Easy Explainer Guide</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const termsList = Object.values(GLOSSARY);
  const categories = ['ALL', 'Screening', 'Optimization', 'Metrics', 'Infrastructure', 'Strategy'];

  const filteredTerms = termsList.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.shortDefinition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Beginner-Friendly Terms & Definitions
              </h2>
              <p className="text-xs text-slate-400">
                Simple, plain-English explanations for all metrics, rules, and strategies
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter / Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search any term or concept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full"
            />
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[60vh]">
          {filteredTerms.length === 0 ? (
            <p className="text-center text-slate-500 text-xs py-8">
              No matching terms found. Try a different search keyword.
            </p>
          ) : (
            filteredTerms.map(term => (
              <div 
                key={term.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{term.title}</span>
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {term.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {term.shortDefinition}
                </p>
                {term.whyItMatters && (
                  <p className="text-[11px] text-emerald-400/90 font-sans pt-1">
                    <strong>Why it matters:</strong> {term.whyItMatters}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
