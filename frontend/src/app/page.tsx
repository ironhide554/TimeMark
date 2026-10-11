"use client";

import { useState, useRef, useEffect } from "react";
import UploadForm from "@/components/UploadForm";
import VideoPlayer from "@/components/VideoPlayer";
import NotesPanel from "@/components/NotesPanel";
import ChatInterface from "@/components/ChatInterface";
import { DemoPreset, DEMO_PRESETS } from "@/data/demoPresets";
import { API_BASE_URL } from "@/config/api";
import { 
  Sparkles, 
  RotateCcw, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  Film, 
  AlertTriangle,
  Layers,
  FileText,
  Share2
} from "lucide-react";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

export default function Home() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "completed" | "failed">("idle");
  const [summary, setSummary] = useState<string>("");
  const [demoData, setDemoData] = useState<DemoPreset | null>(null);
  const [processingStep, setProcessingStep] = useState<number>(1);
  
  const playerRef = useRef<any>(null);

  // Poll for status if processing a real video
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (videoId && status === "processing" && !demoData) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/video/${videoId}/status`);
          const data = await res.json();

          if (data.status === "completed") {
            setStatus("completed");
            setSummary(data.summary);
            clearInterval(intervalId);
          } else if (data.status === "failed") {
            setStatus("failed");
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error("Failed to fetch status:", error);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [videoId, status, demoData]);

  // Demo mode processing animation simulation
  useEffect(() => {
    if (status === "processing" && demoData) {
      setProcessingStep(1);
      const timer1 = setTimeout(() => setProcessingStep(2), 700);
      const timer2 = setTimeout(() => setProcessingStep(3), 1400);
      const timer3 = setTimeout(() => {
        setProcessingStep(4);
        setStatus("completed");
        setSummary(demoData.summary);
      }, 2100);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [status, demoData]);

  const handleVideoProcessed = (
    id: string, 
    type: string, 
    url?: string, 
    isDemo?: boolean, 
    preset?: DemoPreset
  ) => {
    setVideoId(id);
    if (url) setVideoUrl(url);
    if (isDemo && preset) {
      setDemoData(preset);
    } else {
      setDemoData(null);
    }
    setStatus("processing");
  };

  const handleSeek = (timestamp: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(timestamp);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleReset = () => {
    setVideoId(null);
    setVideoUrl(null);
    setStatus("idle");
    setSummary("");
    setDemoData(null);
    setProcessingStep(1);
  };

  return (
    <main className="min-h-screen bg-[var(--color-void)] bg-grid-pattern relative flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Ambient background glow orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed top-1/3 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/3 w-96 h-96 bg-violet-500/5 rounded-full blur-[128px] pointer-events-none" />

      {/* Header Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/70 border-b border-zinc-800/80 px-4 md:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div 
            onClick={handleReset} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#060709" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-tight">TimeMark</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  AI Studio v2
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Sub-Second Video Summarization & Knowledge Retrieval
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            {demoData && (
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Showcase Demo Mode</span>
              </span>
            )}

            {videoId && (
              <button 
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-700/80 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Video</span>
              </button>
            )}

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors"
              title="View on GitHub"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center">
        {/* STATE 1: IDLE / UPLOAD */}
        {status === "idle" && (
          <div className="my-auto py-8">
            <UploadForm onVideoProcessed={handleVideoProcessed} />
          </div>
        )}

        {/* STATE 2: PROCESSING MULTI-STAGE PIPELINE */}
        {status === "processing" && (
          <div className="max-w-xl mx-auto w-full my-auto py-12">
            <div className="glass-panel-elevated rounded-2xl p-8 border border-zinc-800 relative overflow-hidden space-y-6">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 animate-pulse" />

              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 mb-3">
                  <Cpu className="w-6 h-6 animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-white">Analyzing Video Content</h2>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Audio extraction, speech transcription, and chapter structuring in progress.
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-3 pt-2">
                {[
                  { step: 1, label: "Audio Stream Extraction & Demuxing" },
                  { step: 2, label: "Neural Speech Transcription & Alignment" },
                  { step: 3, label: "Semantic Timeline & Chapter Indexing" },
                  { step: 4, label: "Executive Summary & Key Takeaways Generation" },
                ].map(({ step, label }) => {
                  const isDone = processingStep > step;
                  const isCurrent = processingStep === step;

                  return (
                    <div 
                      key={step} 
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        isDone 
                          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" 
                          : isCurrent 
                          ? "bg-zinc-800/80 border-cyan-500/40 text-white shadow-sm"
                          : "bg-zinc-900/30 border-zinc-800/60 text-zinc-600"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-zinc-700 flex items-center justify-center text-[10px] shrink-0 font-mono">
                          {step}
                        </div>
                      )}
                      <span className="text-xs font-medium truncate">{label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-4"
                >
                  Cancel and return to home
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STATE 3: FAILED */}
        {status === "failed" && (
          <div className="max-w-md mx-auto w-full my-auto py-12">
            <div className="glass-panel-elevated rounded-2xl p-8 border border-rose-500/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Pipeline Execution Stopped</h2>
              <p className="text-xs text-zinc-400">
                Could not complete audio processing. Please check the backend connection and video URL.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button 
                  onClick={handleReset}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
                >
                  Try Another Video
                </button>
                <button
                  onClick={() => {
                    const preset = DEMO_PRESETS[0];
                    handleVideoProcessed(preset.id, "youtube", preset.youtubeUrl, true, preset);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
                >
                  Explore Showcase Demo Instead
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STATE 4: COMPLETED WORKSPACE */}
        {status === "completed" && videoId && (
          <div className="space-y-6 py-4">
            {/* Workspace Title & Source Meta */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Film className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm md:text-base font-semibold text-white truncate">
                    {demoData ? demoData.title : "Indexed Video Workspace"}
                  </h2>
                  <p className="text-xs text-zinc-400 truncate">
                    {demoData ? `By ${demoData.creator} • ${demoData.duration}` : videoUrl}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Analysis Ready</span>
                </span>
              </div>
            </div>

            {/* Split Screen Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[680px]">
              {/* Left Column (Video Player + Summary/Chapters Hub) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <VideoPlayer 
                  url={videoUrl || ""} 
                  playerRef={playerRef} 
                  title={demoData?.title}
                  duration={demoData?.duration}
                />
                <div className="flex-1 min-h-[360px]">
                  <NotesPanel 
                    summary={summary} 
                    chapters={demoData?.chapters}
                    transcript={demoData?.transcript}
                    onSeek={handleSeek}
                  />
                </div>
              </div>
              
              {/* Right Column (Timestamped Chat Assistant) */}
              <div className="lg:col-span-5 h-[680px] lg:h-auto flex flex-col">
                <ChatInterface 
                  videoId={videoId} 
                  onSeek={handleSeek} 
                  demoData={demoData}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950/80 py-4 px-4 md:px-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>© 2026 TimeMark AI. Intelligent video knowledge engine.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-zinc-300 transition-colors">Smart Summaries</span>
            <span>•</span>
            <span className="hover:text-zinc-300 transition-colors">Timestamp Seeking</span>
            <span>•</span>
            <span className="hover:text-zinc-300 transition-colors">Interactive Chat</span>
            <span>•</span>
            <span className="hover:text-zinc-300 transition-colors">Notes Export</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
