import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

const About = () => (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in text-center">
      <div className="mb-12 animate-float">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-violet-200 to-fuchsia-200 dark:from-violet-900 dark:to-fuchsia-900 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(167,139,250,0.5)] mb-6 ring-4 ring-white/50 dark:ring-slate-700/50 backdrop-blur-sm transition-colors">
          <Heart size={64} className="text-white drop-shadow-md fill-white/20" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black mb-4 text-slate-800 dark:text-white tracking-tight transition-colors">Modern Style</h1>
        <p className="text-lg md:text-xl text-violet-600 dark:text-violet-400 tracking-[0.2em] uppercase font-bold text-shadow-sm transition-colors">Exclusively for Her</p>
      </div>
      
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] border border-white/60 dark:border-slate-700 shadow-2xl max-w-2xl mx-auto leading-relaxed space-y-6 relative overflow-hidden group hover:bg-white/80 dark:hover:bg-slate-800/90 transition duration-500">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400"></div>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 transition-colors">
          Welcome to a world where fashion meets fantasy. <strong>Modern Style</strong> is an exclusive sanctuary for women who dare to dream.
        </p>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 transition-colors">
          From elegant Abayas to cozy Hoodies, we curate pieces that celebrate your individuality and grace.
        </p>
        
        <div className="pt-8 border-t border-slate-100 dark:border-slate-700 mt-8 transition-colors">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Founder</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex flex-col items-center gap-2 transition-colors">
            <span>Ahmed Samir</span>
            <span className="text-violet-500 dark:text-violet-400 text-sm md:text-lg font-normal italic flex items-center gap-2 bg-violet-50 dark:bg-violet-900/30 px-4 py-1 rounded-full border border-violet-100 dark:border-violet-800 transition-colors">
                <Sparkles size={14}/> "The Starforger" <Sparkles size={14}/>
            </span>
          </h2>
        </div>
      </div>
    </div>
);

export default About;