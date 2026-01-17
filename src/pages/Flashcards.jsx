import React, { useState, useEffect } from 'react';
import { UserAuth } from '../context/AuthContext';
import { getDueFlashcards, updateFlashcardReview } from '../lib/db';
import { Layers, RotateCw, CheckCircle2, XCircle, BrainCircuit } from 'lucide-react';

const Flashcards = () => {
  const { user } = UserAuth();
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Load Cards
  useEffect(() => {
    if (!user) return;
    const fetchCards = async () => {
      const dueCards = await getDueFlashcards(user.uid);
      // Shuffle them for better study
      setCards(dueCards.sort(() => Math.random() - 0.5));
      setLoading(false);
    };
    fetchCards();
  }, [user]);

  const handleRate = async (quality) => {
    // quality: 1 (Forgot/Hard) to 5 (Perfect)
    if (!cards[currentIndex]) return;

    // Update DB
    await updateFlashcardReview(cards[currentIndex].id, quality);

    // Move to next card
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionComplete(true);
    }
  };

  if (loading) return <div className="p-10 text-slate-500 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div>;

  if (sessionComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <div className="h-20 w-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-bold text-slate-100 mb-2">All Caught Up!</h2>
        <p className="text-slate-400 mb-8 max-w-md">You've reviewed all your due flashcards for today. Great job keeping your streak alive.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors font-bold">
          Check for more
        </button>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <div className="h-20 w-20 bg-indigo-500/20 text-indigo-500 rounded-full flex items-center justify-center mb-6">
          <Layers size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">No cards due today</h2>
        <p className="text-slate-400 mb-6">Go to your courses and highlight some text to create new flashcards!</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <BrainCircuit className="text-indigo-500"/> Review Session
        </h1>
        <span className="text-sm font-mono text-slate-500">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* FLASHCARD AREA */}
      <div className="flex-1 perspective-1000 relative group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`relative w-full h-full duration-500 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
          
          {/* FRONT (Question) */}
          <div className="absolute inset-0 backface-hidden bg-slate-900 border border-slate-700 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-2xl">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-6">Question</span>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-100 leading-relaxed">
              {currentCard.front}
            </h3>
            <p className="mt-8 text-sm text-slate-500 animate-pulse">(Click to flip)</p>
          </div>

          {/* BACK (Answer) */}
          <div className="absolute inset-0 backface-hidden bg-slate-800 border border-slate-600 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-2xl" style={{ transform: 'rotateY(180deg)' }}>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-6">Answer</span>
            <p className="text-lg md:text-xl text-slate-200 leading-relaxed whitespace-pre-wrap">
              {currentCard.back}
            </p>
          </div>
        </div>
      </div>

      {/* CONTROLS (Only show when flipped) */}
      <div className={`mt-8 grid grid-cols-4 gap-4 transition-opacity duration-300 ${isFlipped ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button onClick={() => handleRate(1)} className="py-4 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold hover:bg-rose-500 hover:text-white transition-all flex flex-col items-center gap-1">
          <XCircle size={20} /> Again
        </button>
        <button onClick={() => handleRate(3)} className="py-4 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold hover:bg-amber-500 hover:text-white transition-all flex flex-col items-center gap-1">
          <RotateCw size={20} /> Hard
        </button>
        <button onClick={() => handleRate(4)} className="py-4 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold hover:bg-blue-500 hover:text-white transition-all flex flex-col items-center gap-1">
          <CheckCircle2 size={20} /> Good
        </button>
        <button onClick={() => handleRate(5)} className="py-4 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold hover:bg-emerald-500 hover:text-white transition-all flex flex-col items-center gap-1">
          <Layers size={20} /> Easy
        </button>
      </div>
    </div>
  );
};

export default Flashcards;