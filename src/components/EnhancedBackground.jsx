import React from 'react';

const EnhancedBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500">
    
    {/* 1. Base Gradient: نهار (فاتح) / ليل (غامق جداً) */}
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950 animate-gradient-slow background-size-200 transition-colors duration-500"></div>
    
    {/* 2. Floating Blobs (الأشكال العايمة) */}
    {/* بنغير الـ Blend Mode في الليل عشان الألوان تنور (Glow) بدل ما تغمق */}
    
    <div className="absolute top-[-10%] left-[-10%] w-[50vh] h-[50vh] bg-purple-300/20 dark:bg-violet-600/20 rounded-full blur-[80px] animate-float-slow mix-blend-multiply dark:mix-blend-screen transition-colors duration-500"></div>
    
    <div className="absolute bottom-[10%] right-[-5%] w-[60vh] h-[60vh] bg-sky-300/20 dark:bg-indigo-600/10 rounded-full blur-[100px] animate-float-medium mix-blend-multiply dark:mix-blend-screen delay-1000 transition-colors duration-500"></div>
    
    <div className="absolute top-[40%] left-[30%] w-[40vh] h-[40vh] bg-pink-300/20 dark:bg-fuchsia-900/20 rounded-full blur-[60px] animate-float-fast mix-blend-multiply dark:mix-blend-screen delay-2000 transition-colors duration-500"></div>
    
    {/* 3. Noise Overlay (Texture) */}
    <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.2] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")` }}></div>
    
    <style>{`
      @keyframes gradient-slow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      .background-size-200 { background-size: 200% 200%; }
      .animate-gradient-slow { animation: gradient-slow 20s ease infinite; }
      @keyframes float-slow { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(50px, 30px) scale(1.1); } }
      @keyframes float-medium { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-30px, -20px) scale(0.9); } }
      @keyframes float-fast { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(20px, -40px) scale(1.05); } }
      .animate-float-slow { animation: float-slow 25s infinite ease-in-out; }
      .animate-float-medium { animation: float-medium 20s infinite ease-in-out; }
      .animate-float-fast { animation: float-fast 15s infinite ease-in-out; }
    `}</style>
  </div>
);

export default EnhancedBackground;