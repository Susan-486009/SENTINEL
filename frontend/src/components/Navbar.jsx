import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, LogOut, LayoutDashboard,
  Settings, ChevronDown, User, ClipboardList,
  Search, Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const NAV_LINKS = [
  { to: '/',       label: 'Home' },
  { to: '/submit', label: 'Send Report', icon: ClipboardList },
  { to: '/track',  label: 'Follow up',   icon: Search },
];

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); setDropdownOpen(false); }, [location.pathname]);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    toast.info('Session Terminated.');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B1120]/80 backdrop-blur-xl border-b border-slate-800/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-transform group-hover:scale-105">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
               <span className="text-lg font-black text-white tracking-tighter uppercase italic leading-none group-hover:text-blue-500 transition-colors">
                 Sentinel
               </span>
               <span className="text-[7px] font-black text-slate-700 tracking-[0.4em] uppercase italic mt-1">Core_Infrastructure</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic transition-all duration-300 border ${
                  isActive(to)
                    ? 'bg-blue-600/10 border-blue-500/20 text-blue-500 shadow-inner'
                    : 'text-slate-500 border-transparent hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {label}
              </Link>
            ))}
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic transition-all duration-300 border ${
                  isActive('/admin')
                    ? 'bg-blue-600/10 border-blue-500/20 text-blue-500'
                    : 'text-slate-500 border-transparent hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Shield className="w-3 h-3" />
                Admin_Gate
              </Link>
            )}
          </div>

          {/* Auth Area */}
          <div className="hidden md:flex items-center gap-5">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className={`flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-2xl transition-all duration-300 border ${dropdownOpen ? 'bg-slate-900 border-slate-700 shadow-2xl' : 'bg-transparent border-transparent hover:bg-slate-900 hover:border-slate-800'}`}
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500 text-[10px] font-black flex items-center justify-center">
                    {initials}
                  </div>
                  <div className="text-left hidden lg:block">
                     <p className="text-[10px] font-black text-white uppercase italic tracking-tight">{user?.name?.split(' ')[0]}</p>
                     <p className="text-[7px] font-black text-slate-700 uppercase tracking-widest">{user?.role?.toUpperCase()}_LEVEL</p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-700 transition-transform duration-300 ${dropdownOpen ? 'rotate-180 text-blue-500' : ''}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 top-full mt-3 w-56 bg-[#0B1120] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden py-2 z-50"
                    >
                      <div className="px-5 py-4 border-b border-slate-800/60 bg-slate-950/40 mb-2">
                        <p className="text-[9px] font-black text-white uppercase italic tracking-widest truncate">{user?.name}</p>
                        <p className="text-[7px] text-slate-700 font-black uppercase tracking-[0.3em] mt-1 italic">ID: {user?.id?.toUpperCase()}</p>
                      </div>

                      <Link to="/dashboard" className="flex items-center gap-3 px-5 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest italic hover:text-white hover:bg-slate-800/40 transition-colors">
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        Dashboard_Node
                      </Link>
                      <Link to="/settings" className="flex items-center gap-3 px-5 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest italic hover:text-white hover:bg-slate-800/40 transition-colors">
                        <Settings className="w-3.5 h-3.5" />
                        System_Config
                      </Link>

                      <div className="border-t border-slate-800/60 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-5 py-3 text-[9px] font-black text-red-500 uppercase tracking-widest italic hover:bg-red-500/5 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Term_Session
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="px-6 py-2.5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic border border-slate-800 rounded-xl hover:text-white hover:border-slate-600 transition-all"
                >
                  Auth_Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 text-[9px] font-black text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all uppercase tracking-[0.2em] italic"
                >
                  Join_Network
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburguer */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-900/50 transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-[#0B1120] border-t border-slate-800 shadow-2xl"
          >
            <div className="px-4 py-6 space-y-2">
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3.5 px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-colors ${
                    isActive(to)
                      ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20'
                      : 'text-slate-500 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {label}
                </Link>
              ))}

              <div className="border-t border-slate-800 pt-6 mt-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-4 px-5 py-4 mb-4 bg-slate-900/40 rounded-2xl border border-slate-800">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                        {initials}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-white uppercase italic">{user?.name}</p>
                        <p className="text-[7px] text-slate-700 font-black uppercase tracking-[0.3em] mt-0.5">{user?.role}_LEVEL</p>
                      </div>
                    </div>
                    <Link to="/dashboard" className="flex items-center gap-3.5 px-5 py-4 rounded-xl text-[10px] font-black text-slate-500 uppercase italic hover:bg-slate-900">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard_Node
                    </Link>
                    <Link to="/settings" className="flex items-center gap-3.5 px-5 py-4 rounded-xl text-[10px] font-black text-slate-500 uppercase italic hover:bg-slate-900">
                      <Settings className="w-4 h-4" /> System_Config
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3.5 px-5 py-4 rounded-xl text-[10px] font-black text-red-500 uppercase italic hover:bg-red-500/5 mt-2"
                    >
                      <LogOut className="w-4 h-4" /> Term_Session
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link to="/login"    className="text-center px-5 py-4 bg-slate-900 border border-slate-800 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic hover:text-white transition-all">Auth_Login</Link>
                    <Link to="/register" className="text-center px-5 py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic shadow-lg shadow-blue-900/20">Join_Network</Link>
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
