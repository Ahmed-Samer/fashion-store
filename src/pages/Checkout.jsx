import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, TicketPercent, Wallet, Banknote, Upload, Loader2, CheckCircle } from 'lucide-react';
import { collection, query, where, getDocs, writeBatch, doc, increment, getDoc } from 'firebase/firestore';
import { db, getAppId } from '../firebase';
import SEO from '../components/SEO';

const governorates = ["Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira", "Fayoum", "Gharbia", "Ismailia", "Monufia", "Minya", "Qalyubia", "New Valley", "Suez", "Aswan", "Assiut", "Beni Suef", "Port Said", "Damietta", "Sharqia", "South Sinai", "Kafr El Sheikh", "Matruh", "Luxor", "Qena", "North Sinai", "Sohag"];

// ⚠️ عدل هنا رقم محفظتك الحقيقي
const PAYMENT_INFO = {
    number: "201226399207", 
    name: "Modern Style Store", 
    type: "Mobile Wallet (Vodafone Cash / Any Wallet)" 
};

const Checkout = ({ user, cart, calculateTotal, setCart, showNotification }) => {
    const navigate = useNavigate();
    const appId = getAppId();
    
    // Form States
    const [form, setForm] = useState({ name: '', phone: '', address: '', governorate: 'Cairo' });
    const [promoCode, setPromoCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null); 
    const [submitting, setSubmitting] = useState(false);

    // Payment States
    const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' (Cash) or 'wallet'
    const [receiptUrl, setReceiptUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    
    const subtotal = calculateTotal();
    const finalTotal = appliedDiscount ? subtotal - (subtotal * appliedDiscount.amount / 100) : subtotal;

    // Auto-fill user data
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
                } catch (e) { console.error(e); }
            };
            fetchProfile();
        }
    }, [user, appId]);

    // Handle Image Upload to ImgBB
    const handleReceiptUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            if (data.success) {
                setReceiptUrl(data.data.url);
                showNotification('Receipt uploaded successfully! 🧾');
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            showNotification('Failed to upload receipt', 'error');
        }
        setIsUploading(false);
    };

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
        
        // Validation
        if (form.phone.length < 11) { showNotification('رقم هاتف غير صحيح', 'error'); return; }
        if (paymentMethod === 'wallet' && !receiptUrl) { showNotification('Please upload the payment receipt first ⚠️', 'error'); return; }

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
            payment: {
                method: paymentMethod, 
                receiptUrl: receiptUrl || null,
                status: paymentMethod === 'wallet' ? 'Reviewing' : 'Unpaid'
            },
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
      <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
        <SEO title="Checkout" />
        <button onClick={() => navigate('/cart')} className="text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 mb-8 flex gap-2 font-bold items-center transition-colors"><ArrowRight className="rotate-180" size={18}/> Back to Cart</button>
        
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Right Column: Order Form */}
            <div className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-white/60 dark:border-slate-700 shadow-2xl transition-colors">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800 dark:text-white"><Truck className="text-violet-500"/> Shipping Info</h2>
                
                <form id="checkout-form" onSubmit={submit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-bold text-slate-500 dark:text-slate-400 block mb-2 ml-1">Full Name</label>
                        <input required className="w-full p-3 bg-white/60 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none dark:text-white placeholder:text-slate-400 transition-colors" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full Name"/>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-500 dark:text-slate-400 block mb-2 ml-1">Phone (WhatsApp)</label>
                        <input required type="tel" className="w-full p-3 bg-white/60 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none dark:text-white placeholder:text-slate-400 transition-colors" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="201226399207"/>
                    </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-bold text-slate-500 dark:text-slate-400 block mb-2 ml-1">Governorate</label>
                        <select className="w-full p-3 bg-white/60 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none dark:text-white transition-colors" value={form.governorate} onChange={e => setForm({...form, governorate: e.target.value})}>
                            {governorates.map(g => <option key={g}>{g}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-500 dark:text-slate-400 block mb-2 ml-1">Detailed Address</label>
                        <input required className="w-full p-3 bg-white/60 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none dark:text-white placeholder:text-slate-400 transition-colors" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Street, Building No..."/>
                    </div>
                    </div>

                    <div className="h-px bg-slate-200 dark:bg-slate-700 my-6"></div>

                    {/* Payment Method Section */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Payment Method</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div 
                                onClick={() => setPaymentMethod('cod')}
                                className={`cursor-pointer p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'cod' ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                            >
                                <Banknote size={24} className={paymentMethod === 'cod' ? 'text-violet-600' : 'text-slate-400'} />
                                <span className={`font-bold text-sm ${paymentMethod === 'cod' ? 'text-violet-700 dark:text-white' : 'text-slate-500'}`}>Cash on Delivery</span>
                            </div>
                            <div 
                                onClick={() => setPaymentMethod('wallet')}
                                className={`cursor-pointer p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'wallet' ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                            >
                                <Wallet size={24} className={paymentMethod === 'wallet' ? 'text-violet-600' : 'text-slate-400'} />
                                <span className={`font-bold text-sm ${paymentMethod === 'wallet' ? 'text-violet-700 dark:text-white' : 'text-slate-500'}`}>Wallet / InstaPay</span>
                            </div>
                        </div>

                        {/* Wallet / InstaPay Details & Upload */}
                        {paymentMethod === 'wallet' && (
                            <div className="mt-6 bg-slate-50 dark:bg-slate-700/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-600 animate-fade-in">
                                <div className="mb-4">
                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">
                                        Transfer Total Amount to Wallet:
                                    </p>
                                    <p className="text-xs text-slate-400 mb-3">
                                        Accepts transfers from <span className="text-violet-600 font-bold">InstaPay</span>, Vodafone Cash, or any Bank Wallet.
                                    </p>
                                    
                                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-600 mb-2">
                                        <div>
                                            <p className="font-black text-2xl text-slate-800 dark:text-white tracking-widest">{PAYMENT_INFO.number}</p>
                                            <p className="text-xs text-slate-500 font-bold mt-1">Orange Cash / Wallet</p>
                                        </div>
                                        <button type="button" onClick={() => {navigator.clipboard.writeText(PAYMENT_INFO.number); showNotification("Number Copied! 📋")}} className="text-xs font-bold text-violet-600 bg-violet-100 px-4 py-2 rounded-lg hover:bg-violet-200 transition">
                                            Copy
                                        </button>
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                        * From InstaPay app: Select "Send to Mobile Number / Electronic Wallet".
                                    </div>
                                </div>

                                <div className="space-y-2 border-t border-slate-200 dark:border-slate-600 pt-4">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                        Upload Receipt <span className="text-red-500">*</span>
                                    </label>
                                    <label className="cursor-pointer w-full p-4 border-2 border-dashed border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-violet-100 dark:hover:bg-violet-900/20 transition group">
                                        {isUploading ? <Loader2 className="animate-spin text-violet-600"/> : receiptUrl ? <CheckCircle className="text-green-500 group-hover:scale-110 transition" size={32}/> : <Upload className="text-violet-400 group-hover:scale-110 transition"/>}
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{isUploading ? "Uploading..." : receiptUrl ? "Receipt Received ✅" : "Click to upload Screenshot"}</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleReceiptUpload} disabled={isUploading || receiptUrl} />
                                    </label>
                                    {receiptUrl && <p className="text-center text-xs text-green-600 font-bold mt-1">Image saved! You can place order now.</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </div>

            {/* Left Column: Summary */}
            <div className="lg:col-span-1">
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur p-6 rounded-[2rem] border border-white dark:border-slate-700 shadow-xl h-fit sticky top-24 transition-colors">
                    <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">Order Summary</h3>
                    
                    <div className="bg-violet-50 dark:bg-violet-900/20 p-4 rounded-2xl border border-violet-100 dark:border-violet-800 flex flex-col gap-3 mb-6 transition-colors">
                        <div className="relative">
                            <input type="text" className="w-full p-3 pr-10 bg-white dark:bg-slate-700 border border-violet-200 dark:border-violet-700 rounded-xl outline-none uppercase font-bold text-violet-700 dark:text-violet-300 text-sm placeholder:text-slate-400" value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="Promo Code" />
                            <TicketPercent size={16} className="absolute right-3 top-3.5 text-violet-400"/>
                        </div>
                        <button type="button" onClick={applyPromoCode} className="bg-violet-600 text-white py-2 rounded-xl font-bold text-sm hover:bg-violet-700 transition">Apply Code</button>
                    </div>

                    <div className="space-y-3 mb-6 border-t border-slate-100 dark:border-slate-700 pt-4">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400 text-sm"><span>Subtotal</span><span>{subtotal} EGP</span></div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400 text-sm"><span>Shipping</span><span className="text-green-600 font-bold">Free</span></div>
                        {appliedDiscount && (<div className="flex justify-between text-green-600 font-bold text-sm"><span>Discount</span><span>-{appliedDiscount.amount}%</span></div>)}
                    </div>
                    
                    <div className="flex justify-between mb-8 text-2xl font-black text-slate-800 dark:text-white border-t border-slate-100 dark:border-slate-700 pt-4"><span>Total</span><span>{finalTotal.toFixed(0)} <span className="text-sm text-slate-400 font-medium">EGP</span></span></div>
                    
                    <button form="checkout-form" disabled={submitting} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                        {submitting ? 'Processing...' : 'Place Order 🚀'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
};

export default Checkout;