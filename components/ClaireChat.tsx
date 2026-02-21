import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, User, Loader2, Sparkles } from 'lucide-react';
import { createChatSession } from '../services/geminiService';
import { GenerateContentResponse, Content } from "@google/genai";
import { Message, Job } from '../types';

interface NtimChatProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  jobs?: Job[];
  onEditJob?: (jobId: string, updates: Partial<Job>) => void;
}

// Parse and strip [ACTION:EDIT_JOB {...}] tags from AI response
const parseActions = (text: string): { cleanText: string; edits: { id: string; updates: Partial<Job> }[] } => {
  const edits: { id: string; updates: Partial<Job> }[] = [];
  const actionRegex = /\[ACTION:EDIT_JOB\s+(\{[^\]]+\})\]/g;
  let match;
  while ((match = actionRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.id && parsed.updates) {
        edits.push({ id: parsed.id, updates: parsed.updates });
      }
    } catch (e) {
      console.error('Failed to parse action tag:', match[0], e);
    }
  }
  const cleanText = text.replace(/\[ACTION:EDIT_JOB\s+\{[^\]]+\}\]/g, '').trim();
  return { cleanText, edits };
};

// Custom Icon for Ntim (Friendly Male/Neutral Avatar)
const NtimIcon = ({ className, size = 20 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Short Hair / Head top */}
    <path d="M4 8.5c0-3 2.5-5.5 8-5.5s8 2.5 8 5.5" />
    <path d="M4 8.5v2a4 4 0 0 0 4 4" /> {/* Sideburn L */}
    <path d="M20 8.5v2a4 4 0 0 1-4 4" /> {/* Sideburn R */}

    {/* Chin */}
    <path d="M8 14.5c0 3 1.5 4.5 4 4.5s4-1.5 4-4.5" />

    {/* Ears */}
    <path d="M3 10v2" />
    <path d="M21 10v2" />

    {/* Shoulders */}
    <path d="M4 22a8 8 0 0 1 16 0" />
  </svg>
);

const renderMessageText = (text: string) => {
  if (!text) return null;

  // 1. Split by Code Blocks (``` ... ```)
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    // A. Render Code Block
    if (part.startsWith('```') && part.endsWith('```')) {
      let content = part.slice(3, -3);
      // Optional: Remove language identifier from first line if present (e.g. ```javascript)
      content = content.replace(/^[a-z]+\n/, '').trim();

      return (
        <pre key={index} className="bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto my-3 text-xs font-mono border border-slate-700 shadow-sm">
          <code>{content}</code>
        </pre>
      );
    }

    // B. Render Regular Text (with Bold and Lists)
    return (
      <div key={index} className="space-y-1">
        {part.split('\n').map((line, lineIdx) => {
          if (!line.trim()) return <div key={lineIdx} className="h-2" />;

          // Detect List Items (* or -)
          const isListItem = /^[\*\-]\s/.test(line);
          const cleanLine = isListItem ? line.replace(/^[\*\-]\s/, '') : line;

          // Parse Bold (**text**)
          const content = cleanLine.split(/(\*\*.*?\*\*)/g).map((subPart, subIdx) => {
            if (subPart.startsWith('**') && subPart.endsWith('**')) {
              return <strong key={subIdx} className="font-bold">{subPart.slice(2, -2)}</strong>;
            }
            return subPart;
          });

          // Render List Item
          if (isListItem) {
            return (
              <div key={lineIdx} className="flex items-start gap-2 pl-2">
                <div className="w-1.5 h-1.5 rounded-full bg-current mt-2 flex-shrink-0 opacity-60" />
                <span>{content}</span>
              </div>
            );
          }

          // Render Normal Line
          return <div key={lineIdx} className="min-h-[1.5em]">{content}</div>;
        })}
      </div>
    );
  });
};

const NtimChat: React.FC<NtimChatProps> = ({ messages, setMessages, jobs, onEditJob }) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Build a compact jobs context string for the AI
  const jobsContext = useMemo(() => {
    if (!jobs || jobs.length === 0) return undefined;
    return jobs.map(j => `- id:"${j.id}" company:"${j.company}" role:"${j.role}" status:"${j.status}" salary:"${j.salary}" location:"${j.location}"`).join('\n');
  }, [jobs]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');

    // Add user message immediately
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Reconstruct history to include any external messages (like status updates)
      // We assume strict alternating turns are required by the API, so we merge consecutive messages of the same role.
      const history = messages.reduce((acc: Content[], msg) => {
        const last = acc[acc.length - 1];
        if (last && last.role === msg.role) {
          // Merge with previous message part to avoid "Please ensure that the turn history alternates" error
          if (last.parts && last.parts[0]) {
            last.parts[0].text += "\n\n" + msg.text;
          }
        } else {
          acc.push({ role: msg.role, parts: [{ text: msg.text }] });
        }
        return acc;
      }, []);

      // Create a fresh session with the up-to-date history and jobs context
      const chatSession = createChatSession(history, jobsContext);
      const result = await chatSession.sendMessageStream({ message: userMessage });

      let fullResponse = '';
      const responseId = (Date.now() + 1).toString();

      // Add placeholder for AI response
      setMessages(prev => [...prev, { id: responseId, role: 'model', text: '' }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const text = c.text || '';
        fullResponse += text;

        // Update the last message with the accumulated text (strip action tags for display)
        const { cleanText } = parseActions(fullResponse);
        setMessages(prev => prev.map(msg =>
          msg.id === responseId ? { ...msg, text: cleanText } : msg
        ));
      }

      // After full response, apply any job edits
      const { edits } = parseActions(fullResponse);
      if (onEditJob && edits.length > 0) {
        edits.forEach(edit => onEditJob(edit.id, edit.updates));
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm having trouble connecting right now. Please try again in a moment."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 relative pt-16 md:pt-0">
      {/* Header */}
      <div className="p-6 border-b border-brand-mint dark:border-slate-800 flex items-center gap-4 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="w-16 h-16 bg-brand-rose dark:bg-slate-800 rounded-full flex items-center justify-center border-2 border-brand-mint dark:border-slate-700">
          <NtimIcon size={32} className="text-brand-primary dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-brand-deep dark:text-white flex items-center gap-2">
            Ntim
            <span className="px-2 py-0.5 bg-brand-mint dark:bg-blue-900/30 text-brand-deep dark:text-blue-200 text-xs rounded-full font-medium">AI Agent</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Always here to help with your career.</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-brand-rose dark:bg-slate-950 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${msg.role === 'user' ? 'bg-brand-deep dark:bg-slate-700' : 'bg-white dark:bg-slate-800 border border-brand-mint dark:border-slate-700'
              }`}>
              {msg.role === 'user' ? (
                <User size={16} className="text-white" />
              ) : (
                <NtimIcon size={16} className="text-brand-primary dark:text-blue-400" />
              )}
            </div>

            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                ? 'bg-brand-primary text-white rounded-tr-none shadow-brand-primary/20'
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-brand-mint dark:border-slate-700 rounded-tl-none'
              }`}>
              {msg.text ? renderMessageText(msg.text) : (isLoading && msg.role === 'model' ? <Loader2 className="animate-spin w-4 h-4" /> : '')}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white dark:bg-slate-900 border-t border-brand-mint dark:border-slate-800">
        <form onSubmit={handleSendMessage} className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask Ntim about resume tips, interview prep, or career advice..."
            className="w-full pl-6 pr-14 py-4 bg-brand-rose dark:bg-slate-800 border border-brand-mint dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none shadow-sm transition-all text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-brand-primary text-white rounded-xl hover:bg-brand-deep disabled:opacity-50 disabled:hover:bg-brand-primary transition-colors shadow-lg shadow-brand-primary/20"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
        <div className="text-center mt-3">
          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
            <Sparkles size={10} />
            Ntim is powered by Gemini AI and can make mistakes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NtimChat;