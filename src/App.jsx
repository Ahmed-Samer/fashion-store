import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom'; // 1. ضفنا useLocation
import { onAuthStateChanged, signInAnonymously, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { auth, db, getAppId } from './firebase';
import { CheckCircle, XCircle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion'; // 2. استدعاء مكتبة الحركة

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EnhancedBackground from './components/EnhancedBackground';
import AIStylist from './components/AIStylist';
import SEO from './components/SEO';
import PageTransition from './components/PageTransition'; // 3. استدعاء المكون الجديد

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
import Wishlist from './pages/Wishlist';
import TrackOrder from './pages/TrackOrder';

export default function App() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const appId = getAppId();
  
  // 4. لازم نعرف مكاننا فين عشان الأنيميشن يشتغل
  const location = useLocation();

  const [cart, setCart] = useState(() => {
    try { const saved = localStorage.getItem('fashion-store-cart'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('fashion-store-cart', JSON.stringify(cart)); }, [cart]);

  const [wishlist, setWishlist] = useState(() => {
    try { const saved = localStorage.getItem('fashion-store-wishlist'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('fashion-store-wishlist', JSON.stringify(wishlist)); }, [wishlist]);

  const toggleWishlist = (product) => {
    const exists = wishlist.find(p => p.id === product.id);
    if (exists) { setWishlist(wishlist.filter(p => p.id !== product.id)); showNotification('Removed from Wishlist 💔'); } 
    else { setWishlist([...wishlist, product]); showNotification('Added to Wishlist ❤️'); }
  };

  useEffect(() => { signInAnonymously(auth).catch(console.error); const unsub = onAuthStateChanged(auth, setUser); return () => unsub(); }, []);

  useEffect(() => {
    const productsRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
    const unsubProd = onSnapshot(query(productsRef), (s) => setProducts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubProd(); };
  }, [appId]);

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
      <Navbar user={user} cartCount={cart.reduce((a,i)=>a+i.quantity,0)} wishlistCount={wishlist.length} handleLogin={handleLogin} />

      <main className="relative z-10 min-h-[80vh] pt-4 pb-12">
        {/* 5. تغليف الراوتر بـ AnimatePresence عشان يدير الخروج والدخول */}
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
            
            {/* 6. تغليف كل صفحة بـ PageTransition */}
            <Route path="/" element={<PageTransition><SEO title="Home" /><Home products={products} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} /></PageTransition>} />
            <Route path="/product/:id" element={<PageTransition><ProductDetails products={products} addToCart={addToCart} /></PageTransition>} />
            <Route path="/cart" element={<PageTransition><SEO title="My Bag" /><Cart cart={cart} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} calculateTotal={calculateTotal} /></PageTransition>} />
            <Route path="/wishlist" element={<PageTransition><SEO title="My Wishlist" /><Wishlist wishlist={wishlist} removeFromWishlist={(id) => toggleWishlist({id})} addToCart={addToCart} /></PageTransition>} />
            <Route path="/checkout" element={<PageTransition><SEO title="Checkout" /><Checkout user={user} cart={cart} calculateTotal={calculateTotal} setCart={setCart} showNotification={showNotification} /></PageTransition>} />
            <Route path="/thank-you" element={<PageTransition><ThankYou /></PageTransition>} />
            <Route path="/profile" element={<PageTransition><SEO title="Profile" /><UserProfile user={user} showNotification={showNotification} /></PageTransition>} />
            <Route path="/about" element={<PageTransition><SEO title="Our Story" /><About /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><SEO title="Contact Us" /><Contact user={user} /></PageTransition>} />
            <Route path="/returns" element={<PageTransition><SEO title="Returns Policy" /><Returns /></PageTransition>} />
            <Route path="/track-order" element={<PageTransition><SEO title="Track Order" /><TrackOrder /></PageTransition>} />
            <Route path={SECRET_ADMIN_ROUTE} element={<PageTransition><SEO title="Admin Login" /><AdminLogin setIsAdmin={setIsAdmin} /></PageTransition>} />
            <Route path="/admin" element={isAdmin ? <PageTransition><SEO title="Dashboard" /><AdminDashboard user={user} products={products} showNotification={showNotification} /></PageTransition> : <Navigate to="/" replace />} />
            
            </Routes>
        </AnimatePresence>
      </main>
      <AIStylist products={products} addToCart={addToCart} />
      <Footer />
      {notification.show && <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full shadow-2xl text-white z-[100] flex items-center gap-3 animate-fade-in-up font-bold backdrop-blur-md border border-white/20 ${notification.type === 'error' ? 'bg-red-500/90' : 'bg-slate-900/90'}`}>{notification.type === 'error' ? <XCircle size={20}/> : <CheckCircle size={20} className="text-green-400"/>} {notification.message}</div>}
    </div>
  );
}