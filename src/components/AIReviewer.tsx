import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Send, User, Bot, AlertTriangle } from 'lucide-react';

interface AIReviewerProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isTyping: boolean;
  stressEvent?: { title: string; description: string };
  isObserving?: boolean;
}

const AIReviewer: React.FC<AIReviewerProps> = ({ messages, onSendMessage, isTyping, stressEvent, isObserving }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#151619] border-l border-[#2A2D32]">
      <div className="p-4 border-bottom border-[#2A2D32] flex items-center justify-between bg-[#1E2126]">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-[#00FF00]" />
          <span className="text-xs font-mono text-[#FFFFFF] uppercase tracking-widest">Architect Reviewer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00FF00] animate-pulse" />
          <span className="text-[10px] font-mono text-[#8E9299]">LIVE_SESSION</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        <AnimatePresence>
          {stressEvent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg space-y-2"
            >
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle size={16} />
                <span className="text-xs font-bold uppercase tracking-tighter">Stress Event Triggered</span>
              </div>
              <h4 className="text-sm font-bold text-white">{stressEvent.title}</h4>
              <p className="text-xs text-red-200/70 leading-relaxed">{stressEvent.description}</p>
            </motion.div>
          )}

          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: m.role === 'architect' ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                m.role === 'architect' ? 'bg-[#2A2D32] text-[#00FF00]' : 'bg-[#00FF00] text-black'
              }`}>
                {m.role === 'architect' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className={`flex flex-col gap-1 max-w-[85%] ${m.role === 'user' ? 'items-end' : ''}`}>
                <div className={`p-3 rounded-lg text-xs leading-relaxed font-mono ${
                  m.role === 'architect' 
                    ? 'bg-[#1E2126] text-[#E0E0E0] border border-[#2A2D32]' 
                    : 'bg-[#00FF00] text-black font-bold'
                }`}>
                  {m.content}
                </div>
                <span className="text-[10px] text-[#4A4D52] font-mono">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded bg-[#2A2D32] text-[#00FF00] flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-[#1E2126] border border-[#2A2D32] p-3 rounded-lg flex gap-1">
                <div className="w-1 h-1 bg-[#00FF00] rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-[#00FF00] rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1 h-1 bg-[#00FF00] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-[#1E2126] border-t border-[#2A2D32]">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isObserving ? "Architect is observing your design..." : "Justify your decision..."}
            disabled={isObserving}
            className="w-full bg-[#151619] border border-[#2A2D32] rounded-lg py-3 px-4 text-xs text-white font-mono focus:outline-none focus:border-[#00FF00] transition-colors pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping || isObserving}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#8E9299] hover:text-[#00FF00] disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-[#4A4D52] font-mono uppercase tracking-widest text-center">
          {isObserving ? "Chat disabled during observation" : "Press Enter to transmit"}
        </p>
      </form>
    </div>
  );
};

export default AIReviewer;
