import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2, ArrowRight, Mic, MicOff, Square, LogIn } from 'lucide-react';
import { aiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Chatbot = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your Sentinel Advisor. I can help you with advice on school issues, report writing, and more. What can I do for you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [guestMessageCount, setGuestMessageCount] = useState(0);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const abortControllerRef = useRef(null);

  const GUEST_LIMIT = 5;

  // Fetch History if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchHistory = async () => {
        try {
          const history = await aiService.getHistory();
          if (history && history.length > 0) {
            // Transform history to match component state if needed
            const formattedHistory = history.map(h => ({ role: h.role, content: h.content }));
            setMessages(prev => [...prev, ...formattedHistory]);
          }
        } catch (err) {
          console.error('Failed to fetch chat history:', err);
        }
      };
      fetchHistory();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  };

  const QUICK_ADVICE = [
    { label: 'Academic Advice', query: 'I need advice on my academic grades and results.' },
    { label: 'Security Help', query: 'What should I do if I feel unsafe on campus?' },
    { label: 'Fee Issues', query: 'I have problems with my school fees payment.' },
    { label: 'Report Tips', query: 'How do I write a good report about a lecturer?' },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (val) => {
    const text = typeof val === 'string' ? val : input;
    if (!text.trim() || loading) return;

    // Check Guest Limit
    if (!isAuthenticated && guestMessageCount >= GUEST_LIMIT) {
      setMessages(prev => [...prev, 
        { role: 'user', content: text },
        { role: 'assistant', isPrompt: true, content: "You've reached the free chat limit. Please log in or sign up to continue this conversation and save your history!" }
      ]);
      setInput('');
      return;
    }

    // Set up AbortController
    abortControllerRef.current = new AbortController();

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    if (!isAuthenticated) setGuestMessageCount(prev => prev + 1);

    try {
      // Save User Message if logged in
      if (isAuthenticated) {
        aiService.saveHistory(userMessage).catch(console.error);
      }

      const data = await aiService.chat([...messages, userMessage], abortControllerRef.current.signal);
      // Strip asterisks and other markdown bits just in case
      const rawContent = data?.content || data?.message || "I'm sorry, I couldn't process that. Please try again.";
      const content = rawContent.replace(/\*\*/g, '').replace(/\*/g, '');
      
      const assistantMessage = { role: 'assistant', content };
      setMessages(prev => [...prev, assistantMessage]);

      // Save Assistant Message if logged in
      if (isAuthenticated) {
        aiService.saveHistory(assistantMessage).catch(console.error);
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Generation stopped.' }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'I am having trouble connecting to my brain right now. Please check your internet or try again later.' }]);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[150]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="absolute bottom-20 md:bottom-24 right-0 w-[calc(100vw-32px)] md:w-[400px] h-[min(600px,calc(100vh-120px))] bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_20px_60px_-15px_rgba(30,58,138,0.25)] border border-slate-100 flex flex-col overflow-hidden ring-1 ring-slate-900/5"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF] p-7 md:p-8 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/15 rounded-[1.2rem] flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] leading-tight">Sentinel Advisor</h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.6)]" />
                    <span className="text-white/60 text-[8px] font-black uppercase tracking-widest">Always Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-all text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 scroll-smooth bg-slate-50/30"
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm
                      ${m.role === 'user' ? 'bg-[#1E3A8A] text-white' : 'bg-white text-primary border border-slate-100'}`}>
                      {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`px-5 py-4 rounded-[1.8rem] text-sm font-bold leading-relaxed shadow-sm
                      ${m.role === 'user' 
                        ? 'bg-[#1E3A8A] text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                      {m.content || "..."}
                      {m.isPrompt && (
                        <div className="mt-4 flex flex-col gap-2">
                          <button
                            onClick={() => navigate('/login')}
                            className="w-full py-3 bg-[#1E3A8A] text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-800 transition-all"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            Log In Now
                          </button>
                          <button
                            onClick={() => navigate('/register')}
                            className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                          >
                            Create Account
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {messages.length === 1 && !loading && (
                <div className="pt-2 space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Suggestions</p>
                  <div className="grid grid-cols-1 gap-2">
                    {QUICK_ADVICE.map((q) => (
                      <button
                        key={q.label}
                        onClick={() => handleSend(q.query)}
                        className="px-5 py-3.5 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-primary hover:text-primary hover:shadow-xl hover:shadow-blue-900/5 transition-all text-left flex items-center justify-between group"
                      >
                        {q.label}
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white px-6 py-5 rounded-[1.8rem] rounded-tl-none border border-slate-100 flex gap-1.5 items-center shadow-sm">
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-5 md:p-6 border-t border-slate-100 bg-white shrink-0">
              <div className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Type your message..."}
                  className={`w-full pl-6 pr-24 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#1E3A8A] focus:ring-4 focus:ring-blue-900/5 transition-all outline-none text-[13px] md:text-sm font-bold placeholder:text-slate-400
                    ${isListening ? 'ring-4 ring-red-500/10 border-red-200' : ''}`}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`w-10 h-10 rounded-[12px] flex items-center justify-center transition-all
                      ${isListening 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  {loading ? (
                    <button
                      type="button"
                      onClick={stopGeneration}
                      className="w-11 h-11 bg-slate-900 text-white rounded-[14px] flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                    >
                      <Square className="w-4 h-4 fill-white" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="w-11 h-11 bg-[#1E3A8A] text-white rounded-[14px] flex items-center justify-center hover:bg-blue-800 transition-all disabled:opacity-50 shadow-lg shadow-blue-900/10 active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all duration-500 relative overflow-hidden
          ${isOpen 
            ? 'bg-white text-[#1E3A8A] border-2 border-slate-100' 
            : 'bg-[#1E3A8A] text-white shadow-blue-900/40 hover:shadow-blue-900/60'}`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6 md:w-8 md:h-8" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare className="w-6 h-6 md:w-8 md:h-8" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && (
          <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1E3A8A] animate-ping" />
        )}
      </motion.button>
    </div>

  );
};

export default Chatbot;
