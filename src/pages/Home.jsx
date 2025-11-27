import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Filter, Search, Heart, Box } from 'lucide-react';
import { motion } from 'framer-motion';

const MASTER_CATEGORIES = ['Abayas', 'Hoodies', 'Pants', 'Dresses', 'Tops', 'Skirts', 'Accessories', 'Shoes'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50 } }
};

const Home = ({ products, addToCart, wishlist, toggleWishlist }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const activeCategories = useMemo(() => {
    return MASTER_CATEGORIES.filter(category => 
      products.some(p => p.category === category)
    );
  }, [products]);

  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const isInWishlist = (id) => wishlist.some(item => item.id === id);

  return (
    <div className="animate-fade-in pb-20 relative">
      
      <div className="relative min-h-[85vh] flex items-center justify-center text-center px-4 mb-12 overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto animate-float">
          <span className="inline-block py-1 px-3 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur border border-white/60 dark:border-slate-700 text-violet-600 dark:text-violet-300 text-sm font-bold tracking-widest uppercase mb-6 shadow-sm transition-colors">
            Fall Collection 2025
          </span>
          <h1 className="text-7xl md:text-9xl font-black mb-8 text-slate-800 dark:text-white drop-shadow-sm tracking-tighter leading-[0.9] transition-colors">
            Modern <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400">Style</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-xl md:text-2xl mb-12 font-medium max-w-2xl mx-auto leading-relaxed transition-colors">
            Exclusively for Her. Elevate your wardrobe with pieces that feel as good as they look.
          </p>
          <div className="flex gap-4 justify-center">
             <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => document.getElementById('products').scrollIntoView({behavior: 'smooth'})} className="px-6 py-3 md:px-10 md:py-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold transition-colors duration-300 flex items-center gap-2 shadow-xl hover:shadow-2xl text-sm md:text-lg">Shop Collection <ArrowRight size={20}/></motion.button>
             <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/about')} className="px-6 py-3 md:px-10 md:py-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold transition-colors duration-300 shadow-md hover:shadow-lg text-sm md:text-lg">Our Story</motion.button>
          </div>
        </div>
      </div>
      
      <div id="products" className="max-w-7xl mx-auto px-4 z-10 relative">
        <div className="flex flex-col gap-6 mb-10">
            <div className="relative w-full max-w-md mx-auto">
                <input aria-label="Search products" type="text" placeholder="Search for products..." className="w-full py-4 pl-12 pr-4 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-900 text-slate-700 dark:text-white font-bold transition placeholder:text-slate-400 dark:placeholder:text-slate-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Search className="absolute left-4 top-4 text-slate-400 dark:text-slate-500" size={20}/>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setSelectedCategory('All')} className={`px-4 py-2 rounded-full text-sm font-bold transition ${selectedCategory === 'All' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}>All</motion.button>
                {activeCategories.map(c => (
                    <motion.button key={c} whileTap={{ scale: 0.95 }} onClick={() => setSelectedCategory(c)} className={`px-4 py-2 rounded-full text-sm font-bold transition ${selectedCategory === c ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}>{c}</motion.button>
                ))}
            </div>
        </div>
        
        <motion.div 
            key={selectedCategory + filteredProducts.length} 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8"
        >
          {filteredProducts.map(p => {
            const isOutOfStock = !p.stock || p.stock <= 0;
            return (
            <motion.div 
                key={p.id} 
                variants={itemVariants}
                className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl md:rounded-[2rem] overflow-hidden border border-white/60 dark:border-slate-700 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col relative"
            >
              <div className="relative w-full aspect-[3/4] overflow-hidden cursor-pointer bg-slate-50 dark:bg-slate-900" onClick={() => navigate(`/product/${p.id}`)}>
                {/* Image Optimization: loading="lazy" & decoding="async" */}
                <motion.img 
                    layoutId={`prod-img-${p.id}`}
                    src={p.image} 
                    alt={p.name} 
                    loading="lazy"
                    decoding="async"
                    className={`w-full h-full object-cover object-top group-hover:scale-110 transition duration-700 ${isOutOfStock ? 'grayscale opacity-70' : ''}`} 
                />
                
                {/* Accessibility: aria-label added */}
                <motion.button 
                    aria-label="Add to wishlist"
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }} 
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 shadow-sm transition z-10"
                >
                    <Heart size={20} className={`transition ${isInWishlist(p.id) ? 'fill-red-500 text-red-500' : 'text-slate-400 dark:text-slate-300 hover:text-red-500'}`} />
                </motion.button>

                {!isOutOfStock ? (
                    <motion.button 
                        aria-label="Add to cart"
                        whileHover={{ scale: 1.1 }} 
                        whileTap={{ scale: 0.9 }} 
                        onClick={(e) => { e.stopPropagation(); addToCart(p); }} 
                        className="absolute bottom-2 right-2 md:bottom-6 md:right-6 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2 md:p-4 rounded-full shadow-lg opacity-80 md:opacity-0 group-hover:opacity-100 transition duration-500 hover:bg-violet-600 dark:hover:bg-violet-500 hover:text-white"
                    >
                        <ShoppingBag size={16} className="md:w-6 md:h-6" />
                    </motion.button>
                ) : (
                    <div className="absolute bottom-0 w-full bg-slate-900/80 text-white text-center text-xs font-bold py-2 backdrop-blur-md flex items-center justify-center gap-1"><Box size={12}/> Out of Stock</div>
                )}
                {p.color && <div className="absolute top-3 left-3 bg-black/50 backdrop-blur px-2 py-1 rounded-full text-[10px] text-white font-medium">{p.color}</div>}
              </div>

              <div className="p-3 md:p-6 flex-1 flex flex-col">
                <div className="text-[10px] md:text-xs text-violet-500 dark:text-violet-300 font-bold mb-1 md:mb-2 uppercase tracking-wide bg-violet-50 dark:bg-violet-900/30 w-fit px-2 py-1 rounded-md truncate max-w-full">{p.category}</div>
                <h3 className="text-sm md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 md:mb-2 cursor-pointer hover:text-violet-600 dark:hover:text-violet-400 transition truncate" onClick={() => navigate(`/product/${p.id}`)}>{p.name}</h3>
                <div className="mt-auto flex justify-between items-center">
                  <div className="text-base md:text-2xl font-bold text-slate-900 dark:text-white">{p.price} <span className="text-[10px] md:text-sm text-slate-400 dark:text-slate-500 font-medium">EGP</span></div>
                </div>
              </div>
            </motion.div>
          )})}
          {filteredProducts.length === 0 && <div className="col-span-full text-center py-20 text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700"><Filter size={48} className="mx-auto mb-4 opacity-50"/><p className="text-xl font-bold">No products found.</p><p className="text-sm">Try searching for something else.</p></div>}
        </motion.div>
      </div>
    </div>
  );
};

export default Home;