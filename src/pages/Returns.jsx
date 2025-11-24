import React from 'react';
import { RotateCcw } from 'lucide-react';

const Returns = () => (
    <div className="max-w-3xl mx-auto px-4 py-16 animate-fade-in" dir="rtl">
      <div className="bg-white/80 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] border border-white/60 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-violet-100/50 rounded-full blur-3xl group-hover:bg-violet-200/50 transition duration-1000"></div>
        <h2 className="text-2xl md:text-3xl font-black mb-10 text-slate-800 flex items-center gap-3 relative z-10"><RotateCcw size={36} className="text-violet-500" /> سياسة الاسترجاع</h2>
        <div className="space-y-6 relative z-10 text-slate-600 leading-relaxed text-sm md:text-base">
           <div className="bg-white/60 p-4 md:p-6 rounded-2xl border border-slate-100 hover:border-violet-200 hover:shadow-lg transition duration-300">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2 flex items-center gap-2"><div className="w-2 h-8 bg-violet-400 rounded-full"></div> 1. المهلة الزمنية</h3>
            <p>يمكنك طلب استرجاع المنتج خلال <span className="text-violet-600 font-bold bg-violet-50 px-2 py-0.5 rounded-md">14 يوم</span> من تاريخ الاستلام.</p>
          </div>
          <div className="bg-white/60 p-4 md:p-6 rounded-2xl border border-slate-100 hover:border-violet-200 hover:shadow-lg transition duration-300">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2 flex items-center gap-2"><div className="w-2 h-8 bg-fuchsia-400 rounded-full"></div> 2. حالة المنتج</h3>
            <p>يجب أن يكون المنتج بحالته الأصلية، غير مستخدم، مع وجود جميع العلامات (Tags) والغلاف الأصلي.</p>
          </div>
          <div className="bg-white/60 p-4 md:p-6 rounded-2xl border border-slate-100 hover:border-violet-200 hover:shadow-lg transition duration-300">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2 flex items-center gap-2"><div className="w-2 h-8 bg-sky-400 rounded-full"></div> 3. طريقة الاسترجاع</h3>
            <p>تواصل معنا عبر صفحة "Contact" أو اطلب من المساعد الذكي (AI Stylist) بدأ عملية الاسترجاع.</p>
          </div>
        </div>
      </div>
    </div>
);

export default Returns;