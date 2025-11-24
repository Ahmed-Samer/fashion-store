import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import SEO from '../components/SEO';

const Wishlist = ({ wishlist, removeFromWishlist, addToCart }) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-fade-in min-h-[60vh]">
      <SEO title="My Wishlist" />
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-slate-800 flex items-center gap-3">
        <Heart className="text-red-500 fill-red-500" /> My Wishlist
      </h2>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white/60 shadow-lg">
          <Heart size={64} className="mx-auto text-slate-300 mb-6" />
          <p className="text-slate-500 text-xl mb-8 font-medium">Your wishlist is empty.</p>
          <button onClick={() => navigate('/')} className="bg-slate-900 px-8 py-4 rounded-full text-white font-bold hover:bg-slate-800 transition shadow-lg">
            Start Exploring
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {wishlist.map(p => (
            <div key={p.id} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition duration-500 flex flex-col relative">
              <div className="relative w-full aspect-[3/4] overflow-hidden bg-slate-50">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover cursor-pointer" onClick={() => navigate(`/product/${p.id}`)} />
                <button onClick={() => removeFromWishlist(p.id)} className="absolute top-2 right-2 bg-white/80 p-2 rounded-full text-red-500 hover:bg-red-50 transition shadow-sm">
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-800 mb-1 truncate">{p.name}</h3>
                <p className="text-violet-600 font-bold mb-4">{p.price} EGP</p>
                <button 
                  onClick={() => addToCart(p)} 
                  className="w-full mt-auto bg-slate-900 text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition"
                >
                  <ShoppingBag size={16}/> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;