"use client";

import { useRef, useEffect } from "react";

interface DetectedSignsProps {
  signs: string[];
  newSign: string | null;
}

export default function DetectedSigns({ signs, newSign }: DetectedSignsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new signs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [signs]);

  return (
    <div
      id="detected-signs"
      className="border rounded-lg p-3 shadow-sm flex flex-col gap-2 animate-slide-up"
      style={{
        backgroundColor: "var(--color-card)",
        borderColor: "var(--color-surface-variant)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span
          className="material-symbols-outlined text-lg"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          sign_language
        </span>
        <h3
          className="text-label-md"
          style={{ color: "var(--color-on-surface)" }}
        >
          Detected Signs
        </h3>
      </div>

      {/* Sign sequence display (from Stitch lines 312-316) */}
      <div
        ref={scrollRef}
        className="rounded p-3 border overflow-x-auto scrollbar-hide"
        style={{
          backgroundColor: "var(--color-surface-container-lowest)",
          borderColor: "var(--color-surface-variant)",
        }}
      >
        {signs.length > 0 ? (
          <div className="flex items-center gap-1 font-mono text-sm whitespace-nowrap">
            {signs.map((sign, i) => (
              <span key={`${sign}-${i}`} className="flex items-center gap-1">
                <span
                  className={`inline-block ${
                    sign === newSign && i === signs.length - 1
                      ? "animate-slide-in font-bold"
                      : ""
                  }`}
                  style={{
                    color:
                      sign === newSign && i === signs.length - 1
                        ? "var(--color-primary-container)"
                        : "var(--color-on-surface-variant)",
                  }}
                >
                  {sign.replace(/_/g, " ")}
                </span>
                {i < signs.length - 1 && (
                  <span
                    className="mx-1 opacity-50"
                    style={{ color: "var(--color-primary-container)" }}
                  >
                    →
                  </span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <p
            className="text-sm italic"
            style={{ color: "var(--color-on-surface-variant)", opacity: 0.6 }}
          >
            No signs detected yet. Start collecting to begin.
          </p>
        )}
      </div>
    </div>
  );
}
