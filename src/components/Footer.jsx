import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-white/80 backdrop-blur-xl border-t border-white/40 py-12 text-center relative z-10 mt-auto">
    <div className="max-w-4xl mx-auto px-4 flex flex-col items-center">
      
      {/* Logo */}
      <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mb-6 shadow-lg">M</div>
      
      <h3 className="text-xl font-bold text-slate-800 mb-2">Modern Style</h3>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">Exclusively for Her. Elevating fashion standards, one outfit at a time.</p>
      
      {/* Links Section (الروابط المهمة) */}
      <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm font-bold text-slate-600">
        <Link to="/" className="hover:text-violet-600 transition">Home</Link>
        <Link to="/about" className="hover:text-violet-600 transition">About</Link>
        <Link to="/contact" className="hover:text-violet-600 transition">Contact</Link>
        {/* الرابط الجديد هنا 👇 */}
        <Link to="/track-order" className="hover:text-violet-600 transition text-violet-500 flex items-center gap-1">
            Track Order 📦
        </Link>
        <Link to="/returns" className="hover:text-violet-600 transition">Returns</Link>
      </div>

      {/* Copyright */}
      <p className="text-slate-400 text-xs">
        © 2025 Modern Style. Designed by Ahmed Samir "The Starforger" ✨
      </p>
    </div>
  </footer>
);

export default Footer;