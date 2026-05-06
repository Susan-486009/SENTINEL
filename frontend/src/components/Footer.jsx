const FooterLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="text-slate-500 hover:text-blue-500 text-[10px] font-black uppercase tracking-widest italic transition-colors duration-200"
    >
      {children}
    </Link>
  </li>
);

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0B1120] text-white border-t border-slate-900/60 pt-20">
      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">

        {/* Brand */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="block text-2xl font-black tracking-tighter uppercase italic leading-none">SENTINEL</span>
              <span className="text-[8px] text-slate-700 font-black uppercase tracking-[0.4em] mt-1 italic">Authorized_Monitoring_Network</span>
            </div>
          </div>
          <p className="text-slate-500 text-[11px] font-bold leading-relaxed max-w-sm uppercase tracking-tight italic opacity-80">
            LASUSTECH INSTITUTIONAL INTEGRITY SYSTEM. REPLICATED MONITORING NODES ACROSS CAMPUS INFRASTRUCTURE. DATA INTEGRITY GUARANTEED UNDER PROTOCOL 401-B.
          </p>

          {/* Social Icons */}
          <div className="flex gap-4 mt-8">
            {[
              { icon: Globe,       label: 'Website' },
              { icon: Share2,      label: 'Share'   },
              { icon: ExternalLink, label: 'Links'  },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                aria-label={label}
                className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center transition-all hover:border-blue-500/30 hover:bg-slate-900 group"
              >
                <Icon className="w-4 h-4 text-slate-700 group-hover:text-blue-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-8 italic">
            Network_Nodes
          </h4>
          <ul className="space-y-4">
            <FooterLink to="/">Core_Terminal</FooterLink>
            <FooterLink to="/submit">Report_Ingress</FooterLink>
            <FooterLink to="/track">Audit_Query</FooterLink>
            <FooterLink to="/dashboard">System_Metrics</FooterLink>
            <FooterLink to="/login">Protocol_Auth</FooterLink>
          </ul>
        </div>

        {/* Legal + Contact */}
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-8 italic">
            Support_Protocols
          </h4>
          <ul className="space-y-4 mb-10">
            <FooterLink to="/about">System_History</FooterLink>
            <FooterLink to="/contact">Admin_Contact</FooterLink>
            <FooterLink to="/privacy">Data_Policy</FooterLink>
          </ul>

          <div className="space-y-4 text-[9px] font-black text-slate-700 uppercase tracking-widest italic">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-slate-800 mt-0.5 shrink-0" />
              <span>IKORODU_HQ, LAGOS STATE, NIGERIA</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-800 shrink-0" />
              <span>SENTINEL@LASUSTECH.EDU.NG</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-800 shrink-0" />
              <span>+234_LASUSTECH_CORE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-950 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-slate-800 text-[9px] font-black uppercase tracking-[0.3em] italic">
            © {year} SENTINEL_SYSTEMS // LASUSTECH_AUTHORIZED_ONLY
          </p>
          <div className="flex items-center gap-6 text-[8px] font-black text-slate-800 uppercase tracking-widest italic">
            <Link to="/privacy" className="hover:text-blue-500 transition-colors">Privacy_Core</Link>
            <span className="opacity-20">//</span>
            <Link to="/contact" className="hover:text-blue-500 transition-colors">Emergency_Comms</Link>
            <span className="opacity-20">//</span>
            <a href="https://lasustech.edu.ng" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">
              INSTITUTIONAL_PORTAL ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
