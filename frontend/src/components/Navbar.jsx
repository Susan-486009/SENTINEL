import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, LogOut, LayoutDashboard,
  Settings, ChevronDown, User, ClipboardList,
  Search, ShieldCheck, GraduationCap, Building2,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const NAV_LINKS = [
  { to: '/',       label: 'Home' },
  { to: '/submit', label: 'Report Issue' },
  { to: '/track',  label: 'Track Status' },
  { to: '#about',  label: 'About' },
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
    toast.info('Logged Out');
    navigate('/login');
  };

  const handleNavClick = (to) => {
    if (to.startsWith('#')) {
      const el = document.getElementById(to.substring(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (location.pathname !== '/') {
        navigate('/', { state: { scrollTo: to.substring(1) } });
      }
    } else {
      navigate(to);
    }
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-100 py-3 shadow-sm' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              scrolled ? 'bg-blue-600 shadow-blue-200 shadow-xl' : 'bg-white shadow-md'
            }`}>
              <ShieldCheck className={`w-6 h-6 transition-colors ${scrolled ? 'text-white' : 'text-blue-600'}`} />
            </div>
            <div>
              <span className="block text-xl font-black tracking-tighter uppercase leading-none text-slate-900">LASUSTECH</span>
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${
                scrolled ? 'text-blue-600' : 'text-blue-500'
              }`}>Support Portal</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {NAV_LINKS.map((link) => (
              <button
                key={link.to}
                onClick={() => handleNavClick(link.to)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  location.pathname === link.to
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="w-px h-6 bg-slate-100 mx-4" />

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full bg-white border border-slate-100 hover:border-blue-200 transition-all shadow-sm group"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform">
                    {user?.name?.[0]}
                  </div>
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-500 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-3 overflow-hidden"
                    >
                      <div className="px-5 py-4 border-b border-slate-50 mb-3 bg-slate-50/50 rounded-2xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Signed In As</p>
                        <p className="text-[11px] font-bold text-slate-900 truncate uppercase">{user?.email}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-[11px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all group">
                          <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          Control Panel
                        </Link>
                        <Link to="/settings" className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-[11px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all group">
                          <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                          Account Settings
                        </Link>
                      </div>
                      
                      <div className="h-px bg-slate-50 my-3" />
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[11px] font-black text-red-500 hover:bg-red-50 transition-all uppercase tracking-widest"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
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
                <Link to="/register" className="px-8 py-3 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-3 rounded-2xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-10 space-y-4">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.to}
                  onClick={() => handleNavClick(link.to)}
                  className="flex items-center gap-5 w-full px-6 py-5 rounded-2xl text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all"
                >
                  {link.label}
                </button>
              ))}
              
              <div className="pt-6 border-t border-slate-50 space-y-4">
                {isAuthenticated ? (
                  <>
                    <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setIsOpen(false)} className="flex items-center gap-5 px-6 py-5 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50">
                      <LayoutDashboard className="w-5 h-5" />
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-5 px-6 py-5 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50">
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center py-5 rounded-2xl text-sm font-bold text-slate-600 border-2 border-slate-100">
                      Login
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center py-5 rounded-2xl text-sm font-bold bg-blue-600 text-white shadow-xl shadow-blue-100">
                      Register
                    </Link>
                  </div>
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
