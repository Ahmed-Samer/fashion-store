import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingBag, Rocket, Ruler, X, Box, Star } from 'lucide-react';
// تم تعديل المسار بناءً على السكرين شوت
import { SIZE_CHARTS } from '../utils/sizeData'; 

const ProductDetails = ({ products, addToCart }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [qty, setQty] = useState(1);
    const [activeImg, setActiveImg] = useState(0);
    const [showSizeGuide, setShowSizeGuide] = useState(false); // حالة النافذة
    const scrollRef = useRef(null);
    
    // State for Dragging functionality
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const selectedProduct = products.find(p => p.id === id);
    
    if (!selectedProduct) return <div className="text-center py-20">Product not found.</div>;

    // حسابات المخزون والصور
    const images = selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images : [selectedProduct.image];
    const stock = selectedProduct.stock || 0;
    const isOutOfStock = stock <= 0;

    // استدعاء جدول المقاسات المناسب
    const sizeChart = SIZE_CHARTS[selectedProduct.category];

    // منتجات مقترحة (Related)
    let related = [];
    if (selectedProduct) {
        related = products.filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id).slice(0, 4);
        if (related.length === 0) related = products.filter(p => p.id !== selectedProduct.id).slice(0, 4);
    }

    const handleBuyNow = () => { addToCart(selectedProduct, qty); navigate('/checkout'); };
    
    // دوال السكرول والسحب (Carousel Logic)
    const handleScroll = () => { if (scrollRef.current) { const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.offsetWidth); setActiveImg(index); } };
    const startDragging = (e) => { setIsDragging(true); setStartX(e.pageX - scrollRef.current.offsetLeft); setScrollLeft(scrollRef.current.scrollLeft); };
    const stopDragging = () => setIsDragging(false);
    const onDrag = (e) => { if (!isDragging) return; e.preventDefault(); const x = e.pageX - scrollRef.current.offsetLeft; const walk = (x - startX) * 2; scrollRef.current.scrollLeft = scrollLeft - walk; };

    return (
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 animate-fade-in pt-4 md:pt-8">
        <button onClick={() => navigate('/')} className="flex items-center text-slate-500 hover:text-violet-600 mb-6 gap-2 transition group font-medium text-sm md:text-base"><ArrowRight size={20} className="rotate-180 group-hover:-translate-x-1 transition" /> Back to Store</button>
        
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 bg-white/80 backdrop-blur-xl p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-white/60 mb-12 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-violet-100 rounded-bl-[100px] -z-10 opacity-50"></div>
          
          {/* Image Carousel */}
          <div className="relative w-full h-[500px] bg-white rounded-3xl overflow-hidden group border border-slate-100 shadow-inner">
            <div ref={scrollRef} onScroll={handleScroll} onMouseDown={startDragging} onMouseLeave={stopDragging} onMouseUp={stopDragging} onMouseMove={onDrag} className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide cursor-grab active:cursor-grabbing" style={{scrollBehavior: isDragging ? 'auto' : 'smooth'}}>
                {images.map((img, i) => <img key={i} src={img} id={`prod-img-${i}`} className={`w-full h-full object-cover flex-shrink-0 snap-center pointer-events-none select-none ${isOutOfStock ? 'grayscale' : ''}`} alt="" />)}
            </div>
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm border border-slate-100 z-10">{selectedProduct.category}</div>
            {images.length > 1 && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">{images.map((_, i) => <button key={i} onClick={(e) => { e.preventDefault(); if(scrollRef.current) scrollRef.current.scrollTo({ left: i * scrollRef.current.offsetWidth, behavior: 'smooth' }); }} className={`w-2 h-2 rounded-full transition-all shadow-sm ${activeImg === i ? 'bg-violet-600 w-4' : 'bg-white/80 hover:bg-white'}`}></button>)}</div>}
          </div>

          <div className="flex flex-col justify-center">
            <div>
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="bg-violet-100 text-violet-700 border border-violet-200 text-[10px] md:text-xs px-3 md:px-4 py-1 md:py-1.5 rounded-full font-bold uppercase tracking-wider">{selectedProduct.category}</span>
                    {isOutOfStock ? <span className="bg-red-100 text-red-600 text-[10px] px-3 py-1 rounded-full font-bold">Out of Stock</span> : 
                     <span className={`text-[10px] px-3 py-1 rounded-full font-bold border ${stock < 5 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{stock} left</span>
                    }
                  </div>
                  
                  {/* زرار دليل المقاسات */}
                  <button onClick={() => setShowSizeGuide(true)} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-violet-600 transition border-b border-slate-300 hover:border-violet-600 pb-0.5">
                      <Ruler size={14}/> Size Guide
                  </button>
              </div>

              <h1 className="text-2xl md:text-5xl font-black mb-3 md:mb-4 text-slate-800 leading-tight">{selectedProduct.name}</h1>
              <p className="text-2xl md:text-4xl font-bold text-violet-600 mb-6 md:mb-8">{selectedProduct.price} <span className="text-lg md:text-xl text-slate-400 font-medium">EGP</span></p>
              
              {selectedProduct.fitType && (
                  <div className="mb-6 flex items-center gap-2 text-sm text-slate-600 bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100">
                      <span className="font-bold text-slate-400 uppercase text-xs">Fit:</span> {selectedProduct.fitType}
                  </div>
              )}

              <p className="text-slate-600 mb-8 md:mb-10 leading-relaxed text-sm md:text-lg border-l-4 border-violet-200 pl-4 md:pl-6 py-2" dir="auto">{selectedProduct.description}</p>
            </div>
            
            {!isOutOfStock ? (
            <div className="flex flex-col gap-4 mt-auto">
              <div className="w-full flex items-center justify-between bg-white rounded-2xl px-4 py-3 gap-6 border border-slate-200 shadow-sm">
                  <button onClick={() => qty > 1 && setQty(qty-1)} className="text-slate-400 hover:text-violet-600 transition"><Minus size={18}/></button>
                  <span className="font-bold text-2xl text-slate-800 w-6 text-center">{qty}</span>
                  <button onClick={() => qty < stock ? setQty(qty+1) : null} className={`text-slate-400 transition ${qty >= stock ? 'opacity-30 cursor-not-allowed' : 'hover:text-violet-600'}`}><Plus size={18}/></button>
              </div>
              <div className="flex gap-3">
                  <button onClick={() => addToCart(selectedProduct, qty)} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm md:text-lg shadow-lg hover:shadow-xl hover:bg-slate-800 transition flex justify-center gap-2 items-center">Add to Cart <ShoppingBag size={18}/></button>
                  <button onClick={handleBuyNow} className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 rounded-2xl font-bold text-sm md:text-lg shadow-lg shadow-violet-200 hover:shadow-2xl hover:scale-[1.02] transition flex justify-center gap-2 items-center">Buy Now <Rocket size={18}/></button>
              </div>
            </div>
            ) : (
               <div className="bg-slate-100 p-6 rounded-2xl text-center text-slate-500 font-bold flex flex-col items-center gap-2"><Box size={32} className="opacity-50"/><span>Currently Unavailable</span></div>
            )}
          </div>
        </div>
        {/* Related Products */}
        <div className="border-t border-slate-200 pt-12 md:pt-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-10 text-slate-800">{related.length > 0 ? 'Check These Out' : 'You Might Also Like'}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {related.map(p => (
                    <div key={p.id} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition duration-500 hover:-translate-y-2 flex flex-col" onClick={() => { navigate(`/product/${p.id}`); window.scrollTo({top: 0, behavior: 'smooth'}); }}>
                        <div className="relative w-full aspect-[3/4] bg-slate-50 overflow-hidden">
                            <img src={p.image} className="w-full h-full object-cover object-top group-hover:scale-110 transition duration-700" alt=""/>
                            {p.color && <div className="absolute top-2 left-2 bg-black/50 backdrop-blur px-2 py-1 rounded-full text-[10px] text-white font-medium">{p.color}</div>}
                        </div>
                        <div className="p-3 flex flex-col gap-1 bg-white"><h3 className="font-bold text-slate-900 text-sm truncate">{p.name}</h3><p className="text-violet-600 font-bold text-sm">{p.price} EGP</p></div>
                    </div>
                ))}
            </div>
        </div>

        {/* ==================== Size Guide Modal (Dynamic) ==================== */}
        {showSizeGuide && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in relative">
                    <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Ruler className="text-violet-600"/> Size Guide</h3>
                        <button onClick={() => setShowSizeGuide(false)} className="p-2 hover:bg-slate-200 rounded-full transition"><X size={20}/></button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                        {/* Admin Note */}
                        {selectedProduct.sizeNote && (
                            <div className="bg-violet-50 border border-violet-100 text-violet-800 p-4 rounded-xl mb-6 text-sm font-medium flex gap-3 items-start">
                                <span className="text-xl">💡</span>
                                <p>{selectedProduct.sizeNote}</p>
                            </div>
                        )}

                        {/* Dynamic Table Rendering */}
                        {sizeChart ? (
                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full text-sm text-left text-slate-600">
                                    <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                        <tr>
                                            {sizeChart.columns.map((col, i) => (
                                                <th key={i} className="px-4 py-3">{col}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sizeChart.rows.map((row, i) => (
                                            <tr key={i} className="bg-white border-b border-slate-100 hover:bg-slate-50">
                                                {row.map((cell, j) => (
                                                    <td key={j} className={`px-4 py-3 ${j === 0 ? 'font-bold text-slate-900' : ''}`}>
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p>Standard Size Chart unavailable for this category.</p>
                                <p className="text-sm mt-1">Please refer to the product description.</p>
                            </div>
                        )}
                        
                        <div className="mt-6 text-xs text-slate-400 text-center">
                            * Measurements are in CM. Allow 1-2cm difference.
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
};

export default ProductDetails;