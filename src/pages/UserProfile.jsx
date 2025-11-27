import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, History, Loader2, Box, MapPin, Save, User as UserIcon } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, getAppId } from '../firebase';

const governorates = ["Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira", "Fayoum", "Gharbia", "Ismailia", "Monufia", "Minya", "Qalyubia", "New Valley", "Suez", "Aswan", "Assiut", "Beni Suef", "Port Said", "Damietta", "Sharqia", "South Sinai", "Kafr El Sheikh", "Matruh", "Luxor", "Qena", "North Sinai", "Sohag"];

const UserProfile = ({ user, showNotification }) => {
    const navigate = useNavigate();
    const appId = getAppId();
    const [userOrders, setUserOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // بيانات الشحن
    const [userData, setUserData] = useState({
        fullName: '',
        phone: '',
        address: '',
        governorate: 'Cairo'
    });

    useEffect(() => {
        if(!user) return;

        // 1. جلب الأوردرات
        const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const myOrders = allOrders.filter(o => o.userId === user.uid);
            setUserOrders(myOrders);
            setLoading(false);
        });

        // 2. جلب بيانات الشحن المحفوظة
        const fetchProfile = async () => {
            try {
                const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'profiles', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                }
            } catch(e) { console.error("Error fetching profile", e); }
        };
        fetchProfile();

        return () => unsubscribe();
    }, [user, appId]);

    const handleSaveDetails = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // حفظ البيانات بنفس الـ ID بتاع المستخدم
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profiles', user.uid), userData);
            showNotification('Shipping details saved! 💾');
        } catch(e) {
            showNotification('Error saving details', 'error');
        }
        setSaving(false);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            showNotification('Signed out successfully 👋');
            navigate('/');
        } catch(e) { console.error(e); }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-3xl border-4 border-white dark:border-slate-600 shadow-lg overflow-hidden transition-colors">
                        {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" alt="Profile" /> : "👤"}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Hello, {user?.displayName || 'Friend'}! 👋</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{user?.email || 'Anonymous User'}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-300 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/40 transition">
                    <LogOut size={18}/> Sign Out
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                
                {/* Left Column: Shipping Details Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 dark:border-slate-700 shadow-xl h-fit transition-colors sticky top-24">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white"><UserIcon className="text-violet-500"/> My Details</h3>
                        <form onSubmit={handleSaveDetails} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 block mb-1">Full Name</label>
                                <input required className="w-full p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none dark:text-white placeholder:text-slate-400 text-sm" value={userData.fullName} onChange={e => setUserData({...userData, fullName: e.target.value})} placeholder="Your Name" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 block mb-1">Phone Number</label>
                                <input required type="tel" className="w-full p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none dark:text-white placeholder:text-slate-400 text-sm" value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})} placeholder="01xxxxxxxxx" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 block mb-1">Governorate</label>
                                <select className="w-full p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none dark:text-white text-sm" value={userData.governorate} onChange={e => setUserData({...userData, governorate: e.target.value})}>
                                    {governorates.map(g => <option key={g}>{g}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 block mb-1">Address</label>
                                <textarea required className="w-full p-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none dark:text-white placeholder:text-slate-400 text-sm h-24 resize-none" value={userData.address} onChange={e => setUserData({...userData, address: e.target.value})} placeholder="Street, Building..." />
                            </div>
                            <button disabled={saving} className="w-full bg-violet-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-violet-700 transition flex items-center justify-center gap-2">
                                {saving ? 'Saving...' : <>Save Details <Save size={16}/></>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Order History */}
                <div className="lg:col-span-2">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 dark:border-slate-700 shadow-xl min-h-[400px] transition-colors">
                        <h3 className="text-2xl font-bold mb-8 flex items-center gap-2 text-slate-800 dark:text-white"><History className="text-fuchsia-500"/> Order History</h3>
                        
                        {loading ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-violet-500"/></div> : 
                        userOrders.length === 0 ? <div className="text-center py-20 text-slate-400 dark:text-slate-500 flex flex-col items-center gap-4"><Box size={48} className="opacity-50"/><p>No orders yet. Start shopping!</p><button onClick={() => navigate('/')} className="text-violet-600 dark:text-violet-400 font-bold underline">Go to Store</button></div> :
                        <div className="space-y-4">
                            {userOrders.map(order => (
                                <div key={order.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-all duration-300">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : order.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{order.status}</span>
                                            <span className="text-slate-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-1">{order.total} EGP</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">{order.items?.length || 0} Items</p>
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-2 max-w-xs">
                                        {order.items?.map((item, i) => (
                                            <img key={i} src={item.image} className="w-12 h-12 rounded-lg object-cover border border-slate-100 dark:border-slate-700 flex-shrink-0" alt=""/>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;