import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogIn, ShoppingBag, Menu, X } from 'lucide-react';

const Navbar = ({ user, cartCount, handleLogin }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);
  const isLoggedIn = user && !user.isAnonymous;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-white/40 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 md:px-4 h-20 flex items-center justify-between">
        
        {/* ================= 1. LEFT GROUP (Logo + Links) ================= */}
        <div className="flex items-center gap-4 md:gap-12">
            
            {/* A. Logo + Name */}
            <Link to="/" className="flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={closeMenu}>
                <div className="w-9 h-9 md:w-10 md:h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-lg md:text-xl shadow-lg transform group-hover:rotate-6 transition duration-300 flex-shrink-0">M</div>
                
                <span className="text-lg md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight whitespace-nowrap">
                  Modern Style
                </span>
            </Link>

            {/* B. Desktop Links */}
            <div className="hidden md:flex items-center gap-6">
                {['Home', 'About', 'Contact', 'Returns'].map(link => (
                    <Link 
                        key={link} 
                        to={link === 'Home' ? '/' : `/${link.toLowerCase()}`} 
                        className="text-sm font-bold text-slate-500 hover:text-violet-600 transition relative group"
                    >
                        {link}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-600 transition-all group-hover:w-full"></span>
                    </Link>
                ))}
            </div>
        </div>

        {/* ================= 2. RIGHT GROUP (Actions + Cart) ================= */}
        <div className="flex items-center gap-3 md:gap-5">
          
          {/* A. Mobile Home Text */}
          <Link 
            to="/" 
            className="md:hidden text-sm font-bold text-slate-600 hover:text-violet-600 transition uppercase tracking-wide"
            onClick={closeMenu}
          >
            Home
          </Link>

          {/* B. User Profile / Login Button */}
          {/* --- Desktop --- */}
          <button 
                onClick={() => isLoggedIn ? navigate('/profile') : handleLogin()} 
                className={`hidden md:block p-2 rounded-full transition ${isLoggedIn ? 'text-violet-600 bg-violet-50' : 'text-slate-400 hover:text-violet-600'}`}
                title={isLoggedIn ? "Profile" : "Login"}
          >
                <User size={20}/>
          </button>
          
          {/* --- Mobile --- */}
          {isLoggedIn ? (
            <button 
                onClick={() => { navigate('/profile'); closeMenu(); }} 
                className="md:hidden w-8 h-8 rounded-full border border-slate-200 overflow-hidden flex-shrink-0"
            >
                {user.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-500"><User size={16}/></div>
                )}
            </button>
          ) : (
            <button 
                onClick={() => { handleLogin(); closeMenu(); }} 
                className="md:hidden px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-full shadow-md hover:bg-slate-800 transition flex items-center gap-1 whitespace-nowrap"
            >
               Login
            </button>
          )}

          {/* تم حذف أيقونة الأدمن من هنا نهائياً 
              Admin Link Removed
          */}

          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

          {/* D. Cart Icon */}
          <div className="relative cursor-pointer group p-1" onClick={() => { navigate('/cart'); closeMenu(); }}>
            <ShoppingBag className="text-slate-700 group-hover:text-violet-600 transition" size={24}/>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm border border-white animate-scale-in">
                {cartCount}
              </span>
            )}
          </div>

          {/* E. Menu Button (Mobile Only) */}
          <button 
            className="md:hidden p-1 text-slate-700 hover:bg-slate-100 rounded-lg transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 shadow-xl animate-fade-in-up">
          <div className="flex flex-col p-4 space-y-2">
            {['About', 'Contact', 'Returns'].map(link => (
              <Link 
                key={link} 
                to={`/${link.toLowerCase()}`} 
                className="p-3 rounded-xl font-bold text-slate-600 hover:bg-violet-50 hover:text-violet-600 transition flex items-center gap-3"
                onClick={closeMenu}
              >
                <span>{link}</span>
              </Link>
            ))}
            
            <hr className="border-slate-100 my-2"/>
            
            <button 
                onClick={() => { isLoggedIn ? navigate('/profile') : handleLogin(); closeMenu(); }}
                className={`flex items-center gap-3 p-3 rounded-xl font-bold text-sm w-full text-left ${isLoggedIn ? 'bg-violet-50 text-violet-700' : 'bg-slate-50 text-slate-700'}`}
            >
                <User size={18}/> {isLoggedIn ? 'My Profile' : 'Login / Register'}
            </button>

            {/* تم حذف رابط الأدمن من قائمة الموبايل أيضاً
                Admin Link Removed from Mobile Menu
            */}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;