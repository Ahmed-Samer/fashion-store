import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, ShoppingBag, Menu, X, Heart, Home as HomeIcon, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ user, cartCount, wishlistCount, handleLogin }) => {
  const navigate = useNavigate();
  const location = useLocation(); // عشان نعرف إحنا في أي صفحة ونلون اللينك
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // استدعاء الـ Theme Context للتحكم في الوضع الليلي
  const { theme, toggleTheme } = useTheme();

  const closeMenu = () => setIsMenuOpen(false);
  const isLoggedIn = user && !user.isAnonymous;

  // دالة مساعدة لتحديد اللينك النشط
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-white/40 dark:border-slate-800 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 md:px-4 h-20 flex items-center justify-between">
        
        {/* ================= 1. LEFT GROUP (Logo + Links) ================= */}
        <div className="flex items-center gap-4 md:gap-12">
            
            {/* A. Logo + Name */}
            <Link to="/" className="flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={closeMenu}>
                <div className="w-9 h-9 md:w-10 md:h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center font-bold text-lg md:text-xl shadow-lg transform group-hover:rotate-6 transition duration-300 flex-shrink-0">M</div>
                
                <span className="text-lg md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight whitespace-nowrap">
                  Modern Style
                </span>
            </Link>

            {/* B. Desktop Links (مخفي في الموبايل) */}
            <div className="hidden md:flex items-center gap-6">
                {['Home', 'About', 'Contact', 'Returns'].map(link => {
                    const path = link === 'Home' ? '/' : `/${link.toLowerCase()}`;
                    return (
                        <Link 
                            key={link} 
                            to={path} 
                            className={`text-sm font-bold transition relative group ${isActive(path) ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400'}`}
                        >
                            {link}
                            {/* الخط اللي بيظهر تحت اللينك */}
                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-violet-600 dark:bg-violet-400 transition-all duration-300 ${isActive(path) ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                        </Link>
                    );
                })}
            </div>
        </div>

        {/* ================= 2. RIGHT GROUP (Actions + Cart) ================= */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            aria-label="Toggle theme"
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
          >
            {theme === 'dark' ? 
                <Sun size={20} className="text-yellow-400 animate-spin-slow" /> : 
                <Moon size={20} className="text-slate-600 group-hover:text-violet-600" />
            }
          </button>

          {/* Mobile Home Icon */}
          <Link 
            to="/" 
            aria-label="Home"
            className="md:hidden p-1 text-slate-600 dark:text-slate-300 hover:text-violet-600 transition"
            onClick={closeMenu}
          >
            <HomeIcon size={24} />
          </Link>

          {/* Wishlist Icon */}
          <div className="relative cursor-pointer group p-1" onClick={() => { navigate('/wishlist'); closeMenu(); }} role="button" aria-label="View wishlist">
            <Heart className="text-slate-700 dark:text-slate-200 group-hover:text-red-500 transition" size={24}/>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm border border-white dark:border-slate-900 animate-scale-in">
                {wishlistCount}
              </span>
            )}
          </div>

          {/* Cart Icon */}
          <div className="relative cursor-pointer group p-1" onClick={() => { navigate('/cart'); closeMenu(); }} role="button" aria-label="View cart">
            <ShoppingBag className="text-slate-700 dark:text-slate-200 group-hover:text-violet-600 transition" size={24}/>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm border border-white dark:border-slate-900 animate-scale-in">
                {cartCount}
              </span>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

          {/* User Profile / Login Button (DESKTOP) */}
          <button 
                onClick={() => isLoggedIn ? navigate('/profile') : handleLogin()} 
                aria-label="User profile"
                className={`hidden md:block p-2 rounded-full transition ${isLoggedIn ? 'text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-300' : 'text-slate-400 hover:text-violet-600'}`}
                title={isLoggedIn ? "Profile" : "Login"}
          >
                <User size={20}/>
          </button>

          {/* Menu Button (Mobile Only) */}
          <button 
            aria-label="Toggle menu"
            className="md:hidden p-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-xl animate-fade-in-up">
          <div className="flex flex-col p-4 space-y-2">
            
            {/* Login / Profile (Mobile) */}
            <button 
                onClick={() => { isLoggedIn ? navigate('/profile') : handleLogin(); closeMenu(); }}
                className={`flex items-center gap-3 p-3 rounded-xl font-bold text-sm w-full text-left mb-2 ${isLoggedIn ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'}`}
            >
                <User size={18}/> {isLoggedIn ? 'My Profile' : 'Login / Register'}
            </button>

            <hr className="border-slate-100 dark:border-slate-800 my-2"/>

            {/* Links (Mobile) */}
            {['Home', 'About', 'Contact', 'Returns'].map(link => (
              <Link 
                key={link} 
                to={link === 'Home' ? '/' : `/${link.toLowerCase()}`} 
                className="p-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400 transition flex items-center gap-3"
                onClick={closeMenu}
              >
                <span>{link}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;