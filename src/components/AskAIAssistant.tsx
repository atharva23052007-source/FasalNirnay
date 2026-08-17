import React, { useState, useRef, useEffect } from 'react';
import { Mic, Search, Sparkles, Send, Bot, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export const AskAIAssistant: React.FC = () => {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'ai', text: t('aiWelcome', 'Hello! I am your AI assistant. Ask me anything about crops, weather, or market prices.') }
  ]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMicClick = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setQuery('Listening...');
      setTimeout(() => {
        setQuery('What is the best time to sell my tomatoes?');
        setIsListening(false);
      }, 2000);
    } else {
      setQuery('');
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage = query.trim();
    setQuery('');
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const newMessages = [...messages, { id: Date.now().toString(), sender: 'user', text: userMessage }];
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, language })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: data.error || 'Something went wrong.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: 'Network error. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 flex flex-col shadow-sm relative overflow-hidden h-[400px]">
      
      {/* Decorative Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-2 mb-4 shrink-0">
        <Sparkles className="w-5 h-5 text-emerald-600" />
        <h2 className="font-heading font-extrabold text-lg sm:text-xl text-gray-900 tracking-tight">
          Ask AI Assistant
        </h2>
      </div>

      {/* Chat Messages Area */}
      <div className="relative z-10 flex-1 overflow-y-auto mb-4 flex flex-col gap-3 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 text-sm ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${msg.sender === 'user' ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-600'}`}>
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div className={`px-3 py-2 rounded-2xl max-w-[85%] ${msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm'}`}>
              <p className="leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 text-sm">
             <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="px-3 py-2 rounded-2xl bg-gray-50 border border-gray-100 text-gray-500 rounded-tl-sm flex items-center gap-1">
              <span className="animate-bounce">●</span><span className="animate-bounce delay-75">●</span><span className="animate-bounce delay-150">●</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* AI Suggestions / Chips (Only show if few messages) */}
      {messages.length <= 2 && (
        <div className="relative z-10 flex flex-wrap gap-2 mb-3 shrink-0">
          {['Tomato Prices?', 'Weather impact?', 'Best buyers?'].map((suggestion, idx) => (
            <button 
              key={idx}
              onClick={() => { setQuery(suggestion); setTimeout(() => handleSend(), 50); }}
              className="text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <form onSubmit={handleSend} className="relative z-10 flex items-center bg-gray-50 border border-gray-200 rounded-xl focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all p-1 shrink-0 mt-auto">
        
        <div className="pl-3 pr-2 text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('askAnything', 'Ask anything about your crops...')}
          className="flex-1 bg-transparent border-none text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none py-2.5 min-w-0"
        />

        {query.trim() ? (
          <button
            type="submit"
            className="p-2.5 rounded-lg flex items-center justify-center transition-all bg-emerald-600 text-white hover:bg-emerald-700"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleMicClick}
            className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
              isListening 
                ? 'bg-red-100 text-red-600 animate-pulse shadow-inner' 
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            }`}
            title="Voice Search"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}
      </form>

    </section>
  );
};
