import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import SEO from '../components/SEO';

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = location.state || { orderId: '#000000' };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-fade-in text-center">
      <SEO title="Order Confirmed" />
      
      <div className="bg-green-100 dark:bg-green-900/20 p-6 rounded-full mb-6 animate-bounce-subtle transition-colors">
        <CheckCircle size={64} className="text-green-600 dark:text-green-400" />
      </div>
      
      <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-4 transition-colors">شكراً لطلبك! 🎉</h1>
      <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-md transition-colors">
        تم استلام طلبك بنجاح. سيقوم فريق المبيعات بالتواصل معك عبر الواتساب لتأكيد التفاصيل والشحن.
      </p>
      
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-8 w-full max-w-sm transition-colors">
        <p className="text-sm text-slate-400 font-bold uppercase mb-1">رقم الأوردر</p>
        <p className="text-3xl font-black text-violet-600 dark:text-violet-400 tracking-wider">{orderId}</p>
      </div>

      <button 
        onClick={() => navigate('/')} 
        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition shadow-lg hover:shadow-xl"
      >
        <Home size={20}/> العودة للرئيسية
      </button>
    </div>
  );
};

export default ThankYou;