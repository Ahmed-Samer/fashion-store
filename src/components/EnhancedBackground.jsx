import React from 'react';

const EnhancedBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
    
    {/* 1. Static Gradient Base (خفيفة جداً على المعالج) */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-slate-50 to-slate-50 dark:from-indigo-950/40 dark:via-slate-950 dark:to-slate-950 transition-colors duration-500"></div>
    
    {/* 2. Simplified Blobs (بدون حركة معقدة وبدون blend-mode تقيل) */}
    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-200/30 dark:bg-violet-900/20 rounded-full blur-3xl opacity-50 animate-pulse-slow"></div>
    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-200/30 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 animate-pulse-slow delay-1000"></div>
    
    {/* 3. Subtle Texture (اختياري - خفيف جداً) */}
    <div className="absolute inset-0 opacity-[0.2] dark:opacity-[0.1] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>

    <style>{`
      @keyframes pulse-slow {
        0%, 100% { opacity: 0.4; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.05); }
      }
      .animate-pulse-slow {
        animation: pulse-slow 8s infinite ease-in-out;
      }
    `}</style>
  </div>
);

export default EnhancedBackground;