"use client";

import { Settings, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  isConnected: boolean;
}

export function Navbar({ isConnected }: NavbarProps) {
  return (
    <nav className="h-16 border-b border-white/10 glass px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-background">
          🤟
        </div>
        <h1 className="font-display font-bold text-xl tracking-tight">
          FSL <span className="text-primary">Translator</span>
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            isConnected ? "bg-primary" : "bg-red-500"
          )} />
          <span className="font-mono text-xs font-medium uppercase tracking-widest text-foreground/70">
            {isConnected ? "Model Connected" : "Model Disconnected"}
          </span>
          {isConnected ? (
            <Wifi className="w-4 h-4 text-primary/50" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500/50" />
          )}
        </div>

        <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-foreground/70 hover:text-foreground">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
