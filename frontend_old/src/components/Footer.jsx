import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Globe, Share2, ExternalLink, Shield, ShieldCheck } from 'lucide-react';

const FooterLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="text-slate-500 hover:text-blue-600 text-[11px] font-semibold transition-colors duration-200"
    >
      {children}
    </Link>
  </li>
);

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white text-slate-900 border-t border-slate-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

        {/* Brand */}
        <div className="lg:col-span-1">
          <Link to="/" className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="block text-lg font-bold tracking-tight uppercase leading-none">LASUSTECH</span>
              <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Support Portal</span>
            </div>
          </Link>
          <p className="text-slate-500 text-xs font-medium leading-relaxed mb-8 max-w-xs">
            Lagos State University of Science and Technology primary support and accountability framework. 
          </p>
          <div className="flex gap-2">
            {[Globe, Share2, ExternalLink].map((Icon, i) => (
              <button key={i} className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white transition-all duration-200">
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-6">Navigation</h4>
          <ul className="space-y-3">
            <FooterLink to="/">Home</FooterLink>
            <FooterLink to="/about">About Us</FooterLink>
            <FooterLink to="/submit">Submit Ticket</FooterLink>
            <FooterLink to="/track">Track Status</FooterLink>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-6">Legal & Help</h4>
          <ul className="space-y-3">
            <FooterLink to="/terms">Terms of Service</FooterLink>
            <FooterLink to="/privacy">Privacy Policy</FooterLink>
            <FooterLink to="/help">Help Center</FooterLink>
            <FooterLink to="/admin">Staff Login</FooterLink>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-6">Official Contact</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-blue-600 shrink-0">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] font-medium text-slate-600 leading-normal pt-1">
                support@lasustech.edu.ng
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-blue-600 shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] font-medium text-slate-600 leading-normal pt-1">
                Main Campus, Ikorodu,<br />Lagos State, Nigeria.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            © {year} LASUSTECH Support Portal • Institutional Management System
          </p>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-green-500" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">System Status: Active</span>
             </div>
             <Shield className="w-4 h-4 text-slate-200" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
