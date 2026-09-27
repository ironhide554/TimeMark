"use client";

import { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import UploadForm from "@/components/UploadForm";
import VideoPlayer from "@/components/VideoPlayer";
import NotesPanel from "@/components/NotesPanel";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "completed" | "failed">("idle");
  const [summary, setSummary] = useState<string>("");
  
  const playerRef = useRef<any>(null);

  // Poll for status if processing
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (videoId && status === "processing") {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:8000/api/video/${videoId}/status`);
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
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [videoId, status]);

  const handleVideoProcessed = (id: string, type: string, url?: string) => {
    setVideoId(id);
    if (url) setVideoUrl(url);
    setStatus("processing");
  };

  const handleSeek = (timestamp: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(timestamp, "seconds");
      // Optional: scroll up to player
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleReset = () => {
    setVideoId(null);
    setVideoUrl(null);
    setStatus("idle");
    setSummary("");
  };

  return (
    <main className="min-h-screen bg-[var(--color-void)] p-[24px]">
      <div className="max-w-[1200px] mx-auto space-y-[96px]">
        
        {/* Navigation Bar */}
        <header className="flex items-center justify-between bg-transparent py-[16px] max-w-[1200px] mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-paper)] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-void)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <h1 className="text-[16px] font-[510] text-[var(--color-paper)] leading-none">
                TimeMark
              </h1>
              <p className="text-[var(--color-ash)] text-[13px] mt-1 leading-none">Free & Local AI Video Summarizer</p>
            </div>
          </div>
          {videoId && (
            <button 
              onClick={handleReset}
              className="px-[12px] py-[6px] text-[13px] font-normal text-[var(--color-mist)] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] rounded-full transition-colors border border-transparent hover:border-[rgba(255,255,255,0.1)]"
            >
              Start Over
            </button>
          )}
        </header>

        {status === "idle" && (
          <UploadForm onVideoProcessed={handleVideoProcessed} />
        )}

        {status === "processing" && (
          <div className="bg-[var(--color-carbon)] p-[48px] rounded-[12px] text-center max-w-xl mx-auto shadow-[var(--shadow-md)]" style={{ boxShadow: 'rgb(35, 37, 42) 0px 0px 0px 1px inset' }}>
            <div className="animate-spin rounded-full h-[64px] w-[64px] border-b-[2px] border-[var(--color-acid-lime)] mx-auto mb-[24px]"></div>
            <h2 className="text-[24px] font-normal text-[var(--color-paper)]">Processing Video</h2>
            <p className="text-[var(--color-ash)] mt-2 text-[15px] leading-[1.6]">
              Downloading, transcribing, and running AI locally. This may take a few minutes depending on your GPU.
            </p>
          </div>
        )}

        {status === "failed" && (
          <div className="bg-[var(--color-carbon)] p-[48px] rounded-[12px] text-center max-w-xl mx-auto shadow-[var(--shadow-md)] relative overflow-hidden" style={{ boxShadow: 'rgb(35, 37, 42) 0px 0px 0px 1px inset' }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-coral-red)] opacity-50"></div>
            <h2 className="text-[24px] font-normal text-[var(--color-paper)]">Processing Failed</h2>
            <p className="text-[var(--color-coral-red)] mt-2 text-[15px]">There was an error processing your video.</p>
            <button 
              onClick={handleReset}
              className="mt-8 bg-[var(--color-acid-lime)] text-[var(--color-void)] px-[16px] py-[10px] rounded-[6px] text-[14px] font-[510] tracking-[-0.011em] hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        )}

        {status === "completed" && videoId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px] h-[calc(100vh-200px)]">
            <div className="lg:col-span-2 space-y-[24px] flex flex-col h-full">
              <VideoPlayer url={videoUrl || ""} playerRef={playerRef} />
              <div className="flex-1 min-h-[300px]">
                <NotesPanel summary={summary} />
              </div>
            </div>
            
            <div className="lg:col-span-1 h-full min-h-[500px]">
              <ChatInterface videoId={videoId} onSeek={handleSeek} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
