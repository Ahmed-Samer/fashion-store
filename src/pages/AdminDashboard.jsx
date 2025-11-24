import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Layers, Users, TrendingUp, DollarSign, TicketPercent, 
  Trash2, Loader2, Wand2, Sparkles, Edit, Palette, Tag 
} from 'lucide-react';
import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, getAppId } from '../firebase';
import { callGeminiAPI } from '../utils/gemini';

const CATEGORIES = ['Abayas', 'Hoodies', 'Pants', 'Dresses', 'Tops', 'Skirts', 'Accessories', 'Shoes'];

const AdminDashboard = ({ user, products, orders, showNotification }) => {
  const navigate = useNavigate();
  const appId = getAppId();
  const [activeTab, setActiveTab] = useState('orders'); 
  const [editingId, setEditingId] = useState(null); 
  const [productForm, setProductForm] = useState({ name: '', price: '', image: '', category: 'Abayas', description: '', tags: '', color: '' });
  
  const [promoForm, setPromoForm] = useState({ code: '', discount: '' });
  const [promoCodes, setPromoCodes] = useState([]);
  const [messages, setMessages] = useState([]);
  
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  
  const [salesReport, setSalesReport] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatingReplyId, setGeneratingReplyId] = useState(null);
  const [generatedReplies, setGeneratedReplies] = useState({});

  useEffect(() => {
    if (!user) return;
    const messagesRef = collection(db, 'artifacts', appId, 'public', 'data', 'messages');
    const promosRef = collection(db, 'artifacts', appId, 'public', 'data', 'promo_codes');
    
    const unsubMsg = onSnapshot(query(messagesRef, orderBy('createdAt', 'desc')), (s) => setMessages(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubPromos = onSnapshot(query(promosRef, orderBy('createdAt', 'desc')), (s) => setPromoCodes(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    return () => { unsubMsg(); unsubPromos(); };
  }, [user, appId]);

  // --- AI Functions ---
  const handleGenerateDescription = async () => {
    if (!productForm.name || !productForm.category) { showNotification('Please enter name and category first', 'error'); return; }
    setIsGeneratingDesc(true);
    const prompt = `Write a creative, attractive, short product description in Arabic for a women's fashion item. Product Name: ${productForm.name}, Category: ${productForm.category}, Color: ${productForm.color}, Price: ${productForm.price}. Tone: Elegant, trendy, friendly Egyptian dialect. Use emojis.`;
    const desc = await callGeminiAPI(prompt);
    if (desc) { setProductForm(prev => ({ ...prev, description: desc.trim() })); showNotification('Description Generated ✨'); }
    setIsGeneratingDesc(false);
  };

  const handleGenerateTags = async () => {
    if (!productForm.name) { showNotification('Please enter product name first', 'error'); return; }
    setIsGeneratingTags(true);
    const prompt = `Generate 5 comma-separated style tags for: ${productForm.name} (${productForm.category}) - Color: ${productForm.color}. Output ONLY tags, comma-separated.`;
    const tags = await callGeminiAPI(prompt);
    if (tags) { setProductForm(prev => ({ ...prev, tags: tags.trim() })); showNotification('Tags Generated ✨'); }
    setIsGeneratingTags(false);
  };

  const handleGenerateReply = async (msg) => {
    setGeneratingReplyId(msg.id);
    const prompt = `Act as customer support for 'Modern Style' (Women's Store). Reply to: "${msg.content}". Language: same as message.`;
    const reply = await callGeminiAPI(prompt);
    if (reply) { setGeneratedReplies(prev => ({...prev, [msg.id]: reply.trim()})); showNotification('Drafted 📝'); }
    setGeneratingReplyId(null);
  };

  // --- CRUD Operations ---
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    
    // شيلنا الشرط الصامت وحطينا تنبيه عشان نعرف لو دي المشكلة
    if (!user) {
        // محاولة للكتابة حتى لو المستخدم مش موجود (لأغراض الاختبار)
        // لكن الصح إن الـ App.jsx يكون عامل login anonymous
        alert("تنبيه: النظام مش شايف مستخدم مسجل. جرب تعمل Refresh للصفحة عشان الـ Anonymous Login يشتغل.");
        // مش هنعمل return عشان نجرب نبعت للداتابيز يمكن تضبط لو الـ Rules تسمح
    }

    try {
      // التأكد إن الصور مش بتعمل مشاكل لو الحقل فاضي
      const rawImage = productForm.image || '';
      const imageList = rawImage.split(',').map(url => url.trim()).filter(url => url);
      // لو مفيش صورة حط صورة افتراضية عشان الداتابيز متزعلش
      const mainImage = imageList[0] || 'https://placehold.co/400'; 
      
      const data = { 
          ...productForm, 
          price: Number(productForm.price),
          image: mainImage,
          images: imageList,
          updatedAt: new Date().toISOString()
      };

      if (editingId) { 
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', editingId), data); 
          showNotification('تم تعديل المنتج! ✅');
      } else { 
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), { 
              ...data, 
              createdAt: new Date().toISOString() 
          }); 
          showNotification('تم إضافة المنتج! 🎉');
      }
      
      // تصفير الفورم
      setProductForm({ name: '', price: '', image: '', category: 'Abayas', description: '', tags: '', color: '' }); 
      setEditingId(null); 
      
    } catch (error) { 
      console.error("خطأ في الحفظ:", error);
      // الرسالة دي هتظهرلك لو المشكلة في الـ Permissions أو النت
      alert(`حصل خطأ: ${error.message}`);
    }
  };

  const handleDeleteProduct = async (id) => { if(window.confirm('Delete?')) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id)); };
  
  const handleSavePromo = async (e) => {
    e.preventDefault(); if(!user) return;
    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'promo_codes'), {
            code: promoForm.code.toUpperCase().trim(),
            discount: Number(promoForm.discount),
            createdAt: new Date().toISOString()
        });
        setPromoForm({ code: '', discount: '' });
        showNotification('Promo Code Created 🎟️');
    } catch(error) { showNotification('Error creating promo', 'error'); }
  };
  const handleDeletePromo = async (id) => { if(window.confirm('Delete Promo Code?')) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'promo_codes', id)); };

  const handleUpdateStatus = async (oid, st) => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', oid), { status: st }); };

  // --- Analytics ---
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const totalSales = deliveredOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const netProfit = totalSales * 0.30;
  const totalItemsSold = deliveredOrders.reduce((sum, order) => sum + (order.items ? order.items.reduce((iSum, item) => iSum + (item.quantity || 1), 0) : 0), 0);
  const uniqueCustomers = new Set(deliveredOrders.map(o => o.customer?.phone)).size;

  const generateSalesReport = async () => {
    setIsGeneratingReport(true);
    const prompt = `Report: Sales ${totalSales} EGP, Orders ${deliveredOrders.length}, Items ${totalItemsSold}, Clients ${uniqueCustomers}. Write short Arabic report.`;
    const report = await callGeminiAPI(prompt);
    setSalesReport(report);
    setIsGeneratingReport(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white/70 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-sm border border-white/60">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">Dashboard <span className="text-violet-500 text-sm bg-violet-100 px-2 py-1 rounded-lg">Admin</span></h2>
        <div className="flex flex-wrap gap-2 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/50">
          {['orders', 'products', 'promos', 'analytics', 'messages'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2 md:px-5 md:py-2.5 rounded-lg font-bold text-xs md:text-sm transition capitalize ${activeTab === tab ? 'bg-white text-violet-600 shadow-md transform scale-105' : 'hover:bg-white/50 text-slate-500'}`}>{tab}</button>
          ))}
        </div>
        <button onClick={() => navigate('/')} className="text-red-400 hover:text-red-600 font-bold text-sm bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition">Exit</button>
      </div>

      {activeTab === 'promos' && (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/80 p-6 md:p-8 rounded-3xl border border-white/60 shadow-lg h-fit">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800"><TicketPercent size={20}/> Create Promo Code</h3>
                <form onSubmit={handleSavePromo} className="space-y-4">
                    <input required type="text" className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none uppercase tracking-wider font-bold" value={promoForm.code} onChange={e => setPromoForm({...promoForm, code: e.target.value})} placeholder="Code (e.g. SUMMER20)" />
                    <div className="relative">
                        <input required type="number" min="1" max="100" className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none" value={promoForm.discount} onChange={e => setPromoForm({...promoForm, discount: e.target.value})} placeholder="Discount %" />
                        <span className="absolute right-4 top-3.5 text-slate-400 font-bold">%</span>
                    </div>
                    <button type="submit" className="w-full bg-violet-600 text-white py-3 rounded-xl hover:bg-violet-700 font-bold shadow-lg transition">Create Code</button>
                </form>
            </div>
            <div className="space-y-4">
                {promoCodes.map(promo => (
                    <div key={promo.id} className="bg-white/80 p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center group">
                        <div>
                            <div className="font-black text-xl text-slate-800 tracking-wider">{promo.code}</div>
                            <div className="text-green-600 font-bold">{promo.discount}% OFF</div>
                        </div>
                        <button onClick={() => handleDeletePromo(promo.id)} className="bg-red-50 text-red-500 p-3 rounded-xl opacity-0 group-hover:opacity-100 transition hover:bg-red-100"><Trash2 size={18}/></button>
                    </div>
                ))}
                {promoCodes.length === 0 && <div className="text-center py-10 text-slate-400">No active promo codes.</div>}
            </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="grid gap-4">
          {messages.map(msg => (
            <div key={msg.id} className="bg-white/80 p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start"><div><h3 className="font-bold text-slate-800 text-lg">{msg.name}</h3></div></div>
              <div className="bg-slate-50 p-5 rounded-2xl text-slate-600 border border-slate-100 italic">"{msg.content}"</div>
              <div className="border-t border-slate-100 pt-4">
                {!generatedReplies[msg.id] ? (
                  <button onClick={() => handleGenerateReply(msg)} disabled={generatingReplyId === msg.id} className="flex items-center gap-2 text-sm text-fuchsia-500 bg-fuchsia-50 px-4 py-2 rounded-xl w-fit">
                    {generatingReplyId === msg.id ? 'Generating...' : 'Generate Reply'}
                  </button>
                ) : (
                  <div className="bg-fuchsia-50 border border-fuchsia-100 p-4 rounded-2xl"><p className="text-slate-700 text-sm leading-relaxed">{generatedReplies[msg.id]}</p></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6">
            <div className="bg-white/80 p-4 md:p-6 rounded-3xl border border-white/60 shadow-lg"><div className="flex items-center gap-2 md:gap-3 text-violet-500 mb-2"><Package size={20} /> <h3 className="font-bold text-sm md:text-lg text-slate-700">Orders</h3></div><p className="text-2xl md:text-3xl font-black text-slate-800">{orders.length}</p></div>
            <div className="bg-white/80 p-4 md:p-6 rounded-3xl border border-white/60 shadow-lg"><div className="flex items-center gap-2 md:gap-3 text-fuchsia-500 mb-2"><Layers size={20} /> <h3 className="font-bold text-sm md:text-lg text-slate-700">Items</h3></div><p className="text-2xl md:text-3xl font-black text-slate-800">{totalItemsSold}</p></div>
            <div className="bg-white/80 p-4 md:p-6 rounded-3xl border border-white/60 shadow-lg"><div className="flex items-center gap-2 md:gap-3 text-pink-500 mb-2"><Users size={20} /> <h3 className="font-bold text-sm md:text-lg text-slate-700">Clients</h3></div><p className="text-2xl md:text-3xl font-black text-slate-800">{uniqueCustomers}</p></div>
            <div className="bg-white/80 p-4 md:p-6 rounded-3xl border border-white/60 shadow-lg"><div className="flex items-center gap-2 md:gap-3 text-green-500 mb-2"><TrendingUp size={20} /> <h3 className="font-bold text-sm md:text-lg text-slate-700">Sales</h3></div><p className="text-2xl md:text-3xl font-black text-slate-800">{totalSales.toLocaleString()} <span className="text-xs md:text-sm font-medium text-slate-400">EGP</span></p></div>
            <div className="bg-white/80 p-4 md:p-6 rounded-3xl border border-white/60 shadow-lg"><div className="flex items-center gap-2 md:gap-3 text-blue-500 mb-2"><DollarSign size={20} /> <h3 className="font-bold text-sm md:text-lg text-slate-700">Profit</h3></div><p className="text-2xl md:text-3xl font-black text-slate-800">{netProfit.toLocaleString()} <span className="text-xs md:text-sm font-medium text-slate-400">EGP</span></p></div>
          </div>
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-white/60 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-slate-800">Report</h3>
              <button onClick={generateSalesReport} disabled={isGeneratingReport} className="bg-violet-600 text-white px-4 py-2 md:px-6 md:py-2 rounded-xl font-bold text-sm">{isGeneratingReport ? '...' : 'Generate'}</button>
            </div>
            {salesReport && <div className="bg-slate-50 p-6 md:p-8 rounded-2xl text-slate-700 text-right" dir="rtl">{salesReport}</div>}
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/60 shadow-lg h-fit sticky top-4">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <input required type="text" className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="Name" />
              <div className="grid grid-cols-2 gap-2">
                 <input required type="number" className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} placeholder="Price (EGP)" />
                 <div className="relative">
                    <input type="text" className="w-full p-3 pl-9 bg-white border border-slate-200 rounded-xl outline-none" value={productForm.color} onChange={e => setProductForm({...productForm, color: e.target.value})} placeholder="Color (e.g. Black)" />
                    <Palette size={16} className="absolute left-3 top-4 text-slate-400"/>
                 </div>
              </div>
              <div className="space-y-1">
                <textarea required className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm" value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} placeholder="Image URLs (comma separated)" rows={3}></textarea>
                <p className="text-[10px] text-slate-400 ml-1">Separate multiple image links with commas</p>
              </div>
              
              <select className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase">Product Tags</label>
                  <button type="button" onClick={handleGenerateTags} disabled={isGeneratingTags} className="text-xs text-violet-600 hover:text-violet-800 flex items-center gap-1 font-bold bg-violet-50 px-2 py-1 rounded-md">
                    {isGeneratingTags ? <Loader2 size={12} className="animate-spin"/> : <Wand2 size={12}/>} Auto Tags ✨
                  </button>
                </div>
                <div className="relative">
                  <input type="text" className="w-full p-3 pl-10 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-100" value={productForm.tags} onChange={e => setProductForm({...productForm, tags: e.target.value})} placeholder="Tags: date, casual, winter..." />
                  <Tag className="absolute left-3 top-3.5 text-slate-400" size={16}/>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                  <button type="button" onClick={handleGenerateDescription} disabled={isGeneratingDesc} className="text-xs text-fuchsia-600 hover:text-fuchsia-800 flex items-center gap-1 font-bold bg-fuchsia-50 px-2 py-1 rounded-md">
                    {isGeneratingDesc ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>} Generate Description ✨
                  </button>
                </div>
                <textarea required className="w-full p-3 bg-white border border-slate-200 rounded-xl h-24 text-sm outline-none" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} placeholder="Description..." dir="auto"></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-violet-600 text-white py-3 rounded-xl hover:bg-violet-700 font-bold shadow-lg transition">{editingId ? 'Save' : 'Add'}</button>
                {editingId && <button type="button" onClick={() => { setEditingId(null); setProductForm({ name: '', price: '', image: '', category: 'Abayas', description: '', tags: '', color: '' }); }} className="bg-slate-100 text-slate-500 px-4 rounded-xl font-bold">Cancel</button>}
              </div>
            </form>
          </div>
          <div className="lg:col-span-2 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-sm overflow-y-auto max-h-[700px] space-y-3 custom-scrollbar">
            {products.map(p => (
              <div key={p.id} className="flex justify-between items-center p-4 bg-white/80 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition group">
                <div className="flex items-center gap-4">
                  <img src={p.image} className="w-16 h-16 rounded-xl object-cover border border-slate-100 shadow-sm" alt=""/>
                  <div>
                    <div className="font-bold text-slate-800 text-lg">{p.name}</div>
                    <div className="flex items-center gap-2">
                       <div className="text-violet-600 font-bold">{p.price} EGP</div>
                       {p.color && <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 border border-slate-200">{p.color}</span>}
                    </div>
                    {p.tags && <div className="text-xs text-slate-400 mt-1 flex gap-1 flex-wrap">{p.tags.split(',').map((t,i) => <span key={i} className="bg-slate-100 px-1 rounded">#{t.trim()}</span>)}</div>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setProductForm({ name: p.name, price: p.price, image: p.images ? p.images.join(', ') : p.image, category: p.category, description: p.description, tags: p.tags || '', color: p.color || '' }); setEditingId(p.id); }} className="text-violet-500 hover:bg-violet-50 p-2 rounded-xl transition"><Edit size={20} /></button>
                  <button onClick={() => handleDeleteProduct(p.id)} className="text-red-400 hover:bg-red-50 p-2 rounded-xl transition"><Trash2 size={20} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="bg-white/80 p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                    <h3 className="font-bold text-slate-800">{o.customer.name}</h3>
                    {o.discountApplied && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold flex items-center gap-1"><TicketPercent size={12}/> {o.discountApplied.code}</span>}
                </div>
                <div className="flex items-center gap-2">
                    <div className="font-bold text-violet-600 text-xl">{o.total} EGP</div>
                    {o.originalTotal && o.originalTotal > o.total && <div className="text-slate-400 text-sm line-through decoration-red-400">{o.originalTotal} EGP</div>}
                </div>
              </div>
              <div className="lg:w-1/3 flex flex-col gap-3 justify-center border-l border-slate-100 lg:pl-6">
                <div className={`text-lg font-bold text-center py-1 rounded-lg ${o.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{o.status}</div>
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  <button onClick={() => handleUpdateStatus(o.id, 'Shipped')} className="bg-blue-50 text-blue-600 py-2 rounded-lg">Ship</button>
                  <button onClick={() => handleUpdateStatus(o.id, 'Delivered')} className="bg-green-50 text-green-600 py-2 rounded-lg">Deliver</button>
                  <button onClick={() => handleUpdateStatus(o.id, 'Rejected')} className="bg-red-50 text-red-600 py-2 rounded-lg">Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;