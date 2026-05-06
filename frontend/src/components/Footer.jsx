import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Globe, Share2, ExternalLink, Shield, ShieldCheck } from 'lucide-react';

const FooterLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="text-slate-500 hover:text-blue-600 text-xs font-bold uppercase tracking-widest transition-colors duration-200"
    >
      {children}
    </Link>
  </li>
);

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 text-slate-900 border-t border-slate-100 pt-24 pb-12">
      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">

        {/* Brand */}
        <div className="lg:col-span-1">
          <Link to="/" className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-100">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="block text-2xl font-black tracking-tighter uppercase leading-none">SENTINEL</span>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1">EST. 2024</span>
            </div>
          </Link>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 max-w-xs">
            LASUSTECH's primary accountability framework. Empowering students through transparent and effective issue resolution.
          </p>
          <div className="flex gap-4">
            {[Globe, Share2, ExternalLink].map((Icon, i) => (
              <button key={i} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all">
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-10">Platform Nodes</h4>
          <ul className="space-y-4">
            <FooterLink to="/">Home Interface</FooterLink>
            <FooterLink to="/submit">Report Portal</FooterLink>
            <FooterLink to="/track">Case Tracker</FooterLink>
            <FooterLink to="/login">Authorized Access</FooterLink>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-10">Institutional</h4>
          <ul className="space-y-4">
            <FooterLink to="/terms">Terms of Protocol</FooterLink>
            <FooterLink to="/privacy">Data Privacy</FooterLink>
            <FooterLink to="/help">Support Node</FooterLink>
            <FooterLink to="/admin">Admin Core</FooterLink>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-10">Communications</h4>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-bold text-slate-600 leading-relaxed pt-2">
                support@sentinel.lasustech.edu.ng
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-bold text-slate-600 leading-relaxed">
                LASUSTECH Main Campus,<br />Ikorodu, Lagos State.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            © {year} Sentinel Accountability Network • All Rights Reserved
          </p>
          <div className="flex items-center gap-10">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Status: Secure</span>
             </div>
             <Shield className="w-5 h-5 text-slate-200" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
