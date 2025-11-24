import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signInAnonymously, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { auth, db, getAppId } from './firebase';
import { CheckCircle, XCircle } from 'lucide-react';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EnhancedBackground from './components/EnhancedBackground';
import AIStylist from './components/AIStylist';
import SEO from './components/SEO';

// Pages
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ThankYou from './pages/ThankYou';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import UserProfile from './pages/UserProfile';
import About from './pages/About';
import Contact from './pages/Contact';
import Returns from './pages/Returns';
import Wishlist from './pages/Wishlist'; // 1. استيراد Wishlist

export default function App() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const appId = getAppId();

  // --- Cart Logic ---
  const [cart, setCart] = useState(() => {
    try { const saved = localStorage.getItem('fashion-store-cart'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('fashion-store-cart', JSON.stringify(cart)); }, [cart]);

  // --- Wishlist Logic (الجديد) ---
  const [wishlist, setWishlist] = useState(() => {
    try { const saved = localStorage.getItem('fashion-store-wishlist'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('fashion-store-wishlist', JSON.stringify(wishlist)); }, [wishlist]);

  const toggleWishlist = (product) => {
    const exists = wishlist.find(p => p.id === product.id);
    if (exists) {
        setWishlist(wishlist.filter(p => p.id !== product.id));
        showNotification('Removed from Wishlist 💔');
    } else {
        setWishlist([...wishlist, product]);
        showNotification('Added to Wishlist ❤️');
    }
  };

  // --- Auth & Data ---
  useEffect(() => { signInAnonymously(auth).catch(console.error); const unsub = onAuthStateChanged(auth, setUser); return () => unsub(); }, []);
  useEffect(() => {
    const unsubProd = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'products')), (s) => setProducts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubOrd = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), orderBy('createdAt', 'desc')), (s) => setOrders(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubProd(); unsubOrd(); };
  }, [appId]);

  // --- Handlers ---
  const addToCart = (itemOrItems, quantity = 1) => {
    let items = Array.isArray(itemOrItems) ? itemOrItems : [{...itemOrItems}];
    let newCart = [...cart];
    items.forEach(p => {
        const qty = p.quantity || quantity;
        const ex = newCart.findIndex(i => i.id === p.id);
        if (ex > -1) newCart[ex].quantity += qty; else newCart.push({ ...p, quantity: qty });
    });
    setCart(newCart);
    showNotification(items.length > 1 ? 'Full Look added! ✨' : `Added to bag 👜`);
  };
  const updateCartQuantity = (i, c) => { const nc = [...cart]; const nq = nc[i].quantity + c; if (nq > 0) { nc[i].quantity = nq; setCart(nc); } };
  const removeFromCart = (i) => setCart(cart.filter((_, idx) => idx !== i));
  const calculateTotal = () => cart.reduce((t, i) => t + (Number(i.price) * i.quantity), 0);
  const showNotification = (msg, type='success') => { setNotification({ show: true, message: msg, type }); setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000); };
  const handleLogin = async () => { try { await signInWithPopup(auth, new GoogleAuthProvider()); showNotification('Welcome back!'); } catch { showNotification('Login failed', 'error'); } };

  const SECRET_ADMIN_ROUTE = "/admin-ahmedsamer-dashboard-fashionstore-@9746313";

  return (
    <div className="min-h-screen font-sans text-slate-800 relative overflow-x-hidden selection:bg-violet-200 selection:text-violet-900" dir="ltr">
      <EnhancedBackground />
      {/* مررنا wishlist للنافبار عشان نعرض العدد */}
      <Navbar user={user} cartCount={cart.reduce((a,i)=>a+i.quantity,0)} wishlistCount={wishlist.length} handleLogin={handleLogin} />

      <main className="relative z-10 min-h-[80vh] pt-4 pb-12">
        <Routes>
          <Route path="/" element={<><SEO title="Home" /><Home products={products} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} /></>} />
          <Route path="/product/:id" element={<><ProductDetails products={products} addToCart={addToCart} /></>} />
          <Route path="/cart" element={<><SEO title="My Bag" /><Cart cart={cart} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} calculateTotal={calculateTotal} /></>} />
          <Route path="/wishlist" element={<><SEO title="My Wishlist" /><Wishlist wishlist={wishlist} removeFromWishlist={(id) => toggleWishlist({id})} addToCart={addToCart} /></>} />
          <Route path="/checkout" element={<><SEO title="Checkout" /><Checkout user={user} cart={cart} calculateTotal={calculateTotal} setCart={setCart} showNotification={showNotification} /></>} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/profile" element={<><SEO title="Profile" /><UserProfile user={user} showNotification={showNotification} /></>} />
          <Route path="/about" element={<><SEO title="Our Story" /><About /></>} />
          <Route path="/contact" element={<><SEO title="Contact Us" /><Contact user={user} /></>} />
          <Route path="/returns" element={<><SEO title="Returns Policy" /><Returns /></>} />
          <Route path={SECRET_ADMIN_ROUTE} element={<><SEO title="Admin Login" /><AdminLogin setIsAdmin={setIsAdmin} /></>} />
          <Route path="/admin" element={isAdmin ? <><SEO title="Dashboard" /><AdminDashboard user={user} products={products} orders={orders} showNotification={showNotification} /></> : <Navigate to="/" replace />} />
        </Routes>
      </main>
      <AIStylist products={products} addToCart={addToCart} />
      <Footer />
      {notification.show && <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full shadow-2xl text-white z-[100] flex items-center gap-3 animate-fade-in-up font-bold backdrop-blur-md border border-white/20 ${notification.type === 'error' ? 'bg-red-500/90' : 'bg-slate-900/90'}`}>{notification.type === 'error' ? <XCircle size={20}/> : <CheckCircle size={20} className="text-green-400"/>} {notification.message}</div>}
    </div>
  );
}