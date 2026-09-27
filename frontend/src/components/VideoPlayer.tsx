"use client";

import { RefObject, useState, useEffect, useRef } from "react";

interface VideoPlayerProps {
  url: string;
  playerRef: RefObject<any>;
}

export default function VideoPlayer({ url, playerRef }: VideoPlayerProps) {
  const [mounted, setMounted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (playerRef) {
      playerRef.current = {
        seekTo: (seconds: number) => {
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
          } else if (videoRef.current) {
            videoRef.current.currentTime = seconds;
            videoRef.current.play().catch(() => {});
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
    } catch (e) {
      embedUrl = "";
    }
  }

  return (
    <div className="bg-[var(--color-carbon)] rounded-[12px] overflow-hidden shadow-[var(--shadow-md)] aspect-video w-full relative" style={{ boxShadow: 'rgb(35, 37, 42) 0px 0px 0px 1px inset' }}>
      <div className="absolute inset-0 w-full h-full bg-[#000]">
        {isLocalBlob ? (
          <video
            ref={videoRef}
            src={url}
            controls
            preload="auto"
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
          <div className="w-full h-full flex items-center justify-center text-[var(--color-ash)] text-[14px]">
            Unsupported video format or invalid URL
          </div>
        )}
      </div>
    </div>
  );
}
