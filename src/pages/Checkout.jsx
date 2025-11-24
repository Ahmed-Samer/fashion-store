import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, TicketPercent } from 'lucide-react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db, getAppId } from '../firebase'; // استدعاء Firebase

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
        e.preventDefault(); if(!user) { showNotification('Please Login First', 'error'); return; }
        setSubmitting(true);
        const orderData = { 
            customer: form, 
            items: cart, 
            total: finalTotal, 
            originalTotal: subtotal,
            discountApplied: appliedDiscount,
            status: 'Pending', 
            createdAt: new Date().toISOString(), 
            userId: user.uid 
        };
        try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), orderData); 
            setCart([]); 
            showNotification('Order Placed Successfully! 🚀'); 
            navigate('/'); 
        } catch(e) {
            showNotification('Error placing order', 'error');
        }
        setSubmitting(false); 
    };

    return (
      <div className="max-w-3xl mx-auto px-4 py-16 animate-fade-in">
        <button onClick={() => navigate('/cart')} className="text-slate-400 hover:text-violet-600 mb-8 flex gap-2 font-bold items-center"><ArrowRight className="rotate-180" size={18}/> Back to Cart</button>
        <div className="bg-white/80 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] border border-white/60 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-black mb-8 flex items-center gap-3 text-slate-800"><Truck className="text-violet-500"/> Shipping Details</h2>
          <form onSubmit={submit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div><label className="text-sm font-bold text-slate-500 block mb-2 ml-1">Full Name</label><input required className="w-full p-3 md:p-4 bg-white/60 border border-slate-200 rounded-xl outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe"/></div>
              <div><label className="text-sm font-bold text-slate-500 block mb-2 ml-1">Phone Number</label><input required className="w-full p-3 md:p-4 bg-white/60 border border-slate-200 rounded-xl outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="01xxxxxxxxx"/></div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div><label className="text-sm font-bold text-slate-500 block mb-2 ml-1">Governorate</label><select className="w-full p-3 md:p-4 bg-white/60 border border-slate-200 rounded-xl outline-none" value={form.governorate} onChange={e => setForm({...form, governorate: e.target.value})}>{governorates.map(g => <option key={g}>{g}</option>)}</select></div>
              <div><label className="text-sm font-bold text-slate-500 block mb-2 ml-1">Address Details</label><input required className="w-full p-3 md:p-4 bg-white/60 border border-slate-200 rounded-xl outline-none" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Street, Building No..."/></div>
            </div>
            
            {/* Promo Code Section */}
            <div className="bg-violet-50 p-4 md:p-6 rounded-2xl border border-violet-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full relative">
                    <input type="text" className="w-full p-3 pl-10 bg-white border border-violet-200 rounded-xl outline-none uppercase font-bold text-violet-700 tracking-wider placeholder:normal-case placeholder:font-normal" value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="Have a promo code?" />
                    <TicketPercent size={18} className="absolute left-3 top-3.5 text-violet-400"/>
                </div>
                <button type="button" onClick={applyPromoCode} className="bg-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-violet-700 transition shadow-sm w-full md:w-auto">Apply</button>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-3">
                <div className="flex justify-between text-slate-500 text-sm"><span>Subtotal</span><span>{subtotal} EGP</span></div>
                {appliedDiscount && (
                    <div className="flex justify-between text-green-600 font-bold text-sm">
                        <span>Discount ({appliedDiscount.code})</span>
                        <span>-{appliedDiscount.amount}%</span>
                    </div>
                )}
                <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-800 font-bold">Total Amount</span>
                    <span className="text-3xl font-black text-slate-900">{finalTotal.toFixed(0)} <span className="text-sm text-slate-400 font-medium">EGP</span></span>
                </div>
            </div>

            <button disabled={submitting} className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-violet-200 hover:shadow-2xl transition transform active:scale-[0.98]">{submitting ? 'Processing...' : 'Confirm Order'}</button>
          </form>
        </div>
      </div>
    );
};

export default Checkout;