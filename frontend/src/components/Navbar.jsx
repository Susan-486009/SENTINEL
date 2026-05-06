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

  const [menuOpen,    setMenuOpen]    = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); setDropdownOpen(false); }, [location.pathname]);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    toast.info('You have been signed out.');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ───────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="hidden sm:block text-xl font-extrabold text-[#1E3A8A] tracking-tighter uppercase italic">
              Sentinel
            </span>
          </Link>

          {/* ── Desktop Nav Links ───────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  isActive(to)
                    ? 'bg-[#1E3A8A]/10 text-[#1E3A8A]'
                    : 'text-slate-600 hover:text-[#1E3A8A] hover:bg-slate-50'
                }`}
              >
                {label}
              </Link>
            ))}
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  isActive('/admin')
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-slate-600 hover:text-violet-700 hover:bg-violet-50'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
          </div>

          {/* ── Auth Area ──────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              /* Avatar Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-150"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  {/* Avatar circle */}
                  <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white text-xs font-bold flex items-center justify-center">
                    {initials}
                  </div>
                  <span className="text-sm font-semibold text-slate-800 max-w-[120px] truncate">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-1 z-50"
                    >
                      {/* User info banner */}
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 capitalize mt-0.5">{user?.role} • {user?.id}</p>
                      </div>

                      <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#1E3A8A] transition-colors">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link to="/settings" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#1E3A8A] transition-colors">
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-semibold text-[#1E3A8A] border-2 border-[#1E3A8A] rounded-lg hover:bg-[#1E3A8A] hover:text-white transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#1E3A8A] rounded-lg hover:bg-[#172E6D] transition-all duration-200 shadow-md shadow-blue-900/20"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ───────────────────────────────── */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive(to)
                      ? 'bg-[#1E3A8A]/10 text-[#1E3A8A]'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#1E3A8A]'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {label}
                </Link>
              ))}

              <div className="border-t border-slate-100 pt-3 mt-3">
                {isAuthenticated ? (
                  <>
                    {/* Mobile user info */}
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-slate-50 rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-[#1E3A8A] text-white text-sm font-bold flex items-center justify-center">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                      </div>
                    </div>
                    <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link to="/settings" className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-3">
                    <Link to="/login"    className="flex-1 text-center px-4 py-2.5 border-2 border-[#1E3A8A] text-[#1E3A8A] rounded-xl text-sm font-semibold hover:bg-[#1E3A8A] hover:text-white transition-all">Login</Link>
                    <Link to="/register" className="flex-1 text-center px-4 py-2.5 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-[#172E6D] transition-all">Register</Link>
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
