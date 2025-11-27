import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ghost, Home } from 'lucide-react';
import SEO from '../components/SEO';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center animate-fade-in">
      <SEO title="Page Not Found" />
      <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-full mb-6 animate-bounce-subtle transition-colors">
        <Ghost size={64} className="text-slate-400 dark:text-slate-500" />
      </div>
      <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2 transition-colors">404</h1>
      <h2 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-8 transition-colors">Page Not Found</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        Oops! The page you are looking for might have been removed or doesn't exist.
      </p>
      <button 
        onClick={() => navigate('/')} 
        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition shadow-lg"
      >
        <Home size={20}/> Back Home
      </button>
    </div>
  );
};

export default NotFound;