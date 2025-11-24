import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, ArrowRight } from 'lucide-react';

const Cart = ({ cart, updateCartQuantity, removeFromCart, calculateTotal }) => {
    const navigate = useNavigate();
    
    return (
        <div className="max-w-5xl mx-auto px-4 py-16 animate-fade-in min-h-[60vh]">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-slate-800">Shopping Bag</h2>
          {cart.length === 0 ? <div className="text-center py-20 bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white/60 shadow-lg"><ShoppingBag size={64} className="mx-auto text-slate-300 mb-6"/><p className="text-slate-500 text-xl mb-8 font-medium">Your bag is currently empty.</p><button onClick={() => navigate('/')} className="bg-slate-900 px-8 py-4 rounded-full text-white font-bold hover:bg-slate-800 transition shadow-lg">Start Shopping</button></div> : 
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                {cart.map((item, i) => (
                  <div key={i} className="flex flex-col md:flex-row items-center gap-4 md:gap-6 bg-white/80 p-4 md:p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition">
                    <img src={item.image} className="w-full md:w-24 h-48 md:h-24 rounded-2xl object-cover shadow-sm" alt=""/>
                    <div className="flex-1 w-full text-center md:text-left">
                      <h3 className="font-bold text-slate-800 text-lg mb-1">{item.name}</h3>
                      <p className="text-violet-600 font-bold text-lg">{item.price} EGP</p>
                      {item.color && <p className="text-slate-400 text-xs mt-1">Color: {item.color}</p>}
                    </div>
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto justify-between md:justify-start">
                      <div className="flex items-center bg-slate-100 rounded-xl px-2 py-1 gap-3"><button onClick={() => updateCartQuantity(i, -1)} className="text-slate-500 hover:text-slate-800 p-1"><Minus size={14}/></button><span className="text-slate-800 font-bold text-sm">{item.quantity}</span><button onClick={() => updateCartQuantity(i, 1)} className="text-slate-500 hover:text-slate-800 p-1"><Plus size={14}/></button></div>
                      <button onClick={() => removeFromCart(i)} className="text-red-400 hover:text-red-600 text-xs font-bold underline decoration-red-200 hover:decoration-red-600 transition">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white/90 backdrop-blur p-6 md:p-8 rounded-[2.5rem] border border-white shadow-xl h-fit sticky top-24">
                <h3 className="text-2xl font-bold mb-6 text-slate-800">Order Summary</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{calculateTotal()} EGP</span></div>
                  <div className="flex justify-between text-slate-500"><span>Shipping</span><span className="text-green-600 font-bold">Free</span></div>
                </div>
                <div className="flex justify-between mb-8 text-2xl font-black text-slate-800 border-t border-slate-100 pt-6"><span>Total</span><span>{calculateTotal()} EGP</span></div>
                <button onClick={() => navigate('/checkout')} className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition flex justify-center gap-2 items-center">Proceed to Checkout <ArrowRight size={18}/></button>
              </div>
            </div>
          }
        </div>
    );
};

export default Cart;