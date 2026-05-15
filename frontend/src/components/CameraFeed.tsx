"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CameraFeedProps {
  className?: string;
  onVideoRef?: (el: HTMLVideoElement | null) => void;
}

export function CameraFeed({ className, onVideoRef }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
          onVideoRef?.(videoRef.current);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className={cn("relative w-full h-full bg-black/40 rounded-3xl overflow-hidden group border border-white/5", className)}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {!isCameraActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4 text-center p-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-mono text-sm uppercase tracking-widest text-primary font-bold">
              Initializing Camera...
            </p>
          </div>
        </div>
      )}

      {/* Safe Zone Indicators (Visual Guide) */}
      <div className="absolute inset-10 border border-white/10 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute top-4 left-4 font-mono text-[8px] uppercase tracking-widest text-white/40">
          Safe Zone
        </div>
      </div>
    </div>
  );
}
