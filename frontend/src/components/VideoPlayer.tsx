"use client";

import ReactPlayer from "react-player";
import { RefObject } from "react";

interface VideoPlayerProps {
  url: string;
  playerRef: RefObject<ReactPlayer | null>;
}

export default function VideoPlayer({ url, playerRef }: VideoPlayerProps) {
  if (!url) return null;

  return (
    <div className="bg-black rounded-lg overflow-hidden shadow-lg aspect-video w-full relative">
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        controls
        playing={false}
        config={{
          youtube: {
            playerVars: { showinfo: 1 }
          }
        }}
      />
    </div>
  );
}
