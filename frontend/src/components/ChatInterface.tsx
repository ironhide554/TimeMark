"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { 
  Send, 
  Clock, 
  Sparkles, 
  Bot, 
  User, 
  RotateCcw, 
  Copy, 
  Check, 
  HelpCircle,
  Database,
  ArrowUpRight
} from "lucide-react";
import { DemoPreset } from "@/data/demoPresets";
import { API_BASE_URL } from "@/config/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

interface ChatInterfaceProps {
  videoId: string;
  onSeek: (timestamp: number) => void;
  demoData?: DemoPreset | null;
}

export default function ChatInterface({ videoId, onSeek, demoData }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (questionText?: string) => {
    const query = (questionText || input).trim();
    if (!query || loading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // If in demo preset mode, check if we have matching sample Q&A
    if (demoData) {
      setTimeout(() => {
        const matched = demoData.sampleQA.find(
          (qa) => qa.question.toLowerCase().includes(query.toLowerCase()) || 
                  query.toLowerCase().includes(qa.question.toLowerCase().slice(0, 15))
        );

        if (matched) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: matched.answer,
            timestamp: matched.timestamp,
          };
          setMessages((prev) => [...prev, aiMessage]);
        } else {
          // General relevant mock response using preset data
          const firstChap = demoData.chapters[1] || demoData.chapters[0];
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `Based on the video transcript for **${demoData.title}**, this concept is discussed in detail around chapter: **${firstChap.title}**.\n\nKey context from the video indicates that the system relies on vector-indexed audio segments to match the queried terminology.`,
            timestamp: firstChap.timestamp,
          };
          setMessages((prev) => [...prev, aiMessage]);
        }
        setLoading(false);
      }, 700);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: videoId, question: userMessage.content }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail || "Failed to fetch answer");

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        timestamp: data.timestamp > 0 ? data.timestamp : undefined,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `**API Notice:** ${err.message}. If the backend server is offline, you can try our interactive Demo Presets from the home screen for complete local simulation.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
  };

  const suggestedQuestions = demoData?.suggestedQuestions || [
    "What are the main takeaways of this video?",
    "Where is the core architecture discussed?",
    "Summarize the final conclusion"
  ];

  return (
    <div className="glass-panel-elevated rounded-2xl h-full flex flex-col overflow-hidden border border-zinc-800">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Timestamped Q&A</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-zinc-400">Instant Semantic Search</p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleResetChat}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center p-4 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-inner">
              <Bot className="w-6 h-6 text-emerald-400" />
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Ask anything about the video</p>
              <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                Answers are grounded in transcribed audio chunks and cite exact timestamps.
              </p>
            </div>

            {/* Suggested Starter Chips */}
            <div className="w-full pt-2 space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Suggested Questions
              </p>
              <div className="flex flex-col gap-1.5">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="w-full text-left p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-emerald-500/40 text-xs text-zinc-300 hover:text-white transition-all flex items-center justify-between group"
                  >
                    <span className="truncate pr-2">{q}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-white rounded-br-sm"
                    : "bg-zinc-900/90 border border-zinc-800/80 text-zinc-200 rounded-bl-sm space-y-2"
                }`}
              >
                <div className="prose prose-invert prose-xs max-w-none leading-relaxed [&>p]:mb-2 last:[&>p]:mb-0 [&>strong]:text-white">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                {/* Timestamp Jump Pill for Assistant Responses */}
                {msg.role === "assistant" && msg.timestamp !== undefined && (
                  <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSeek(msg.timestamp!)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold transition-all hover:scale-105"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Seek to {formatTime(msg.timestamp)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="text-zinc-500 hover:text-zinc-300 p-1"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-3 items-start">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-sm p-3 flex items-center gap-2 text-xs text-zinc-400">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Searching transcript moments...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-zinc-800/80 bg-zinc-950/60"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about timestamps or content..."
            disabled={loading}
            className="w-full pl-3.5 pr-10 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-emerald-500/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-1.5 text-zinc-400 hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors cursor-pointer"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
