"use client";

import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { 
  FileText, 
  ListTree, 
  AlignLeft, 
  Copy, 
  Check, 
  Download, 
  Search, 
  Clock, 
  Sparkles,
  ChevronRight,
  Bookmark
} from "lucide-react";
import { Chapter, TranscriptSegment } from "@/data/demoPresets";

interface NotesPanelProps {
  summary: string;
  chapters?: Chapter[];
  transcript?: TranscriptSegment[];
  onSeek?: (timestamp: number) => void;
}

export default function NotesPanel({ summary, chapters = [], transcript = [], onSeek }: NotesPanelProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "chapters" | "transcript">("summary");
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([summary], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `timemark-summary-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter transcript segments by search query
  const filteredTranscript = useMemo(() => {
    if (!searchQuery.trim()) return transcript;
    const q = searchQuery.toLowerCase();
    return transcript.filter((seg) => seg.text.toLowerCase().includes(q));
  }, [transcript, searchQuery]);

  return (
    <div className="glass-panel-elevated rounded-2xl h-full flex flex-col overflow-hidden border border-zinc-800">
      {/* Header with Navigation Tabs & Action Buttons */}
      <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/40 flex flex-wrap items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "summary"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Summary</span>
          </button>

          {chapters.length > 0 && (
            <button
              onClick={() => setActiveTab("chapters")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "chapters"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <ListTree className="w-3.5 h-3.5 text-cyan-400" />
              <span>Chapters ({chapters.length})</span>
            </button>
          )}

          {transcript.length > 0 && (
            <button
              onClick={() => setActiveTab("transcript")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "transcript"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5 text-violet-400" />
              <span>Transcript</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white transition-colors"
            title="Copy summary to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white transition-colors"
            title="Download as Markdown"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Export .md</span>
          </button>
        </div>
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* TAB 1: SUMMARY */}
        {activeTab === "summary" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Executive Synthesis & Key Notes</span>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">
                AI Structured Analysis
              </span>
            </div>

            {summary ? (
              <div className="text-zinc-300 text-sm leading-relaxed prose prose-invert max-w-none 
                [&>h3]:text-white [&>h3]:font-semibold [&>h3]:text-base [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:flex [&>h3]:items-center [&>h3]:gap-2
                [&>p]:mb-4 [&>p]:text-zinc-300 [&>p]:leading-relaxed
                [&>ul]:space-y-2 [&>ul]:mb-6 [&>ul]:list-none [&>ul]:pl-0
                [&>ul>li]:relative [&>ul>li]:pl-6 [&>ul>li]:text-zinc-300
                [&>ul>li]:before:content-[''] [&>ul>li]:before:absolute [&>ul>li]:before:left-1.5 [&>ul>li]:before:top-2.5 [&>ul>li]:before:w-1.5 [&>ul>li]:before:h-1.5 [&>ul>li]:before:bg-emerald-400 [&>ul>li]:before:rounded-full
                [&>strong]:text-white [&>strong]:font-semibold
              ">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-zinc-500 text-xs">
                <span>No summary available yet.</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CHAPTERS & TIMELINE */}
        {activeTab === "chapters" && (
          <div className="space-y-3">
            <p className="text-xs text-zinc-400 pb-1">
              Click any chapter timestamp to seek the video player immediately:
            </p>

            <div className="space-y-2.5">
              {chapters.map((chap, idx) => (
                <div
                  key={idx}
                  onClick={() => onSeek && onSeek(chap.timestamp)}
                  className="group p-3.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-cyan-500/40 transition-all cursor-pointer flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 font-mono text-xs font-semibold border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-zinc-950 transition-colors">
                        {formatTime(chap.timestamp)}
                      </span>
                      <h4 className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">
                        {chap.title}
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-400 leading-normal pl-0.5">
                      {chap.description}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TRANSCRIPT WITH SEARCH */}
        {activeTab === "transcript" && (
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transcript by keyword..."
                className="w-full pl-9 pr-3 py-2 bg-zinc-900/90 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="space-y-2">
              {filteredTranscript.map((seg, idx) => (
                <div
                  key={idx}
                  onClick={() => onSeek && onSeek(seg.start)}
                  className="group p-2.5 rounded-lg hover:bg-zinc-900/80 border border-transparent hover:border-zinc-800 transition-all cursor-pointer flex items-start gap-3"
                >
                  <button
                    type="button"
                    className="shrink-0 px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 group-hover:bg-violet-500/20 group-hover:text-violet-300 font-mono text-[11px] transition-colors"
                  >
                    {formatTime(seg.start)}
                  </button>
                  <p className="text-xs text-zinc-300 group-hover:text-white leading-relaxed">
                    {seg.text}
                  </p>
                </div>
              ))}

              {filteredTranscript.length === 0 && (
                <p className="text-center text-xs text-zinc-500 py-6">
                  No matching transcript lines found.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
