import React from 'react';
import { SectionId } from '../types';

const Hero: React.FC = () => {
  const scrollToProjects = () => {
    const element = document.getElementById(SectionId.PROJECTS);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id={SectionId.HERO} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-neutral-950">
      {/* Ambient Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-blue-900/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      <div className="relative z-10 max-w-3xl px-6 text-center">
        <div className="inline-block mb-6 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/50 backdrop-blur-md">
          <span className="text-xs font-medium text-neutral-400 tracking-wide uppercase">AI Experiments</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-8 animate-fade-in-up">
          Co-authored with Silicon.
        </h1>
        
        <p className="text-lg md:text-xl text-neutral-400 leading-relaxed mb-10 max-w-xl mx-auto opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
          A digital playground for games, utilities, and raw ideas. This is where I test the limits of what's possible with AI.
        </p>

        <button 
          onClick={scrollToProjects}
          className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-medium transition-all hover:bg-neutral-200 focus:ring-2 focus:ring-white/20 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]"
        >
          Explore the Lab
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-y-1">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-[fadeInUp_1s_ease-out_1s_forwards]">
        <div className="w-[1px] h-12 bg-gradient-to-b from-neutral-800 to-transparent mx-auto"></div>
      </div>
    </section>
  );
};

export default Hero;