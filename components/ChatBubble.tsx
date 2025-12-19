
import React from 'react';
import { Message } from '../types';
import TradingViewChart from './TradingViewChart';
import { Bot, User } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isBot = message.role === 'assistant';

  return (
    <div className={`flex w-full gap-4 mb-8 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-1">
          <Bot size={16} className="text-zinc-400" />
        </div>
      )}
      
      <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${!isBot ? 'items-end' : 'items-start'}`}>
        <div 
          className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed tracking-tight shadow-sm
            ${isBot 
              ? 'text-zinc-200 bg-transparent' 
              : 'bg-zinc-800 text-white rounded-tr-none'
            }`}
        >
          {message.text}
          {message.chartSymbol && <TradingViewChart symbol={message.chartSymbol} />}
        </div>
        
        <span className="text-[10px] text-zinc-600 mt-2 font-mono uppercase tracking-widest px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {!isBot && (
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 mt-1">
          <User size={16} className="text-black" />
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
