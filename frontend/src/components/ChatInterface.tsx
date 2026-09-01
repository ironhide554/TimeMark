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
    <div className="flex flex-col h-full bg-white shadow-md rounded-lg border border-gray-200">
      <div className="bg-gray-50 border-b border-gray-200 p-4 rounded-t-lg">
        <h2 className="text-xl font-bold text-gray-800">Video Q&A</h2>
        <p className="text-sm text-gray-500">Ask questions, get answers with exact timestamps.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-400">
            Send a message to start chatting!
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div 
              className={`max-w-[85%] rounded-lg p-3 ${
                msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              <div className="prose prose-sm max-w-none text-inherit">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
            
            {msg.role === "assistant" && msg.timestamp !== undefined && (
              <button
                onClick={() => onSeek(msg.timestamp!)}
                className="mt-1 flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                <Clock className="w-3 h-3 mr-1" />
                Jump to {formatTime(msg.timestamp)}
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-start">
            <div className="bg-gray-100 rounded-lg p-3 text-gray-500 animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
        <div className="flex relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the video..."
            className="flex-1 p-3 pr-12 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
