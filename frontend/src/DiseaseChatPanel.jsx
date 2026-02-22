import React, { useState, useRef, useEffect } from 'react';
import { Send, Bug, Trash2 } from 'lucide-react';

export default function DiseaseChatPanel() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

      // Build history from existing messages (exclude the one we just added)
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: history,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'error',
        content: `Error: ${error.message}`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  // Simple markdown-like formatting for assistant messages
  const formatMessage = (text) => {
    // Split into lines and process
    const lines = text.split('\n');
    const elements = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Bold headers with **text**
      if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(
          <h4 key={i} className="text-[#00d9ff] font-semibold text-sm mt-3 mb-1">
            {line.replace(/\*\*/g, '')}
          </h4>
        );
        continue;
      }

      // Bullet points
      if (line.match(/^[\*\-]\s/)) {
        elements.push(
          <li key={i} className="text-gray-300 text-sm ml-4 list-disc leading-relaxed">
            {formatInlineText(line.replace(/^[\*\-]\s/, ''))}
          </li>
        );
        continue;
      }

      // Numbered list
      if (line.match(/^\d+\.\s/)) {
        elements.push(
          <li key={i} className="text-gray-300 text-sm ml-4 list-decimal leading-relaxed">
            {formatInlineText(line.replace(/^\d+\.\s/, ''))}
          </li>
        );
        continue;
      }

      // Empty line
      if (line.trim() === '') {
        elements.push(<div key={i} className="h-2" />);
        continue;
      }

      // Regular paragraph
      elements.push(
        <p key={i} className="text-gray-300 text-sm leading-relaxed">
          {formatInlineText(line)}
        </p>
      );
    }

    return elements;
  };

  // Handle inline bold text
  const formatInlineText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-[#00d9ff] font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const quickPrompts = [
    "What are common genetic diseases in rats?",
    "How is Mycoplasma pulmonis transmitted?",
    "What genes are linked to cancer in rats?",
    "Rat models for human diabetes research",
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 p-8 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-light tracking-[0.15em] bg-gradient-to-br from-[#00d9ff] to-[#7c3aed] bg-clip-text text-transparent mb-2">
            Disease Chat
          </h2>
          <p className="text-gray-400 text-sm font-normal tracking-wider">
            Ask about diseases, genetics, and pathology in rats
          </p>
        </div>
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold uppercase tracking-widest transition-all duration-200 hover:bg-red-500/20 hover:border-red-500/40"
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          )}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#00d9ff]/[0.08] border border-[#00d9ff]/20 rounded-xl">
            <Bug size={16} className="text-[#00d9ff]" />
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 rounded-2xl bg-gradient-to-br from-black/40 to-[#00d9ff]/[0.05] border border-[#00d9ff]/15 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <div className="h-full overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d9ff]/20 to-[#7c3aed]/20 border border-[#00d9ff]/30 flex items-center justify-center">
                <Bug size={32} className="text-[#00d9ff]" />
              </div>
              <div>
                <h3 className="text-lg text-gray-300 font-semibold mb-2">Rat Disease Expert</h3>
                <p className="text-sm text-gray-500 max-w-md">
                  Ask me anything about diseases in rats - genetics, symptoms, treatments,
                  zoonotic risks, or research models.
                </p>
              </div>

              {/* Quick Prompts */}
              <div className="flex flex-wrap gap-2 max-w-lg justify-center">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(qp)}
                    className="px-3 py-2 bg-white/[0.03] border border-[#00d9ff]/20 rounded-lg text-xs text-gray-400 transition-all duration-200 hover:bg-[#00d9ff]/10 hover:border-[#00d9ff]/40 hover:text-[#00d9ff]"
                  >
                    {qp}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className="space-y-1">
                  {msg.role === 'user' && (
                    <div className="flex justify-end">
                      <div className="max-w-[75%] px-4 py-3 bg-gradient-to-br from-[#00d9ff]/20 to-[#7c3aed]/20 border border-[#00d9ff]/30 rounded-xl text-sm text-gray-200">
                        {msg.content}
                      </div>
                    </div>
                  )}
                  {msg.role === 'assistant' && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] px-4 py-3 bg-gradient-to-br from-[#7c3aed]/[0.08] to-[#00d9ff]/[0.05] border border-[#7c3aed]/20 rounded-xl space-y-1">
                        {formatMessage(msg.content)}
                      </div>
                    </div>
                  )}
                  {msg.role === 'error' && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
                        {msg.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 bg-gradient-to-br from-[#7c3aed]/[0.08] to-[#00d9ff]/[0.05] border border-[#7c3aed]/20 rounded-xl text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#7c3aed] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-[#7c3aed] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-[#7c3aed] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about rat diseases, genetics, symptoms..."
          disabled={isLoading}
          className="flex-1 py-4 px-6 bg-white/[0.03] border border-[#00d9ff]/20 rounded-xl text-gray-200 text-sm outline-none transition-all duration-300 placeholder:text-gray-500 focus:bg-[#00d9ff]/[0.05] focus:border-[#00d9ff]/50 focus:shadow-[0_0_0_3px_rgba(0,217,255,0.1)] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#00d9ff] border-0 text-white flex items-center justify-center cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-[0_4px_16px_rgba(124,58,237,0.4)]"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
