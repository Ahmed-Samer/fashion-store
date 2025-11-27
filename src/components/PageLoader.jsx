import React from 'react';
import { Loader2 } from 'lucide-react';

const PageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={48} className="text-violet-600 dark:text-violet-400 animate-spin" />
        <p className="text-slate-400 dark:text-slate-500 text-sm font-bold animate-pulse">Loading style...</p>
      </div>
    </div>
  );
};

export default PageLoader;