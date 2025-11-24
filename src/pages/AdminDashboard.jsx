import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Layers, Users, TrendingUp, DollarSign, TicketPercent, 
  Trash2, Loader2, Wand2, Sparkles, Edit, Palette, Tag, Upload, Image as ImageIcon, Search, Phone, MapPin, MessageCircle, Box, Ruler
} from 'lucide-react';
import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, getAppId } from '../firebase';
import { callGeminiAPI } from '../utils/gemini';

const CATEGORIES = ['Abayas', 'Hoodies', 'Pants', 'Dresses', 'Tops', 'Skirts', 'Accessories', 'Shoes'];
const FITS = ['Regular Fit', 'Oversize', 'Slim Fit', 'Loose Fit'];

const AdminDashboard = ({ user, products, showNotification }) => {
  const navigate = useNavigate();
  const appId = getAppId();
  
  // --- States ---
  const [activeTab, setActiveTab] = useState('orders'); 
  const [editingId, setEditingId] = useState(null); 
  
  const [productForm, setProductForm] = useState({ 
      name: '', 
      price: '', 
      stock: '', 
      image: '', 
      category: 'Abayas', 
      description: '', 
      tags: '', 
      color: '', 
      sizeNote: '', 
      fitType: 'Regular Fit' 
  });
  
  const [promoForm, setPromoForm] = useState({ code: '', discount: '' });
  const [promoCodes, setPromoCodes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [orders, setOrders] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');

  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [salesReport, setSalesReport] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generatingReplyId, setGeneratingReplyId] = useState(null);
  const [generatedReplies, setGeneratedReplies] = useState({});

  // --- Fetch Data ---
  useEffect(() => {
    if (!user) return;
    
    const messagesRef = collection(db, 'artifacts', appId, 'public', 'data', 'messages');
    const promosRef = collection(db, 'artifacts', appId, 'public', 'data', 'promo_codes');
    const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
    
    const unsubMsg = onSnapshot(query(messagesRef, orderBy('createdAt', 'desc')), (s) => setMessages(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubPromos = onSnapshot(query(promosRef, orderBy('createdAt', 'desc')), (s) => setPromoCodes(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubOrders = onSnapshot(query(ordersRef, orderBy('createdAt', 'desc')), (s) => setOrders(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    return () => { unsubMsg(); unsubPromos(); unsubOrders(); };
  }, [user, appId]);

  // --- WhatsApp Helper ---
  const getWhatsAppLink = (order) => {
    let phone = order.customer?.phone || "";
    if (phone.startsWith("0")) phone = phone.substring(1);
    phone = "+20" + phone;
    
    let itemsText = "";
    if (order.items && order.items.length > 0) {
        itemsText = order.items.map(item => `- ${item.name} (عدد: ${item.quantity})`).join("\n");
    }
    
    const message = `أهلاً بك يا ${order.customer?.name.split(' ')[0]} 👋\nبخصوص طلبك رقم: ${order.orderId}\nمن Modern Style ✨\n\n*تفاصيل الطلب:*\n${itemsText}\n\n*الإجمالي:* ${order.total} EGP\n\nهل البيانات صحيحة؟ 🚚`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  // --- AI Functions ---
  const handleGenerateDescription = async () => {
    if (!productForm.name || !productForm.category) { 
        showNotification('Please enter name and category first', 'error'); 
        return; 
    }
    setIsGeneratingDesc(true);
    const prompt = `Write a creative Arabic product description. Name: ${productForm.name}, Category: ${productForm.category}, Price: ${productForm.price}. Tone: Trendy Egyptian.`;
    const desc = await callGeminiAPI(prompt);
    if (desc) { 
        setProductForm(prev => ({ ...prev, description: desc.trim() })); 
        showNotification('Description Generated ✨'); 
    }
    setIsGeneratingDesc(false);
  };

  const handleGenerateTags = async () => {
    if (!productForm.name) return;
    setIsGeneratingTags(true);
    const prompt = `5 style tags for: ${productForm.name} (${productForm.category}). Comma separated.`;
    const tags = await callGeminiAPI(prompt);
    if (tags) { 
        setProductForm(prev => ({ ...prev, tags: tags.trim() })); 
        showNotification('Tags Generated ✨'); 
    }
    setIsGeneratingTags(false);
  };

  const handleGenerateReply = async (msg) => {
    setGeneratingReplyId(msg.id);
    const prompt = `Reply to customer as Modern Style support: "${msg.content}". Language: Arabic/English matching user.`;
    const reply = await callGeminiAPI(prompt);
    if (reply) { 
        setGeneratedReplies(prev => ({...prev, [msg.id]: reply.trim()})); 
        showNotification('Drafted 📝'); 
    }
    setGeneratingReplyId(null);
  };

  // --- Image Upload (ImgBB) ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
        const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, { method: "POST", body: formData });
        const data = await response.json();

        if (data.success) {
            const url = data.data.url;
            setProductForm(prev => ({ ...prev, image: prev.image ? `${prev.image}, ${url}` : url }));
            showNotification('Uploaded! 🖼️');
        } else {
            throw new Error("Failed");
        }
    } catch (error) {
        console.error(error);
        showNotification('Upload Failed', 'error');
    }
    setIsUploading(false);
  };

  // --- Product CRUD ---
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!user) { alert("Please refresh."); return; }
    
    try {
      const rawImage = productForm.image || '';
      const imageList = rawImage.split(',').map(url => url.trim()).filter(url => url);
      const mainImage = imageList[0] || 'https://placehold.co/400';
      
      const data = { 
          ...productForm, 
          price: Number(productForm.price), 
          stock: Number(productForm.stock),
          image: mainImage, 
          images: imageList, 
          updatedAt: new Date().toISOString() 
      };

      if (editingId) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', editingId), data);
          showNotification('Updated! ✅');
      } else {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), { ...data, createdAt: new Date().toISOString() });
          showNotification('Added! 🎉');
      }
      
      setProductForm({ name: '', price: '', stock: '', image: '', category: 'Abayas', description: '', tags: '', color: '', sizeNote: '', fitType: 'Regular Fit' });
      setEditingId(null);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
  };

  const startEditing = (p) => {
      setProductForm({ 
          name: p.name, price: p.price, stock: p.stock || 0,
          image: p.images ? p.images.join(', ') : p.image, category: p.category, 
          description: p.description, tags: p.tags || '', color: p.color || '',
          sizeNote: p.sizeNote || '', fitType: p.fitType || 'Regular Fit'
      });
      setEditingId(p.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id) => {
      if(window.confirm('Delete?')) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id));
  };

  // --- Promo CRUD ---
  const handleSavePromo = async (e) => {
      e.preventDefault();
      try {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'promo_codes'), { 
              code: promoForm.code.toUpperCase().trim(), 
              discount: Number(promoForm.discount), 
              createdAt: new Date().toISOString() 
          });
          setPromoForm({ code: '', discount: '' });
          showNotification('Promo Created 🎟️');
      } catch(e) {}
  };

  const handleDeletePromo = async (id) => {
      if(window.confirm('Delete Promo?')) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'promo_codes', id));
  };

  // --- Order Updates ---
  const handleUpdateStatus = async (oid, st) => {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', oid), { status: st });
  };

  // --- Analytics ---
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const totalSales = deliveredOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const totalItemsSold = deliveredOrders.reduce((sum, order) => sum + (order.items ? order.items.reduce((iSum, item) => iSum + (item.quantity || 1), 0) : 0), 0);
  const uniqueCustomers = new Set(deliveredOrders.map(o => o.customer?.phone)).size;
  const netProfit = totalSales * 0.30;

  const generateSalesReport = async () => {
      setIsGeneratingReport(true);
      const prompt = `Sales Report (Arabic): Sales ${totalSales} EGP, Orders ${deliveredOrders.length}, Items ${totalItemsSold}, Clients ${uniqueCustomers}.`;
      const report = await callGeminiAPI(prompt);
      setSalesReport(report);
      setIsGeneratingReport(false);
  };

  const filteredOrders = orders.filter(o => 
      o.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.customer?.phone?.includes(searchTerm) || 
      o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in min-h-screen">
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white/70 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-sm border border-white/60">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">Dashboard <span className="text-violet-500 text-sm bg-violet-100 px-2 py-1 rounded-lg">Admin</span></h2>
        <div className="flex flex-wrap gap-2 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/50">
          {['orders', 'products', 'promos', 'analytics', 'messages'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2 md:px-5 md:py-2.5 rounded-lg font-bold text-xs md:text-sm transition capitalize ${activeTab === tab ? 'bg-white text-violet-600 shadow-md transform scale-105' : 'hover:bg-white/50 text-slate-500'}`}>{tab}</button>
          ))}
        </div>
        <button onClick={() => navigate('/')} className="text-red-400 hover:text-red-600 font-bold text-sm bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition">Exit</button>
      </div>

      {/* TAB: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/60 shadow-lg h-fit sticky top-4">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <input required type="text" className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="Name" />
              
              <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="text-[10px] font-bold text-slate-500 ml-1">Price</label>
                    <input required type="number" className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} placeholder="EGP" />
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-500 ml-1">Stock</label>
                    <input required type="number" className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} placeholder="Qty" />
                 </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Ruler size={12}/> Size & Fit</label>
                  <select className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none" value={productForm.fitType} onChange={e => setProductForm({...productForm, fitType: e.target.value})}>
                      {FITS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <input type="text" className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none" value={productForm.sizeNote} onChange={e => setProductForm({...productForm, sizeNote: e.target.value})} placeholder="Note (e.g. Model is 175cm wearing M)" />
              </div>

              <div className="relative">
                <input type="text" className="w-full p-3 pl-9 bg-white border border-slate-200 rounded-xl outline-none" value={productForm.color} onChange={e => setProductForm({...productForm, color: e.target.value})} placeholder="Color (e.g. Black)" />
                <Palette size={16} className="absolute left-3 top-4 text-slate-400"/>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                    Product Images 
                    {isUploading && <span className="text-violet-600 flex items-center gap-1"><Loader2 size={12} className="animate-spin"/> Uploading...</span>}
                </label>
                <div className="flex gap-2">
                    <label className="flex-1 cursor-pointer bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-200 border-dashed rounded-xl p-3 flex items-center justify-center gap-2 transition">
                        <Upload size={18} /> <span className="text-sm font-bold">Upload (Free)</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading}/>
                    </label>
                </div>
                <textarea required className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm h-16" value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} placeholder="Image URL..." rows={2}></textarea>
              </div>
              
              <select className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase">Tags</label>
                    <button type="button" onClick={handleGenerateTags} disabled={isGeneratingTags} className="text-xs text-violet-600 bg-violet-50 px-2 py-1 rounded-md font-bold">
                        {isGeneratingTags ? '...' : 'Auto Tags ✨'}
                    </button>
                </div>
                <input type="text" className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none" value={productForm.tags} onChange={e => setProductForm({...productForm, tags: e.target.value})} placeholder="Tags..." />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                    <button type="button" onClick={handleGenerateDescription} disabled={isGeneratingDesc} className="text-xs text-fuchsia-600 bg-fuchsia-50 px-2 py-1 rounded-md font-bold">
                        {isGeneratingDesc ? '...' : 'Generate ✨'}
                    </button>
                </div>
                <textarea required className="w-full p-3 bg-white border border-slate-200 rounded-xl h-24 text-sm outline-none" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} placeholder="Desc..."></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-violet-600 text-white py-3 rounded-xl hover:bg-violet-700 font-bold shadow-lg transition">{editingId ? 'Save' : 'Add'}</button>
                {editingId && <button type="button" onClick={() => { setEditingId(null); setProductForm({ name: '', price: '', stock: '', image: '', category: 'Abayas', description: '', tags: '', color: '', sizeNote: '', fitType: 'Regular Fit' }); }} className="bg-slate-100 text-slate-500 px-4 rounded-xl font-bold">Cancel</button>}
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
                    <div className="flex items-center gap-3">
                       <div className="text-violet-600 font-bold">{p.price} EGP</div>
                       <div className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${!p.stock || p.stock <= 0 ? 'bg-red-100 text-red-600' : p.stock < 5 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                          <Box size={12}/> {p.stock ? `${p.stock} Left` : 'Out of Stock'}
                       </div>
                    </div>
                    {p.fitType && <span className="text-[10px] text-slate-400 block mt-1">Fit: {p.fitType}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEditing(p)} className="text-violet-500 hover:bg-violet-50 p-2 rounded-xl transition"><Edit size={20} /></button>
                  <button onClick={() => handleDeleteProduct(p.id)} className="text-red-400 hover:bg-red-50 p-2 rounded-xl transition"><Trash2 size={20} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
            <div className="bg-white/80 p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                <Search className="text-slate-400" size={20}/>
                <input type="text" placeholder="Search Order ID or Phone..." className="w-full bg-transparent outline-none text-slate-700 font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="space-y-4">
            {filteredOrders.length === 0 ? <div className="text-center py-10 text-slate-400">No orders matching.</div> :
              filteredOrders.map(o => (
                <div key={o.id} className="bg-white/80 p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-6 hover:shadow-md transition">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-violet-600 text-white text-xs px-2 py-1 rounded-md font-bold tracking-wider">{o.orderId || 'N/A'}</span>
                            <span className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-xl">{o.customer?.name}</h3>
                        {o.discountApplied && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold flex items-center gap-1 w-fit mt-1"><TicketPercent size={12}/> {o.discountApplied.code}</span>}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="font-black text-violet-600 text-2xl">{o.total} EGP</div>
                            <div className="text-xs text-slate-400 font-bold">{o.items?.length || 0} Items</div>
                        </div>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <Phone size={18} className="text-violet-400"/>
                            <span className="font-bold tracking-wider">{o.customer?.phone}</span>
                            <a href={getWhatsAppLink(o)} target="_blank" rel="noreferrer" className="ml-auto bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition">
                                <MessageCircle size={14}/> Chat
                            </a>
                        </div>
                        <div className="flex items-start gap-2 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <MapPin size={18} className="text-violet-400 mt-1"/>
                            <div>
                                <div className="font-bold text-sm">{o.customer?.governorate}</div>
                                <div className="text-xs text-slate-500">{o.customer?.address}</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 justify-center">
                        <div className={`text-center py-2 rounded-xl font-bold text-sm mb-2 ${o.status === 'Delivered' ? 'bg-green-100 text-green-700' : o.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            Status: {o.status}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => handleUpdateStatus(o.id, 'Shipped')} className="bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg text-xs font-bold transition">Ship 🚚</button>
                            <button onClick={() => handleUpdateStatus(o.id, 'Delivered')} className="bg-green-50 hover:bg-green-100 text-green-600 py-2 rounded-lg text-xs font-bold transition">Deliver ✅</button>
                            <button onClick={() => handleUpdateStatus(o.id, 'Rejected')} className="bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-xs font-bold transition">Reject ❌</button>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {o.items?.map((item, i) => (
                        <div key={i} className="flex-shrink-0 w-16 relative group" title={item.name}>
                            <img src={item.image} className="w-16 h-16 rounded-xl object-cover border border-slate-100" alt=""/>
                            <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-tl-lg font-bold">x{item.quantity}</span>
                        </div>
                    ))}
                </div>
                </div>
              ))}
            </div>
        </div>
      )}
      
      {/* TAB: PROMOS */}
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
                {promoCodes.length === 0 && <div className="text-center py-10 text-slate-400">No promo codes found.</div>}
            </div>
        </div>
      )}

      {/* TAB: MESSAGES */}
      {activeTab === 'messages' && (
        <div className="grid gap-4">
          {messages.length === 0 && <div className="text-center py-10 text-slate-400">No messages yet.</div>}
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

      {/* TAB: ANALYTICS */}
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
    </div>
  );
};

export default AdminDashboard;