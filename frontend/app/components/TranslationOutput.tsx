"use client";

import { useState, useEffect, useRef } from "react";

interface TranslationOutputProps {
  translation: string;
}

export default function TranslationOutput({ translation }: TranslationOutputProps) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const prevTranslation = useRef("");

  // Typewriter animation
  useEffect(() => {
    if (translation && translation !== prevTranslation.current) {
      prevTranslation.current = translation;
      setIsTyping(true);
      setDisplayText("");

      let i = 0;
      const timer = setInterval(() => {
        if (i < translation.length) {
          setDisplayText(translation.slice(0, i + 1));
          i++;
        } else {
          clearInterval(timer);
          setIsTyping(false);
        }
      }, 40);

      return () => clearInterval(timer);
    }
  }, [translation]);

  return (
    <div
      id="translation-output"
      className="border rounded-lg p-6 shadow-sm flex-1 min-h-[150px] flex flex-col animate-slide-up"
      style={{
        backgroundColor: "var(--color-card)",
        borderColor: "var(--color-surface-variant)",
        animationDelay: "0.1s",
      }}
    >
      <h3
        className="text-label-sm uppercase tracking-wider mb-3"
        style={{ color: "var(--color-on-surface-variant)" }}
      >
        Current Translation
      </h3>

      <div className="flex-1 flex items-center justify-center">
        {displayText ? (
          <p
            className={`text-headline-lg text-center transition-all duration-300 ${
              isTyping ? "typewriter-cursor" : ""
            }`}
            style={{ color: "var(--color-on-surface)" }}
          >
            {displayText}
          </p>
        ) : (
          <p
            className="text-body-lg text-center italic"
            style={{
              color: "var(--color-on-surface-variant)",
              opacity: 0.5,
            }}
          >
            Translation will appear here
          </p>
        )}
      </div>
    </div>
  );
}
