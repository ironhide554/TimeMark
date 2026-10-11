"use client";

import { RefObject, useState, useEffect, useRef } from "react";
import { 
  Play, 
  RotateCcw, 
  RotateCw, 
  Maximize2, 
  Clock, 
  Film,
  Sparkles 
} from "lucide-react";

interface VideoPlayerProps {
  url: string;
  playerRef: RefObject<any>;
  title?: string;
  duration?: string;
}

export default function VideoPlayer({ url, playerRef, title, duration }: VideoPlayerProps) {
  const [mounted, setMounted] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (playerRef) {
      playerRef.current = {
        seekTo: (seconds: number) => {
          setCurrentSeconds(seconds);
          if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage(JSON.stringify({
              event: 'command',
              func: 'seekTo',
              args: [seconds, true]
            }), '*');
            iframeRef.current.contentWindow.postMessage(JSON.stringify({
              event: 'command',
              func: 'playVideo',
              args: []
            }), '*');
            setIsPlaying(true);
          } else if (videoRef.current) {
            videoRef.current.currentTime = seconds;
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
          }
        }
      };
    }
  }, [playerRef]);

  if (!url || !mounted) return null;

  const isLocalBlob = url.startsWith('blob:');
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');

  let embedUrl = "";
  if (isYouTube) {
    try {
      const urlObj = new URL(url);
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : '';
      
      if (urlObj.hostname.includes('youtube.com')) {
        if (urlObj.pathname.startsWith('/shorts/')) {
          embedUrl = `https://www.youtube.com/embed/${urlObj.pathname.split('/')[2]}?enablejsapi=1${originParam}`;
        } else {
          embedUrl = `https://www.youtube.com/embed/${urlObj.searchParams.get('v')}?enablejsapi=1${originParam}`;
        }
      } else if (urlObj.hostname.includes('youtu.be')) {
        embedUrl = `https://www.youtube.com/embed${urlObj.pathname}?enablejsapi=1${originParam}`;
      }
    } catch {
      embedUrl = "";
    }
  }

  const handleRelativeSeek = (delta: number) => {
    const nextTime = Math.max(0, currentSeconds + delta);
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(nextTime);
    }
  };

  return (
    <div className="space-y-3">
      {/* Container with Ambient Cinematic Glow */}
      <div className="relative group">
        {/* Ambient Backlight Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-violet-500/20 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="relative bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl aspect-video w-full flex flex-col justify-between">
          <div className="absolute inset-0 w-full h-full bg-black">
            {isLocalBlob ? (
              <video
                ref={videoRef}
                src={url}
                controls
                preload="auto"
                onTimeUpdate={(e) => setCurrentSeconds(e.currentTarget.currentTime)}
                className="w-full h-full object-contain"
              />
            ) : isYouTube && embedUrl ? (
              <iframe
                ref={iframeRef}
                src={embedUrl}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 text-sm gap-2">
                <Film className="w-8 h-8 text-zinc-600" />
                <span>Unsupported video format or invalid URL</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Seek Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/60 rounded-xl border border-zinc-800/80 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[11px]">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Position: {formatTime(currentSeconds)}</span>
            {duration && <span className="text-zinc-500">/ {duration}</span>}
          </span>
          {title && (
            <span className="hidden sm:inline-block max-w-xs truncate text-zinc-400 font-medium">
              • {title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleRelativeSeek(-10)}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Rewind 10 seconds"
          >
            <RotateCcw className="w-3 h-3" />
            <span>-10s</span>
          </button>
          <button
            type="button"
            onClick={() => handleRelativeSeek(10)}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
            title="Forward 10 seconds"
          >
            <RotateCw className="w-3 h-3" />
            <span>+10s</span>
          </button>
        </div>
      </div>
    </div>
  );
}
