"use client";

import { useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { CameraFeed } from "@/components/CameraFeed";
import { TranslationCard } from "@/components/TranslationCard";
import { HistoryTimeline } from "@/components/HistoryTimeline";
import { useFSLRecognition } from "@/hooks/useFSLRecognition";

export default function Home() {
  // We need a ref to the video element to pass to the hook
  // But CameraFeed manages its own video element. 
  // Let's refactor CameraFeed to accept a ref or just move the hook call inside it?
  // Actually, let's keep it simple: CameraFeed will expose its video ref.
  
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const { currentSign, confidence, history, isConnected } = useFSLRecognition(videoElement);

  return (
    <main className="flex flex-col h-screen bg-background overflow-hidden">
      <Navbar isConnected={isConnected} />
      
      <div className="flex-1 relative flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
        {/* Left Side: Camera Feed */}
        <div className="flex-1 min-h-[400px] relative">
          <CameraFeed 
            className="w-full h-full" 
            onVideoRef={(el) => setVideoElement(el)} 
          />
        </div>

        {/* Right Side / Overlay: Translation Panel */}
        <div className="md:w-96 flex flex-col gap-6 items-center justify-center md:justify-start">
          <TranslationCard 
            sign={currentSign} 
            confidence={confidence} 
            className="w-full"
          />
          
          <div className="hidden md:block w-full p-6 glass rounded-2xl border border-white/5">
            <h3 className="font-display font-bold text-lg mb-4 text-white/90">Tips</h3>
            <ul className="space-y-3 text-sm text-foreground/60 font-medium">
              <li className="flex gap-2 items-start">
                <span className="text-primary mt-1">●</span>
                Ensure your hands are clearly visible within the frame.
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-primary mt-1">●</span>
                Hold each sign for at least 1 second for better stability.
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-primary mt-1">●</span>
                Stay in a well-lit area for optimal AI detection.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <HistoryTimeline history={history} />
    </main>
  );
}
