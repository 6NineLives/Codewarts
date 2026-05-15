"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface HistoryTimelineProps {
  history: string[];
}

export function HistoryTimeline({ history }: HistoryTimelineProps) {
  return (
    <div className="h-24 w-full glass border-t border-white/10 px-6 flex items-center overflow-hidden">
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
        {history.length === 0 ? (
          <span className="text-foreground/30 font-mono text-xs uppercase tracking-widest">
            History will appear here...
          </span>
        ) : (
          history.map((sign, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 shrink-0"
            >
              <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <span className="font-sans font-semibold text-foreground/80">
                  {sign}
                </span>
              </div>
              {i < history.length - 1 && (
                <ChevronRight className="w-4 h-4 text-white/20" />
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
