import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, History, Loader2, Box } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db, getAppId } from '../firebase';

const UserProfile = ({ user, showNotification }) => {
    const navigate = useNavigate();
    const appId = getAppId();
    const [userOrders, setUserOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!user) return;
        const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Client-side filtering for current user
            const myOrders = allOrders.filter(o => o.userId === user.uid);
            setUserOrders(myOrders);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user, appId]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            showNotification('Signed out successfully 👋');
            navigate('/');
        } catch(e) { console.error(e); }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-3xl border-4 border-white shadow-lg overflow-hidden">
                        {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" alt="Profile" /> : "👤"}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Hello, {user?.displayName || 'Friend'}! 👋</h2>
                        <p className="text-slate-500 text-sm">{user?.email || 'Anonymous User'}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="bg-red-50 text-red-500 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-100 transition"><LogOut size={18}/> Sign Out</button>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-xl min-h-[400px]">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-2 text-slate-800"><History className="text-violet-500"/> Order History</h3>
                
                {loading ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-violet-500"/></div> : 
                 userOrders.length === 0 ? <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-4"><Box size={48} className="opacity-50"/><p>No orders yet. Start shopping!</p><button onClick={() => navigate('/')} className="text-violet-600 font-bold underline">Go to Store</button></div> :
                 <div className="space-y-4">
                    {userOrders.map(order => (
                        <div key={order.id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : order.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{order.status}</span>
                                    <span className="text-slate-400 text-xs">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h4 className="font-bold text-slate-800 text-lg mb-1">{order.total} EGP</h4>
                                <p className="text-slate-500 text-sm">{order.items?.length || 0} Items</p>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 max-w-xs">
                                {order.items?.map((item, i) => (
                                    <img key={i} src={item.image} className="w-12 h-12 rounded-lg object-cover border border-slate-100 flex-shrink-0" alt=""/>
                                ))}
                            </div>
                        </div>
                    ))}
                 </div>
                }
            </div>
        </div>
    );
};

export default UserProfile;