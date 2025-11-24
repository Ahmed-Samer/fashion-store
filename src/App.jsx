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

// Pages
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import UserProfile from './pages/UserProfile';
import About from './pages/About';
import Contact from './pages/Contact';
import Returns from './pages/Returns';

export default function App() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const appId = getAppId();

  // 🛒 تعديل 1: تحميل السلة من الذاكرة عند البدء
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('fashion-store-cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      console.error("Error loading cart:", e);
      return [];
    }
  });

  // 🛒 تعديل 2: حفظ السلة في الذاكرة كلما تغيرت
  useEffect(() => {
    localStorage.setItem('fashion-store-cart', JSON.stringify(cart));
  }, [cart]);

  // --- 1. Authentication ---
  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    const unsubscribeAuth = onAuthStateChanged(auth, setUser);
    return () => unsubscribeAuth();
  }, []);

  // --- 2. Data Fetching ---
  useEffect(() => {
    const productsRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
    const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
    
    const unsubProd = onSnapshot(query(productsRef), (s) => setProducts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubOrd = onSnapshot(query(ordersRef, orderBy('createdAt', 'desc')), (s) => setOrders(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    return () => { unsubProd(); unsubOrd(); };
  }, [appId]);

  // --- 3. Cart Logic ---
  const addToCart = (itemOrItems, quantity = 1) => {
    let itemsToAdd = Array.isArray(itemOrItems) ? itemOrItems : [{...itemOrItems}];
    let newCart = [...cart];
    
    itemsToAdd.forEach(product => {
        const qtyToAdd = product.quantity || quantity;
        const existing = newCart.findIndex(item => item.id === product.id);
        
        if (existing > -1) { 
            newCart[existing].quantity += qtyToAdd; 
        } else { 
            newCart.push({ ...product, quantity: qtyToAdd }); 
        }
    });
    
    setCart(newCart);
    showNotification(itemsToAdd.length > 1 ? '✨ Full Look added to bag!' : `Added ${itemsToAdd[0].name} to cart`);
  };

  const updateCartQuantity = (idx, chg) => { 
    const newCart = [...cart]; 
    const nq = newCart[idx].quantity + chg; 
    if (nq > 0) { newCart[idx].quantity = nq; setCart(newCart); } 
  };
  
  const removeFromCart = (idx) => setCart(cart.filter((_, i) => i !== idx));
  const calculateTotal = () => cart.reduce((t, i) => t + (Number(i.price) * i.quantity), 0);
  
  const showNotification = (msg, type = 'success') => { 
    setNotification({ show: true, message: msg, type }); 
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000); 
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      showNotification('Welcome back! 👋');
    } catch (error) {
      console.error(error);
      showNotification('Login failed', 'error');
    }
  };

  // 🔒 الرابط السري
  const SECRET_ADMIN_ROUTE = "/admin-ahmedsamer-dashboard-fashionstore-@9746313";

  return (
    <div className="min-h-screen font-sans text-slate-800 relative overflow-x-hidden selection:bg-violet-200 selection:text-violet-900" dir="ltr">
      <EnhancedBackground />
      
      <Navbar 
        user={user} 
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} 
        handleLogin={handleLogin}
      />

      <main className="relative z-10 min-h-[80vh] pt-4 pb-12">
        <Routes>
          <Route path="/" element={<Home products={products} addToCart={addToCart} />} />
          <Route path="/product/:id" element={<ProductDetails products={products} addToCart={addToCart} />} />
          <Route path="/cart" element={<Cart cart={cart} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} calculateTotal={calculateTotal} />} />
          <Route path="/checkout" element={<Checkout user={user} cart={cart} calculateTotal={calculateTotal} setCart={setCart} showNotification={showNotification} />} />
          <Route path="/profile" element={<UserProfile user={user} showNotification={showNotification} />} />
          
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact user={user} />} />
          <Route path="/returns" element={<Returns />} />
          
          {/* مسار الدخول السري */}
          <Route path={SECRET_ADMIN_ROUTE} element={<AdminLogin setIsAdmin={setIsAdmin} />} />
          
          {/* مسار الأدمن المحمي */}
          <Route 
            path="/admin" 
            element={
              isAdmin ? (
                <AdminDashboard user={user} products={products} orders={orders} showNotification={showNotification} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

        </Routes>
      </main>

      {/* Global Elements */}
      <AIStylist products={products} addToCart={addToCart} />
      <Footer />

      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-8 py-4 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.2)] text-white z-[100] flex items-center gap-3 animate-fade-in-up font-bold tracking-wide backdrop-blur-md border border-white/20 ${notification.type === 'error' ? 'bg-red-500/90' : 'bg-slate-900/90'}`}>
          {notification.type === 'error' ? <XCircle size={20}/> : <CheckCircle size={20} className="text-green-400"/>} 
          {notification.message}
        </div>
      )}
    </div>
  );
}