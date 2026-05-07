import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SENTINEL_CRITICAL_FAULT:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-12 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-900/10">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            
            <span className="text-[10px] font-black tracking-[0.4em] text-red-500 uppercase italic mb-2 block">System Fault</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic mb-4">Something Went Wrong</h1>
            <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">
              Sentinel encountered an unexpected synchronization error. Our automated audit logs have been updated.
            </p>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#1E3A8A] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 hover:bg-[#172E6D] transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Reload Portal
              </button>
              
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false })}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#1E3A8A] hover:border-[#1E3A8A] transition-all"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
