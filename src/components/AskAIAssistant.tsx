import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Search, Send, User, Sparkles, Volume2, Bot } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

// Language code for Web Speech API
const speechLangMap: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
};

export const AskAIAssistant: React.FC = () => {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: t('aiWelcome', 'Hello! I am your FasalNirnay AI assistant. Ask me anything about crops, weather, or market prices.'),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update welcome message when language changes
  useEffect(() => {
    setMessages([
      {
        id: '1',
        sender: 'ai',
        text: t('aiWelcome', 'Hello! I am your FasalNirnay AI assistant. Ask me anything about crops, weather, or market prices.'),
      },
    ]);
  }, [language]);

  // Language-aware quick suggestions
  const suggestions = [
    t('aiSuggestion1', 'Tomato Prices?'),
    t('aiSuggestion2', 'Weather impact?'),
    t('aiSuggestion3', 'Best buyers?'),
  ];

  const allSuggestions = suggestions;

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = messageText.trim();
    setQuery('');

    const newUserMsg: Message = { id: Date.now().toString(), sender: 'user', text: userMessage };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const currentMessages = [...messages, newUserMsg];
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: currentMessages, language }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMessages(prev => [
          ...prev,
          { id: (Date.now() + 1).toString(), sender: 'ai', text: data.reply },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { id: (Date.now() + 1).toString(), sender: 'ai', text: data.error || t('aiNetworkError', 'Something went wrong.') },
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'ai', text: t('aiNetworkError', 'Network error. Please try again later.') },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, language, isLoading, t]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await sendMessage(query);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setQuery(suggestion);
    await sendMessage(suggestion);
  };

  // Web Speech API — supports Hindi (hi-IN) and Marathi (mr-IN)
  const handleMicClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback: simulate demo query in current language
      const demoQueries: Record<string, string> = {
        en: 'What is the best time to sell my tomatoes?',
        hi: 'टमाटर बेचने का सबसे अच्छा समय क्या है?',
        mr: 'टोमॅटो विकण्याची सर्वोत्तम वेळ कोणती आहे?',
      };
      setQuery(demoQueries[language] || demoQueries['en']);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechLangMap[language] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setQuery(t('aiListening', 'Listening...'));
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setQuery(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setQuery('');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 flex flex-col shadow-sm relative overflow-hidden h-full min-h-[460px]">

      {/* Decorative Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-yellow-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <h2 className="font-heading font-extrabold text-lg sm:text-xl text-gray-900 tracking-tight">
            {t('aiAssistantTitle', 'Ask AI Assistant')}
          </h2>
        </div>
      </div>

      {/* Language Indicator */}
      <div className="relative z-10 mb-3 shrink-0">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full">
          <Volume2 className="w-3 h-3" />
          {t('aiLanguageNote', 'Responding in English')}
          {' · '}
          {language === 'hi' ? '🇮🇳 Hindi' : language === 'mr' ? '🚩 Marathi' : '🇬🇧 English'}
        </span>
      </div>

      {/* Chat Messages Area */}
      <div className="relative z-10 flex-1 overflow-y-auto mb-4 flex flex-col gap-3 pr-1 scrollbar-thin scrollbar-thumb-gray-200">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 text-sm ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 overflow-hidden shadow-sm ${
              msg.sender === 'user'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {msg.sender === 'user'
                ? <User className="w-3.5 h-3.5" />
                : <Bot className="w-4 h-4" />
              }
            </div>
            <div className={`px-3.5 py-2.5 rounded-2xl max-w-[85%] shadow-xs ${
              msg.sender === 'user'
                ? 'bg-emerald-600 text-white rounded-tr-sm'
                : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm'
            }`}>
              <p className="leading-relaxed text-[13px]">{msg.text}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 text-sm">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 overflow-hidden flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-100 rounded-tl-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      {messages.length <= 2 && (
        <div className="relative z-10 flex flex-wrap gap-1.5 mb-3 shrink-0">
          {allSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all disabled:opacity-50 bg-gray-50 text-gray-600 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={handleSend}
        className="relative z-10 flex items-center bg-gray-50 border border-gray-200 rounded-xl focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all p-1 shrink-0 mt-auto"
      >
        <div className="pl-3 pr-2 text-gray-400">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('askAnything', 'Ask anything about your crops...')}
          className="flex-1 bg-transparent border-none text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none py-2.5 min-w-0"
          disabled={isLoading}
        />

        {/* Send or Mic button */}
        {query.trim() && !isListening ? (
          <button
            type="submit"
            disabled={isLoading}
            className="p-2.5 rounded-lg flex items-center justify-center transition-all bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleMicClick}
            className={`p-2.5 rounded-lg flex items-center justify-center transition-all active:scale-95 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-inner'
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            }`}
            title={isListening ? 'Stop Listening' : `Voice Input (${language === 'hi' ? 'हिंदी' : language === 'mr' ? 'मराठी' : 'English'})`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        )}
      </form>

    </section>
  );
};
