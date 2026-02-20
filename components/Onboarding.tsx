
import React, { useState } from 'react';
import { Briefcase, Sparkles, Mic, ChevronRight, X } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const Logo = () => (
  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="white" />
      <path d="M7 6H13M10 6V18" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 12C14 12 15 11 17 11C19 11 19 13 18 14C17 15 15 15 15 16C15 17 17 17 18.5 17" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const slides = [
  {
    tag: "Organization",
    title: "Stay organized on your quest.",
    description: "Track all your job applications and offers in one centralized, intelligent dashboard.",
    icon: Briefcase,
    color1: "bg-brand-primary",
    color2: "bg-brand-secondary",
    illustration: (
      <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-blue-100 rounded-full scale-110 opacity-20 animate-pulse" />
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-brand-mint z-10 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
          <div className="space-y-3">
            <div className="h-4 w-32 bg-brand-mint rounded" />
            <div className="h-4 w-24 bg-slate-100 rounded" />
            <div className="h-2 w-full bg-slate-50 rounded" />
            <div className="h-2 w-full bg-slate-50 rounded" />
            <div className="flex justify-between items-center mt-4">
              <div className="h-6 w-16 bg-blue-50 rounded-full border border-blue-100" />
              <div className="h-4 w-4 bg-brand-primary rounded-full" />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 bg-white p-4 rounded-xl shadow-lg border border-brand-mint z-20 transform translate-x-4 -translate-y-4 rotate-6">
          <div className="w-10 h-10 bg-brand-mint rounded-lg flex items-center justify-center">
            <Briefcase className="text-brand-primary" size={24} />
          </div>
        </div>
      </div>
    )
  },
  {
    tag: "AI Strategy",
    title: "Tailor your success with AI.",
    description: "Automatically adapt your resume and generate compelling cover letters for every unique role.",
    icon: Sparkles,
    color1: "bg-indigo-600",
    color2: "bg-brand-primary",
    illustration: (
      <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-indigo-100 rounded-full scale-110 opacity-20 animate-pulse" />
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-indigo-100 z-10 flex flex-col items-center">
          <Sparkles className="text-indigo-600 mb-4 animate-bounce" size={48} />
          <div className="space-y-2 w-full">
            <div className="h-2 w-full bg-indigo-50 rounded" />
            <div className="h-2 w-4/5 bg-indigo-50 rounded" />
            <div className="h-2 w-full bg-indigo-50 rounded" />
          </div>
          <div className="mt-4 px-4 py-2 bg-indigo-600 text-white text-[10px] font-bold rounded-lg shadow-md">
            AUTO-REWRITE
          </div>
        </div>
        <div className="absolute bottom-4 -left-4 bg-white p-3 rounded-xl shadow-lg border border-indigo-50 z-20 transform -rotate-12">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-slate-600 tracking-tight">ATS MATCH 98%</span>
          </div>
        </div>
      </div>
    )
  },
  {
    tag: "Interview Mastery",
    title: "Ace every single interview.",
    description: "Practice with our audio-native AI coach and get real-time feedback on your answers.",
    icon: Mic,
    color1: "bg-brand-deep",
    color2: "bg-indigo-900",
    illustration: (
      <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-slate-200 rounded-full scale-110 opacity-20 animate-pulse" />
        <div className="bg-slate-900 p-6 rounded-3xl shadow-2xl z-10 border border-slate-700 w-48 h-64 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 ring-4 ring-brand-primary/20">
              <Mic className="text-brand-primary animate-pulse" size={32} />
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`w-1 bg-brand-primary rounded-full transition-all duration-300`} style={{ height: `${Math.random() * 20 + 5}px` }} />
              ))}
            </div>
          </div>
          <div className="h-10 w-full bg-slate-800 rounded-xl mt-auto" />
        </div>
        <div className="absolute top-10 -right-8 bg-white p-3 rounded-2xl shadow-xl border border-brand-mint z-20 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-mint rounded-full flex items-center justify-center">
            <Sparkles className="text-brand-primary" size={14} />
          </div>
          <div className="text-[10px] font-medium text-slate-700 italic">"Try emphasizing your..."</div>
        </div>
      </div>
    )
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center z-[100] p-4 font-sans overflow-hidden">
      <div className="bg-white w-full max-w-md max-h-[95vh] sm:max-h-[90vh] rounded-3xl sm:rounded-[48px] shadow-2xl relative flex flex-col overflow-hidden border border-slate-100">

        {/* Top Logo */}
        <div className="p-5 sm:p-8 pb-0 z-20">
          <Logo />
        </div>

        {/* Slanted Visual Elements */}
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none">
          <div className={`absolute top-1/4 -right-1/4 w-[150%] h-32 ${slide.color1} opacity-100 transform -rotate-[12deg] skew-x-[-10deg] transition-all duration-700 ease-in-out`} />
          <div className={`absolute top-1/2 -left-1/4 w-[150%] h-40 ${slide.color2} opacity-40 transform -rotate-[12deg] skew-x-[-10deg] transition-all duration-700 ease-in-out delay-100`} />
        </div>

        {/* Illustration Area */}
        <div className="flex-1 min-h-0 flex items-center justify-center relative z-10">
          {slide.illustration}
        </div>

        {/* Text Content */}
        <div className="p-5 sm:p-10 pt-0 relative z-10 flex flex-col shrink-0">
          <span className="text-slate-400 font-medium text-sm sm:text-lg mb-2 sm:mb-4">{slide.tag}</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-2 sm:mb-4 tracking-tight">
            {slide.title}
          </h2>
          <p className="text-slate-500 text-sm sm:text-lg leading-relaxed mb-4 sm:mb-8">
            {slide.description}
          </p>

          <div className="flex items-center justify-between">
            <button
              onClick={onComplete}
              className="text-slate-400 hover:text-slate-600 font-bold text-base sm:text-lg transition-colors"
            >
              Skip Now
            </button>

            <button
              onClick={handleNext}
              className={`flex items-center gap-2 ${slide.color1} text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl sm:rounded-3xl font-bold text-base sm:text-lg hover:shadow-xl transition-all shadow-lg active:scale-95 group`}
            >
              {isLast ? "Get Started" : "Next"}
              {!isLast && <ChevronRight className="group-hover:translate-x-1 transition-transform" size={24} />}
            </button>
          </div>

          {/* Dots */}
          <div className="flex gap-2 mt-4 sm:mt-8 justify-start">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 transition-all duration-300 rounded-full ${i === currentSlide ? `w-8 ${slide.color1}` : 'w-2 bg-slate-200'}`}
              />
            ))}
          </div>
        </div>

        {/* Exit Button */}
        <button
          onClick={onComplete}
          className="absolute top-5 right-5 sm:top-8 sm:right-8 text-slate-400 hover:text-slate-600 z-30 p-2 hover:bg-slate-50 rounded-full transition-all"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
