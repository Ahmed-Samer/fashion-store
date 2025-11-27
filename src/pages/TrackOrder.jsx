import React, { useState } from 'react';
import { Search, Package, Clock, Truck, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, getAppId } from '../firebase';
import SEO from '../components/SEO';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const appId = getAppId();

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrderData(null);

    const cleanId = orderId.replace('#', '').trim();

    if (!cleanId) {
        setError('Please enter a valid Order ID');
        setLoading(false);
        return;
    }

    try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', cleanId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setOrderData(docSnap.data());
        } else {
            setError('Order not found. Please check the ID.');
        }
    } catch (err) {
        console.error(err);
        setError('Something went wrong. Try again later.');
    }
    setLoading(false);
  };

  const getStatusInfo = (status) => {
      switch(status) {
          case 'Pending': return { color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: <Clock/>, text: 'Order Received (Waiting Confirmation)' };
          case 'Shipped': return { color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: <Truck/>, text: 'Out for Delivery' };
          case 'Delivered': return { color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', icon: <CheckCircle/>, text: 'Delivered Successfully' };
          case 'Rejected': return { color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', icon: <XCircle/>, text: 'Order Cancelled' };
          default: return { color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800', icon: <Package/>, text: status };
      }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 animate-fade-in min-h-[70vh]">
      <SEO title="Track Order" />
      
      <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 transition-colors">Track Your Order 📦</h1>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">Enter your Order ID (e.g. 123456) to see the status.</p>
      </div>

      <form onSubmit={handleTrack} className="flex gap-2 mb-12">
          <input 
            type="text" 
            placeholder="Order ID (e.g. 592021)" 
            className="flex-1 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900 font-bold text-lg text-slate-800 dark:text-white transition-colors placeholder:text-slate-400"
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
          />
          <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition flex items-center gap-2">
              {loading ? 'Searching...' : <><Search size={20}/> Track</>}
          </button>
      </form>

      {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-300 p-4 rounded-xl text-center font-bold border border-red-100 dark:border-red-900/30 animate-fade-in">
              {error}
          </div>
      )}

      {orderData && (
          <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl animate-fade-in-up transition-colors">
              <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-slate-700 pb-6">
                  <div>
                      <p className="text-xs text-slate-400 font-bold uppercase">Order ID</p>
                      <h2 className="text-2xl font-black text-violet-600 dark:text-violet-400">{orderData.orderId}</h2>
                  </div>
                  <div className="text-right">
                      <p className="text-xs text-slate-400 font-bold uppercase">Total Amount</p>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white">{orderData.total} EGP</h2>
                  </div>
              </div>

              {/* Status Badge */}
              <div className={`p-4 rounded-xl flex items-center gap-3 mb-6 ${getStatusInfo(orderData.status).bg} ${getStatusInfo(orderData.status).color} border border-current border-opacity-20`}>
                  {getStatusInfo(orderData.status).icon}
                  <span className="font-bold">{getStatusInfo(orderData.status).text}</span>
              </div>

              <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><MapPin size={18}/> Delivery Details</h3>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl text-sm text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-600">
                      <p className="font-bold text-slate-900 dark:text-white mb-1">{orderData.customer.name}</p>
                      <p>{orderData.customer.address}, {orderData.customer.governorate}</p>
                      <p className="mt-1">{orderData.customer.phone}</p>
                  </div>
                  
                  <div className="pt-4">
                      <h3 className="font-bold text-slate-800 dark:text-white mb-3">Items ({orderData.items.length})</h3>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                          {orderData.items.map((item, i) => (
                              <div key={i} className="flex-shrink-0 w-20 relative">
                                  <img src={item.image} className="w-20 h-20 rounded-xl object-cover border border-slate-100 dark:border-slate-600" alt={item.name}/>
                                  <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-tl-lg font-bold">x{item.quantity}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default TrackOrder;