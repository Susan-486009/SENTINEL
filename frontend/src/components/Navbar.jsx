import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, LogOut, LayoutDashboard,
  Settings, ChevronDown, User, ClipboardList,
  Search, Shield, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const NAV_LINKS = [
  { to: '/',       label: 'Home' },
  { to: '/submit', label: 'Report Issue', icon: ClipboardList },
  { to: '/track',  label: 'Track Status',   icon: Search },
];

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.info('Session Terminated');
    navigate('/login');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-100 py-3 shadow-sm' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              scrolled ? 'bg-blue-600 shadow-blue-200 shadow-lg' : 'bg-white shadow-sm'
            }`}>
              <ShieldCheck className={`w-6 h-6 transition-colors ${scrolled ? 'text-white' : 'text-blue-600'}`} />
            </div>
            <div>
              <span className={`block text-xl font-black tracking-tighter uppercase leading-none transition-colors ${
                scrolled ? 'text-slate-900' : 'text-slate-900'
              }`}>SENTINEL</span>
              <span className={`text-[8px] font-black uppercase tracking-[0.3em] transition-colors ${
                scrolled ? 'text-blue-600' : 'text-blue-500'
              }`}>University_Support</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  location.pathname === link.to
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="w-px h-6 bg-slate-100 mx-4" />

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 transition-all shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">
                    {user?.name?.[0]}
                  </div>
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-50 mb-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Identity</p>
                        <p className="text-[11px] font-bold text-slate-900 truncate uppercase">{user?.email}</p>
                      </div>
                      
                      <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                        <Settings className="w-4 h-4" />
                        Preferences
                      </Link>
                      
                      <div className="h-px bg-slate-50 my-2" />
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Terminate Session
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-6 py-2.5 text-xs font-bold text-slate-600 hover:text-blue-600 uppercase tracking-widest transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-600"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-8 space-y-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  {link.icon && <link.icon className="w-5 h-5" />}
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-slate-50 space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50">
                      <LayoutDashboard className="w-5 h-5" />
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50">
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center py-4 rounded-2xl text-sm font-bold text-slate-600 border border-slate-100">
                      Login
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)} className="block w-full text-center py-4 rounded-2xl text-sm font-bold bg-blue-600 text-white shadow-lg">
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
