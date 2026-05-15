"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TranslationCardProps {
  sign: string;
  confidence: number;
  className?: string;
}

export function TranslationCard({ sign, confidence, className }: TranslationCardProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={sign}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="glass rounded-2xl p-8 glow-primary min-w-[280px] text-center"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70 mb-2 font-bold">
            Detected Sign
          </div>
          <div className="font-sans font-bold text-6xl tracking-tighter text-white drop-shadow-sm">
            {sign || "..."}
          </div>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="font-mono text-xs font-bold text-primary">
              {(confidence * 100).toFixed(1)}% Confidence
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
