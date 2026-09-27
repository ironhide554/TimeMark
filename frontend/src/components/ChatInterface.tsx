"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Clock } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

interface ChatInterfaceProps {
  videoId: string;
  onSeek: (timestamp: number) => void;
}

export default function ChatInterface({ videoId, onSeek }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
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
        content: `**Error:** ${err.message}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-carbon)] rounded-[12px] shadow-[var(--shadow-md)]" style={{ boxShadow: 'rgb(35, 37, 42) 0px 0px 0px 1px inset' }}>
      <div className="border-b border-[var(--color-smoke)] p-[24px] rounded-t-[12px]">
        <h2 className="text-[16px] font-[590] tracking-[-0.011em] text-[var(--color-paper)]">Video Q&A</h2>
        <p className="text-[13px] text-[var(--color-ash)] mt-1">Ask questions, get answers with exact timestamps.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-[24px] space-y-[24px]">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-[13px] text-[var(--color-ash)]">
            Send a message to start chatting!
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div 
              className={`max-w-[90%] rounded-[12px] p-[16px] ${
                msg.role === "user" ? "bg-[var(--color-slate)] text-[var(--color-mist)]" : "bg-transparent text-[var(--color-mist)] px-0"
              }`}
            >
              <div className="text-[15px] leading-[1.6] tracking-[-0.011em] [&>p]:mb-3 last:[&>p]:mb-0 [&>strong]:text-[var(--color-paper)] [&>strong]:font-[510]">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
            
            {msg.role === "assistant" && msg.timestamp !== undefined && (
              <button
                onClick={() => onSeek(msg.timestamp!)}
                className="mt-2 inline-flex items-center text-[12px] bg-[rgba(255,255,255,0.05)] text-[var(--color-ash)] rounded-[4px] px-[6px] py-[2px] font-normal hover:bg-[rgba(255,255,255,0.1)] hover:text-[var(--color-mist)] transition-colors"
              >
                <Clock className="w-3 h-3 mr-1.5" />
                Jump to {formatTime(msg.timestamp)}
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-start">
            <div className="text-[14px] text-[var(--color-ash)] animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-[24px] border-t border-[var(--color-smoke)]">
        <div className="flex relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 px-[14px] py-[12px] pr-[40px] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] rounded-[6px] text-[var(--color-mist)] text-[14px] focus:outline-none focus:border-[var(--color-mist)] transition-colors"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--color-ash)] hover:text-[var(--color-mist)] disabled:opacity-50 transition-colors"
          >
            <Send className="w-[18px] h-[18px]" />
          </button>
        </div>
      </form>
    </div>
  );
}
