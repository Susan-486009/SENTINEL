import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Globe, Share2, ExternalLink, Shield } from 'lucide-react';

const FooterLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="text-blue-200 hover:text-white text-sm transition-colors duration-150"
    >
      {children}
    </Link>
  </li>
);

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1E3A8A] text-white mt-20">
      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="block text-xl font-black tracking-tighter uppercase italic">SENTINEL</span>
              <span className="text-[10px] text-blue-300 font-bold uppercase tracking-widest leading-none">Helping Students Resolve Issues</span>
            </div>
          </div>
          <p className="text-blue-200 text-sm leading-relaxed max-w-sm">
            Helping LASUSTECH students report problems and get results. We make sure every complaint is taken seriously and resolved fairly.
          </p>

          {/* Social Icons */}
          <div className="flex gap-3 mt-6">
            {[
              { icon: Globe,       label: 'Website' },
              { icon: Share2,      label: 'Share'   },
              { icon: ExternalLink, label: 'Links'  },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                aria-label={label}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-150"
              >
                <Icon className="w-4 h-4 text-blue-200" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-blue-300 mb-5">
            Quick Links
          </h4>
          <ul className="space-y-3">
            <FooterLink to="/">Home</FooterLink>
            <FooterLink to="/submit">Report Issue</FooterLink>
            <FooterLink to="/track">Track Status</FooterLink>
            <FooterLink to="/dashboard">Dashboard</FooterLink>
            <FooterLink to="/login">Portal Login</FooterLink>
          </ul>
        </div>

        {/* Legal + Contact */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-blue-300 mb-5">
            Legal & Support
          </h4>
          <ul className="space-y-3 mb-7">
            <FooterLink to="/about">Our Story</FooterLink>
            <FooterLink to="/contact">Contact Us</FooterLink>
            <FooterLink to="/privacy">Privacy Policy</FooterLink>
          </ul>

          <div className="space-y-2.5 text-sm text-blue-200">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <span>Ikorodu, Lagos State, Nigeria</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>support@lasustech.edu.ng</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
              <span>+234 (0) 123 456 7890</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-blue-300 text-xs text-center sm:text-left font-medium">
            © {year} Sentinel – Student Support Portal. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-blue-300">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-blue-600">•</span>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <span className="text-blue-600">•</span>
            <a href="https://lasustech.edu.ng" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              lasustech.edu.ng ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
