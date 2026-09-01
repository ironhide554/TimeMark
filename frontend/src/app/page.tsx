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
  
  const playerRef = useRef<ReactPlayer>(null);

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
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-600">TimeMark</h1>
            <p className="text-gray-500 mt-1">Free & Local AI Video Summarizer</p>
          </div>
          {videoId && (
            <button 
              onClick={handleReset}
              className="text-gray-600 hover:text-blue-600 font-medium"
            >
              Start Over
            </button>
          )}
        </header>

        {status === "idle" && (
          <UploadForm onVideoProcessed={handleVideoProcessed} />
        )}

        {status === "processing" && (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800">Processing Video</h2>
            <p className="text-gray-500 mt-2">
              Downloading, transcribing, and running AI locally. This may take a few minutes depending on your GPU.
            </p>
          </div>
        )}

        {status === "failed" && (
          <div className="bg-red-50 p-12 rounded-lg shadow-md text-center border border-red-200">
            <h2 className="text-2xl font-bold text-red-700">Processing Failed</h2>
            <p className="text-red-500 mt-2">There was an error processing your video.</p>
            <button 
              onClick={handleReset}
              className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {status === "completed" && videoId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
            <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
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
