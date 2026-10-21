import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  RefreshCw,
  FileText,
  User,
  ShieldCheck,
  Compass,
  ArrowUpRight,
  Download,
  Check,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { ChatMessage } from '../types';

const SHORT_WELCOME_MESSAGE =
  "Hey! 👋 I'm your AI Career Guide. Tell me your name, what you're studying, and your interests so I can guide you better. 😊";

interface CareerChatbotProps {
  sharedResumeText: string;
  sharedResumeName: string;
  initialPrompt?: string;
  compactMode?: boolean;
}

export const CareerChatbot: React.FC<CareerChatbotProps> = ({
  sharedResumeText,
  sharedResumeName,
  initialPrompt,
  compactMode = false,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: SHORT_WELCOME_MESSAGE,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [shareResumeContext, setShareResumeContext] = useState(Boolean(sharedResumeText));
  const [isFullScreen, setIsFullScreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedStarters = [
    "I'm studying B.Com. Which skills should I learn?",
    "Explain APIs like I'm 10 years old",
    "How can I prepare for junior developer interviews?",
    "Can you brainstorm portfolio project ideas for me?",
    "Mujhe coding me career banana hai, guide karo",
  ];

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle passed initial prompt
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      sendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const sendMessage = async (textToSend?: string) => {
    const content = (textToSend || input).trim();
    if (!content || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/career-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          resumeContext: shareResumeContext ? sharedResumeText : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat service encountered an error.');
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "I'm here to help navigate your career path. Could you tell me more about your background?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...newMessages, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content:
          "I encountered an issue connecting with the career guide engine. Please verify your connection or try rephrasing your message.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle ESC key to exit full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: SHORT_WELCOME_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const chatContainerContent = (
    <div
      className={`cosmic-card border border-[#53D8FF]/25 shadow-[0_0_40px_rgba(35,139,255,0.15)] flex flex-col overflow-hidden transition-all duration-200 ${
        isFullScreen
          ? 'w-full h-full max-w-6xl mx-auto rounded-2xl md:rounded-3xl shadow-[0_0_60px_rgba(35,139,255,0.25)] border-[#53D8FF]/40'
          : compactMode
          ? 'h-full rounded-2xl'
          : 'rounded-3xl h-[650px]'
      }`}
    >
      {/* Chat Control Toolbar */}
      <div className="p-3 sm:p-4 bg-[#07132E]/95 border-b border-[#53D8FF]/15 flex items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#238BFF] to-[#7657FF] p-[1px] shrink-0">
            <div className="w-full h-full bg-[#07132E] rounded-[11px] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#53D8FF]" />
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-[#F4F7FF] flex items-center gap-1.5 truncate">
              <span>AI Career Guide</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              {isFullScreen && (
                <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#238BFF]/20 text-[#53D8FF] border border-[#53D8FF]/30">
                  Full Screen
                </span>
              )}
            </p>
            <p className="text-[10px] sm:text-[11px] text-[#A7B6D4] truncate">
              {isFullScreen ? 'Expanded conversation view' : 'Conversational Assistant & Career Mentor'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {sharedResumeText && (
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] sm:text-xs text-[#A7B6D4] hover:text-[#F4F7FF] bg-[#0A1633] px-2 sm:px-2.5 py-1.5 rounded-lg border border-[#53D8FF]/15">
              <input
                type="checkbox"
                checked={shareResumeContext}
                onChange={(e) => setShareResumeContext(e.target.checked)}
                className="rounded bg-[#07132E] border-slate-700 text-[#238BFF] focus:ring-0 w-3 h-3 sm:w-3.5 sm:h-3.5"
              />
              <span className="hidden md:inline">Share Resume</span>
              <span className="md:hidden">Resume</span>
            </label>
          )}

          <button
            onClick={handleClearChat}
            className="p-1.5 text-[#A7B6D4] hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors"
            title="Reset conversation"
            aria-label="Reset conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Expand (⛶) / Exit Full Screen (X) Button */}
          {!isFullScreen ? (
            <button
              type="button"
              onClick={() => setIsFullScreen(true)}
              className="px-2.5 py-1.5 text-[#A7B6D4] hover:text-[#53D8FF] hover:bg-[#0A1633] border border-[#53D8FF]/20 hover:border-[#53D8FF]/50 rounded-lg transition-all flex items-center gap-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#53D8FF]"
              title="Expand to full screen (⛶)"
              aria-label="Expand chatbox to full screen"
            >
              <span className="text-sm sm:text-base font-bold leading-none select-none text-[#53D8FF]" aria-hidden="true">
                ⛶
              </span>
              <span className="hidden sm:inline">Expand</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsFullScreen(false)}
              className="p-1.5 sm:px-3 sm:py-1.5 text-[#A7B6D4] hover:text-[#F4F7FF] hover:bg-[#0A1633] border border-[#53D8FF]/30 hover:border-[#53D8FF]/60 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#53D8FF]"
              title="Exit full-screen mode (Esc)"
              aria-label="Exit full-screen mode"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-[#53D8FF]" />
              <span className="hidden sm:inline text-[#F4F7FF]">Exit Full Screen</span>
            </button>
          )}
        </div>
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-5 bg-[#03091B]/50 min-h-0">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex gap-3 max-w-[88%] sm:max-w-[80%] ${
                isFullScreen ? 'lg:max-w-[70%]' : 'lg:max-w-[75%]'
              } ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold ${
                  isUser
                    ? 'bg-[#238BFF] text-white shadow-[0_0_10px_rgba(35,139,255,0.4)]'
                    : 'bg-[#0A1633] text-[#53D8FF] border border-[#53D8FF]/30'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-gradient-to-r from-[#238BFF] to-[#1E6FD9] text-white rounded-tr-none shadow-[0_0_20px_rgba(35,139,255,0.2)]'
                      : 'bg-[#07132E] text-[#F4F7FF] border border-[#53D8FF]/20 rounded-tl-none shadow-[0_0_15px_rgba(7,19,46,0.6)]'
                  }`}
                >
                  {message.content}
                </div>
                <span
                  className={`text-[10px] text-[#A7B6D4]/70 block px-1 ${
                    isUser ? 'text-right' : 'text-left'
                  }`}
                >
                  {message.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {loading && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
            <div className="w-8 h-8 rounded-lg bg-[#0A1633] text-[#53D8FF] border border-[#53D8FF]/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-[#07132E] border border-[#53D8FF]/20 rounded-tl-none flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#53D8FF] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#238BFF] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#7657FF] animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starters Bar (when conversation is short) */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 bg-[#07132E]/60 border-t border-[#53D8FF]/10 overflow-x-auto shrink-0">
          <div className="flex items-center gap-2 text-xs whitespace-nowrap py-1">
            <span className="text-[#A7B6D4] text-[11px] font-medium shrink-0">Starters:</span>
            {suggestedStarters.map((starter, i) => (
              <button
                key={i}
                onClick={() => sendMessage(starter)}
                className="px-3 py-1.5 rounded-lg bg-[#0A1633] hover:bg-[#238BFF]/20 border border-[#53D8FF]/20 hover:border-[#53D8FF]/40 text-[#A7B6D4] hover:text-[#F4F7FF] text-xs transition-colors shrink-0"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text Input Area */}
      <div className="p-3 sm:p-4 md:p-5 bg-[#07132E]/95 border-t border-[#53D8FF]/15 shrink-0">
        <div className="relative flex items-center">
          <textarea
            rows={isFullScreen ? 3 : 2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything — discuss ideas, coding questions, learn something new, or get career guidance..."
            className="w-full bg-[#03091B] border border-[#53D8FF]/20 focus:border-[#53D8FF] focus:ring-1 focus:ring-[#53D8FF] rounded-2xl pl-4 pr-14 py-3 text-sm text-[#F4F7FF] placeholder-[#A7B6D4]/50 focus:outline-none resize-none leading-relaxed max-h-48 overflow-y-auto"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className={`absolute right-2.5 p-2.5 rounded-xl transition-all duration-200 ${
              input.trim() && !loading
                ? 'bg-gradient-to-r from-[#238BFF] to-[#7657FF] text-white shadow-[0_0_15px_rgba(35,139,255,0.4)] hover:scale-105'
                : 'text-slate-500 bg-[#07132E] cursor-not-allowed'
            }`}
            title="Send message"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#A7B6D4] pt-2 px-1">
          <span>Press Enter to send, Shift+Enter for newline</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Natural conversational AI</span>
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Standard non-fullscreen view */}
      {!isFullScreen ? (
        <div className={`space-y-6 ${compactMode ? 'h-full' : 'max-w-5xl mx-auto'}`}>
          {/* Header (when not compact) */}
          {!compactMode && (
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#07132E] border border-[#53D8FF]/30 text-xs font-medium text-[#53D8FF]">
                <Bot className="w-3.5 h-3.5 text-[#53D8FF]" />
                <span>Interactive AI Career Mentor</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FF]">
                AI Career Guide
              </h2>
              <p className="text-[#A7B6D4] text-base leading-relaxed">
                Get personalized guidance on what to learn next, prioritize your skill roadmap, and brainstorm standout portfolio projects.
              </p>
            </div>
          )}

          {chatContainerContent}
        </div>
      ) : (
        /* Full-Screen Overlay View (Desktop, Tablet, Mobile) */
        <div className="fixed inset-0 z-[100] w-screen h-screen bg-[#03091B]/95 backdrop-blur-2xl flex flex-col p-2 sm:p-4 md:p-6 lg:p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {chatContainerContent}
        </div>
      )}
    </>
  );
};
