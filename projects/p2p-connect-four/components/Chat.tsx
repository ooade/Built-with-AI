import React, { useEffect, useRef } from 'react';
import { Send, X, MessageSquare } from 'lucide-react';

interface ChatMessage {
  text: string;
  isMe: boolean;
}

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  opponentName: string;
}

const Chat: React.FC<ChatProps> = ({ isOpen, onClose, messages, onSendMessage, opponentName }) => {
  const [input, setInput] = React.useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (window.innerWidth > 768) {
          inputRef.current?.focus();
      }
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
      if (window.innerWidth > 768) {
          inputRef.current?.focus();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-[2px] animate-in fade-in duration-300" onClick={onClose}></div>
        
        {/* Container */}
        <div className="fixed bottom-0 left-0 right-0 md:left-auto md:right-6 md:bottom-20 w-full md:w-96 h-[85dvh] md:h-[550px] glass-ios-heavy rounded-t-[36px] md:rounded-[36px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300 z-50 md:shadow-[0_20px_60px_rgba(0,0,0,0.5)] md:border md:border-white/10">
          
          {/* Handle (Mobile) */}
          <div className="w-full flex justify-center pt-3 pb-1 md:hidden" onClick={onClose}>
             <div className="w-12 h-1.5 bg-white/20 rounded-full"/>
          </div>

          {/* Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/5">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg ring-1 ring-white/10">
                    <MessageSquare size={18} fill="currentColor"/>
                </div>
                <div>
                    <div className="font-bold text-white text-base tracking-tight">Chat</div>
                    <div className="text-[11px] text-white/50 font-bold tracking-wider uppercase">{opponentName}</div>
                </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2.5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
            >
              <X size={20}/>
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-white/20 text-sm space-y-3">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <MessageSquare size={32} className="opacity-50"/>
                </div>
                <p className="font-medium">Start the conversation</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-[20px] px-5 py-3 text-[16px] shadow-sm break-words leading-snug ${
                  msg.isMe 
                    ? 'bg-blue-600 text-white rounded-br-sm' 
                    : 'bg-white/10 backdrop-blur-md border border-white/5 text-white/90 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 pb-safe bg-black/20 border-t border-white/5 flex gap-3 backdrop-blur-xl shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="glass-input flex-1 px-5 rounded-[24px] !h-[48px] !bg-white/5 focus:!bg-white/10 border-white/10 focus:border-white/20"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-white/20 text-white w-[48px] h-[48px] rounded-full transition-all active:scale-95 shadow-lg flex items-center justify-center"
            >
              <Send size={20} className={input.trim() ? "translate-x-0.5" : ""}/>
            </button>
          </form>
        </div>
    </>
  );
};

export default Chat;