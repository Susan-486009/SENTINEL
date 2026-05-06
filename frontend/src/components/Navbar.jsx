import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, LogOut, LayoutDashboard,
  Settings, ChevronDown, ShieldCheck, 
  UserCircle
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
    const handleScroll = () => setScrolled(window.scrollY > 10);
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
    toast.info('Session ended');
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
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-200 ${
      scrolled ? 'bg-white border-b border-slate-200 py-2 shadow-sm' : 'bg-transparent py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200 ${
              scrolled ? 'bg-blue-600' : 'bg-white shadow-sm'
            }`}>
              <ShieldCheck className={`w-5 h-5 ${scrolled ? 'text-white' : 'text-blue-600'}`} />
            </div>
            <div>
              <span className="block text-lg font-bold tracking-tight text-slate-900 leading-none">LASUSTECH</span>
              <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Support Portal</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.to}
                onClick={() => handleNavClick(link.to)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'text-blue-600 bg-blue-50/50'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="w-px h-4 bg-slate-200 mx-3" />

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 pl-2 pr-1.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-[11px]">
                    {user?.name?.[0]}
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-md border border-slate-200 p-1.5 overflow-hidden"
                    >
                      <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase">Account</p>
                        <p className="text-xs font-medium text-slate-900 truncate">{user?.email}</p>
                      </div>
                      
                      <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      
                      <div className="h-px bg-slate-100 my-1" />
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900">
                  Login
                </Link>
                <Link to="/register" className="btn-primary py-2 px-6">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.to}
                  onClick={() => handleNavClick(link.to)}
                  className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  {link.label}
                </button>
              ))}
              
              <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                {isAuthenticated ? (
                  <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50">
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center py-3 rounded-lg text-sm font-medium text-slate-600 border border-slate-200">
                      Login
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center py-3 rounded-lg text-sm font-medium bg-blue-600 text-white shadow-sm">
                      Sign Up
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
