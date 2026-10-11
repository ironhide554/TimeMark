"use client";

import { useState, useRef } from "react";
import { 
  Upload, 
  Sparkles, 
  FileVideo, 
  Clock, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Video
} from "lucide-react";
import { DEMO_PRESETS, DemoPreset } from "@/data/demoPresets";
import { API_BASE_URL } from "@/config/api";

function YoutubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

interface UploadFormProps {
  onVideoProcessed: (id: string, type: string, url?: string, isDemo?: boolean, demoData?: DemoPreset) => void;
}

export default function UploadForm({ onVideoProcessed }: UploadFormProps) {
  const [activeTab, setActiveTab] = useState<"youtube" | "upload" | "presets">("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract YouTube ID for preview if valid
  const getYoutubeVideoId = (url: string) => {
    try {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };

  const detectedVideoId = getYoutubeVideoId(youtubeUrl);

  const handleYoutubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/process/youtube`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to process YouTube URL");

      onVideoProcessed(data.video_id, "youtube", youtubeUrl, false);
    } catch (err: any) {
      // Check if it's a connection error and offer demo mode
      const isConnectionError = err.message.includes("Failed to fetch") || err.message.includes("NetworkError");
      if (isConnectionError) {
        setError("Could not connect to the local Python backend on http://localhost:8000. Start backend server (uvicorn main:app) or try our Interactive Demo samples below!");
      } else {
        setError(err.message || "Failed to process video");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/process/upload`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to upload video");

      const fileUrl = URL.createObjectURL(file);
      onVideoProcessed(data.video_id, "upload", fileUrl, false);
    } catch (err: any) {
      const isConnectionError = err.message.includes("Failed to fetch") || err.message.includes("NetworkError");
      if (isConnectionError) {
        setError("Could not connect to the local Python backend on http://localhost:8000. Start backend server (uvicorn main:app) or try our Interactive Demo samples below!");
      } else {
        setError(err.message || "Failed to upload video");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith("video/") || droppedFile.name.endsWith(".mp4") || droppedFile.name.endsWith(".mkv")) {
        setFile(droppedFile);
        setError("");
      } else {
        setError("Please drop a valid video file (.mp4, .mkv, .mov, etc.)");
      }
    }
  };

  const loadPreset = (preset: DemoPreset) => {
    onVideoProcessed(preset.id, "youtube", preset.youtubeUrl, true, preset);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Local AI Video Intelligence Platform</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
          Turn hours of video into{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            instant knowledge & timestamps
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-base text-zinc-400 leading-relaxed">
          Automatically transcribe spoken audio, generate structured chapter notes, and interrogate video content with sub-second jump-to-time retrieval.
        </p>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900/80 border border-zinc-800">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>High-Speed Neural Processing</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900/80 border border-zinc-800">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sub-Second Timestamp Seeking</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900/80 border border-zinc-800">
            <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            <span>Automated Chapter Notes</span>
          </div>
        </div>
      </div>

      {/* Main Action Container */}
      <div className="glass-panel-elevated rounded-2xl p-6 md:p-8 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Navigation Tabs */}
        <div className="flex items-center justify-center p-1 bg-zinc-900/80 rounded-xl border border-zinc-800 mb-8 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab("youtube")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === "youtube"
                ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <YoutubeIcon className="w-4 h-4 text-red-500" />
            <span>YouTube URL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === "upload"
                ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FileVideo className="w-4 h-4 text-emerald-400" />
            <span>Upload File</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === "presets"
                ? "bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/30"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Try Demos</span>
          </button>
        </div>

        {/* Tab 1: YouTube Form */}
        {activeTab === "youtube" && (
          <form onSubmit={handleYoutubeSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Enter YouTube Video Link
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 pointer-events-none text-zinc-500">
                  <YoutubeIcon className="w-5 h-5 text-red-500/80" />
                </div>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=aircAruvnKk or youtu.be/..."
                  className="w-full pl-12 pr-28 py-3.5 bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 rounded-xl text-white text-sm placeholder-zinc-500 transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (text) setYoutubeUrl(text);
                    } catch {}
                  }}
                  className="absolute right-3 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
                >
                  Paste
                </button>
              </div>
            </div>

            {/* Video preview chip if valid URL */}
            {detectedVideoId && (
              <div className="flex items-center gap-3 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
                <div className="w-16 h-10 bg-black rounded-lg overflow-hidden shrink-0 relative">
                  <img
                    src={`https://img.youtube.com/vi/${detectedVideoId}/mqdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-200 truncate">YouTube Video Detected</p>
                  <p className="text-[11px] text-zinc-500">ID: {detectedVideoId}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !youtubeUrl}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-medium text-sm text-zinc-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Submitting to Transcription Engine...</span>
                </>
              ) : (
                <>
                  <span>Process Video & Build Index</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 2: Upload File Form */}
        {activeTab === "upload" && (
          <form onSubmit={handleFileUpload} className="space-y-6">
            <input
              type="file"
              accept="video/*,.mp4,.mkv,.mov,.webm,.m4a"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-emerald-500 bg-emerald-500/5"
                  : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/60"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto mb-3 text-zinc-400">
                <Upload className="w-6 h-6 text-emerald-400" />
              </div>
              
              {file ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-emerald-400">{file.name}</p>
                  <p className="text-xs text-zinc-500">{(file.size / (1024 * 1024)).toFixed(1)} MB • Click or drag to change</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-zinc-200">
                    Click to browse or drag & drop video
                  </p>
                  <p className="text-xs text-zinc-500">
                    Supports MP4, MKV, MOV, WebM, M4A (processed locally on your machine)
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-medium text-sm text-zinc-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Uploading to Local Pipeline...</span>
                </>
              ) : (
                <>
                  <span>Upload & Transcribe Audio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 3: Presets & Demo Exploration */}
        {activeTab === "presets" && (
          <div className="space-y-4">
            <div className="text-center pb-2">
              <p className="text-xs text-emerald-400 font-medium">
                ⚡ Instant Portfolio Showcase • No backend server installation required
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Select a pre-computed lecture with complete timestamps, notes, and Q&A to test the full experience immediately:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEMO_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => loadPreset(preset)}
                  className="group relative p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900/90 transition-all cursor-pointer text-left flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                        {preset.badge}
                      </span>
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {preset.duration}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                      {preset.title}
                    </h3>
                    <p className="text-xs text-zinc-400">by {preset.creator}</p>
                  </div>

                  <div className="pt-4 flex items-center justify-between text-xs text-emerald-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Launch Demo Workspace
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-rose-200">Processing Notice</p>
              <p className="mt-0.5 text-rose-300/90 leading-relaxed">{error}</p>
              {error.includes("Interactive Demo") && (
                <button
                  type="button"
                  onClick={() => setActiveTab("presets")}
                  className="mt-2.5 inline-flex items-center gap-1 text-emerald-400 font-semibold hover:underline"
                >
                  <span>Switch to Interactive Demos</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Feature Highlights Footer */}
      <div className="pt-4 border-t border-zinc-800/60 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
        <span className="font-medium text-zinc-400">Core Capabilities:</span>
        <span className="hover:text-zinc-300 transition-colors">Instant Summaries</span>
        <span>•</span>
        <span className="hover:text-zinc-300 transition-colors">Precise Sub-Second Timestamps</span>
        <span>•</span>
        <span className="hover:text-zinc-300 transition-colors">Conversational Video Q&A</span>
        <span>•</span>
        <span className="hover:text-zinc-300 transition-colors">Markdown Export</span>
      </div>
    </div>
  );
}
