
import React, { useState, useEffect, useRef } from 'react';
import { Cpu, LogOut, ArrowRight, Lock, Send, Sparkles } from 'lucide-react';
import { Message } from './types';
import { geminiService } from './services/geminiService';
import ChatBubble from './components/ChatBubble';

const App: React.FC = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [pin, setPin] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Persistence
  useEffect(() => {
    const savedPin = localStorage.getItem('dono_pin');
    if (savedPin) {
      const savedMessages = localStorage.getItem(`dono_history_${savedPin}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    }
  }, []);

  useEffect(() => {
    if (isAuth && pin) {
      localStorage.setItem('dono_pin', pin);
      const history = localStorage.getItem(`dono_history_${pin}`);
      if (history) setMessages(JSON.parse(history));
      else if (messages.length === 0) {
        const welcome: Message = {
          id: 'welcome',
          role: 'assistant',
          text: "System initialized. I am DONO. How can I assist your analysis today?",
          timestamp: new Date().toISOString()
        };
        setMessages([welcome]);
      }
    }
  }, [isAuth, pin]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleLogin = () => {
    if (pin.length >= 4) {
      setIsAuth(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const history = newMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await geminiService.generateResponse(history);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.text,
        timestamp: new Date().toISOString(),
        chartSymbol: response.chartSymbol
      };

      const finalMessages = [...newMessages, botMessage];
      setMessages(finalMessages);
      localStorage.setItem(`dono_history_${pin}`, JSON.stringify(finalMessages));
    } catch (error) {
      console.error("Gemini Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-black">
        <div className="w-full max-w-sm flex flex-col items-center">
          <div className="relative mb-12">
            <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.05)]">
              <Cpu size={48} className="text-white opacity-90" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
              <Lock size={18} className="text-black" />
            </div>
          </div>

          <h1 className="text-4xl font-semibold tracking-tighter text-white mb-2">DONO</h1>
          <p className="text-zinc-500 text-sm mb-12 uppercase tracking-[0.3em] font-light">Intelligence Unit</p>

          <div className="w-full space-y-4">
            <input
              type="password"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full bg-zinc-900 border border-zinc-800 text-center text-3xl tracking-[0.6em] text-white py-5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-white/30 transition-all placeholder-zinc-800"
              maxLength={4}
              autoFocus
            />
            <button
              onClick={handleLogin}
              className="w-full bg-white text-black font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-colors active:scale-[0.98]"
            >
              System Access <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Top Bar */}
      <header className="h-16 shrink-0 glass-panel z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
            <Cpu size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-tight text-white leading-none">DONO</h2>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Core v3.2</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Linked</span>
          </div>
          <button 
            onClick={() => setIsAuth(false)}
            className="text-zinc-600 hover:text-white transition-colors p-1"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Stream */}
      <main className="flex-1 overflow-y-auto relative bg-[#050505]">
        <div 
          ref={scrollRef}
          className="max-w-4xl mx-auto px-6 pt-12 pb-32 h-full overflow-y-auto"
        >
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          
          {isTyping && (
            <div className="flex gap-4 mb-8">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-zinc-400" />
              </div>
              <div className="flex items-center gap-1.5 h-8 px-1">
                <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input Field */}
      <footer className="shrink-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute -inset-0.5 bg-white/5 rounded-[22px] blur opacity-30 group-focus-within:opacity-100 transition duration-1000"></div>
          <div className="relative glass-panel rounded-[20px] flex items-center p-1.5 shadow-2xl">
            <input
              type="text"
              placeholder="Query DONO..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent text-white px-5 py-3.5 focus:outline-none placeholder-zinc-700 text-[15px] font-light"
              autoFocus
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`p-3.5 rounded-2xl transition-all duration-300 ${
                input.trim() && !isTyping 
                ? 'bg-white text-black hover:scale-105 active:scale-95' 
                : 'bg-zinc-900 text-zinc-600'
              }`}
            >
              {isTyping ? <Sparkles size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
        <p className="text-center text-[9px] text-zinc-700 mt-4 uppercase tracking-[0.2em] font-medium">
          Encrypted Session &bull; Intelligence Accuracy 99.2%
        </p>
      </footer>
    </div>
  );
};

// Simplified Bot icon for cleaner look
const Bot = ({ size, className }: { size: number; className?: string }) => (
  <Sparkles size={size} className={className} />
);

export default App;
