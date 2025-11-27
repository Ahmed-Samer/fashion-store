import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, TicketPercent } from 'lucide-react';
import { collection, query, where, getDocs, writeBatch, doc, increment, setDoc, getDoc } from 'firebase/firestore'; // 1. ضفنا getDoc
import { db, getAppId } from '../firebase';
import SEO from '../components/SEO';

const governorates = ["Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira", "Fayoum", "Gharbia", "Ismailia", "Monufia", "Minya", "Qalyubia", "New Valley", "Suez", "Aswan", "Assiut", "Beni Suef", "Port Said", "Damietta", "Sharqia", "South Sinai", "Kafr El Sheikh", "Matruh", "Luxor", "Qena", "North Sinai", "Sohag"];

const Checkout = ({ user, cart, calculateTotal, setCart, showNotification }) => {
    const navigate = useNavigate();
    const appId = getAppId();
    const [form, setForm] = useState({ name: '', phone: '', address: '', governorate: 'Cairo' });
    const [promoCode, setPromoCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null); 
    const [submitting, setSubmitting] = useState(false);
    
    const subtotal = calculateTotal();
    const finalTotal = appliedDiscount ? subtotal - (subtotal * appliedDiscount.amount / 100) : subtotal;

    // 2. السحر هنا: جلب بيانات المستخدم المسجلة مسبقاً
    useEffect(() => {
        if (user && !user.isAnonymous) {
            const fetchProfile = async () => {
                try {
                    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', user.uid);
                    const docSnap = await getDoc(docRef);
                    
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setForm(prev => ({
                            ...prev,
                            name: data.fullName || '',
                            phone: data.phone || '',
                            address: data.address || '',
                            governorate: data.governorate || 'Cairo'
                        }));
                        showNotification('Details auto-filled! ✨');
                    }
                } catch (e) {
                    console.error("Auto-fill error", e);
                }
            };
            fetchProfile();
        }
    }, [user, appId]);

    const applyPromoCode = async () => {
        if(!promoCode) return;
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'promo_codes'), where('code', '==', promoCode.toUpperCase().trim()));
        const snapshot = await getDocs(q);
        if(!snapshot.empty) {
            const promo = snapshot.docs[0].data();
            setAppliedDiscount({ code: promo.code, amount: promo.discount });
            showNotification(`Code Applied! ${promo.discount}% OFF 🎉`);
        } else {
            showNotification('Invalid Promo Code ❌', 'error');
            setAppliedDiscount(null);
        }
    };

    const submit = async (e) => { 
        e.preventDefault(); 
        if (form.phone.length < 11) { showNotification('رقم هاتف غير صحيح', 'error'); return; }

        setSubmitting(true);
        
        const orderNum = Math.floor(100000 + Math.random() * 900000).toString();
        const displayId = '#' + orderNum;

        const orderData = { 
            orderId: displayId, 
            customer: form,   
            items: cart, 
            total: finalTotal, 
            originalTotal: subtotal,
            discountApplied: appliedDiscount,
            status: 'Pending', 
            createdAt: new Date().toISOString(), 
            userId: user ? user.uid : 'guest' 
        };

        try {
            const batch = writeBatch(db);
            const newOrderRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderNum);
            batch.set(newOrderRef, orderData);

            cart.forEach(item => {
                const productRef = doc(db, 'artifacts', appId, 'public', 'data', 'products', item.id);
                batch.update(productRef, { stock: increment(-item.quantity) });
            });

            await batch.commit();

            setCart([]); 
            navigate('/thank-you', { state: { orderId: displayId } });
            
        } catch(e) {
            showNotification('حدث خطأ أثناء الطلب', 'error');
            console.error(e);
        }
        setSubmitting(false); 
    };

    return (
      <div className="max-w-3xl mx-auto px-4 py-16 animate-fade-in">
        <SEO title="Checkout" />
        <button onClick={() => navigate('/cart')} className="text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 mb-8 flex gap-2 font-bold items-center transition-colors"><ArrowRight className="rotate-180" size={18}/> Back to Cart</button>
        
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] border border-white/60 dark:border-slate-700 shadow-2xl transition-colors">
          <h2 className="text-2xl md:text-3xl font-black mb-8 flex items-center gap-3 text-slate-800 dark:text-white"><Truck className="text-violet-500"/> بيانات التوصيل</h2>
          
          <form onSubmit={submit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                  <label className="text-sm font-bold text-slate-500 dark:text-slate-400 block mb-2 ml-1">الاسم بالكامل</label>
                  <input required className="w-full p-3 md:p-4 bg-white/60 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none dark:text-white placeholder:text-slate-400 transition-colors" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="الاسم ثلاثي"/>
              </div>
              <div>
                  <label className="text-sm font-bold text-slate-500 dark:text-slate-400 block mb-2 ml-1">رقم الموبايل (واتساب)</label>
                  <input required type="tel" className="w-full p-3 md:p-4 bg-white/60 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none dark:text-white placeholder:text-slate-400 transition-colors" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="01xxxxxxxxx"/>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                  <label className="text-sm font-bold text-slate-500 dark:text-slate-400 block mb-2 ml-1">المحافظة</label>
                  <select className="w-full p-3 md:p-4 bg-white/60 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none dark:text-white transition-colors" value={form.governorate} onChange={e => setForm({...form, governorate: e.target.value})}>
                      {governorates.map(g => <option key={g}>{g}</option>)}
                  </select>
              </div>
              <div>
                  <label className="text-sm font-bold text-slate-500 dark:text-slate-400 block mb-2 ml-1">العنوان بالتفصيل</label>
                  <input required className="w-full p-3 md:p-4 bg-white/60 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none dark:text-white placeholder:text-slate-400 transition-colors" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="اسم الشارع، رقم العمارة..."/>
              </div>
            </div>

            <div className="bg-violet-50 dark:bg-violet-900/20 p-4 md:p-6 rounded-2xl border border-violet-100 dark:border-violet-800 flex flex-col md:flex-row gap-4 items-center transition-colors">
                <div className="flex-1 w-full relative">
                    <input type="text" className="w-full p-3 pl-10 bg-white dark:bg-slate-700 border border-violet-200 dark:border-violet-700 rounded-xl outline-none uppercase font-bold text-violet-700 dark:text-violet-300 tracking-wider placeholder:normal-case placeholder:font-normal placeholder:text-slate-400" value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="كود الخصم" />
                    <TicketPercent size={18} className="absolute left-3 top-3.5 text-violet-400"/>
                </div>
                <button type="button" onClick={applyPromoCode} className="bg-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-violet-700 transition shadow-sm w-full md:w-auto">تفعيل</button>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-3 transition-colors">
                <div className="flex justify-between text-slate-500 dark:text-slate-400 text-sm"><span>المجموع الفرعي</span><span>{subtotal} EGP</span></div>
                {appliedDiscount && (<div className="flex justify-between text-green-600 dark:text-green-400 font-bold text-sm"><span>خصم ({appliedDiscount.code})</span><span>-{appliedDiscount.amount}%</span></div>)}
                <div className="flex justify-between items-center pt-2"><span className="text-slate-800 dark:text-white font-bold">الإجمالي</span><span className="text-3xl font-black text-slate-900 dark:text-white">{finalTotal.toFixed(0)} <span className="text-sm text-slate-400 font-medium">EGP</span></span></div>
            </div>
            
            <button disabled={submitting} className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-500 dark:to-fuchsia-500 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-violet-200 dark:shadow-none hover:shadow-2xl transition transform active:scale-[0.98]">
                {submitting ? 'جاري الطلب...' : 'تأكيد الطلب 🚀'}
            </button>
          </form>
        </div>
      </div>
    );
};

export default Checkout;