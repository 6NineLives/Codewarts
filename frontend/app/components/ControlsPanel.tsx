"use client";

import { useState, useCallback } from "react";

interface ControlsPanelProps {
  isCollecting: boolean;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
  onToggleTTS: () => void;
  onSetSensitivity: (value: number) => void;
}

export default function ControlsPanel({
  isCollecting,
  onStart,
  onStop,
  onClear,
  onToggleTTS,
  onSetSensitivity,
}: ControlsPanelProps) {
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [sensitivity, setSensitivity] = useState(85);

  const handleToggle = useCallback(() => {
    setTtsEnabled((prev) => !prev);
    onToggleTTS();
  }, [onToggleTTS]);

  const handleSensitivity = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      setSensitivity(val);
      onSetSensitivity(val / 100);
    },
    [onSetSensitivity]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Primary Action: Start/Stop (from Stitch lines 327-331) */}
      <button
        id="btn-start-stop"
        onClick={isCollecting ? onStop : onStart}
        className="w-full text-white text-label-md py-3.5 rounded flex items-center justify-center gap-2 transition-all duration-200 shadow-md cursor-pointer active:scale-95 border"
        style={{
          backgroundColor: isCollecting
            ? "var(--color-accent)"
            : "var(--color-accent)",
          borderColor: "var(--color-accent-hover)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--color-accent-hover)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "var(--color-accent)")
        }
      >
        <span
          className="material-symbols-outlined text-xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {isCollecting ? "stop_circle" : "play_circle"}
        </span>
        {isCollecting ? "Stop & Translate" : "Start Collecting"}
      </button>

      {/* TTS Toggle (from Stitch lines 332-343) */}
      <div
        className="border rounded-lg p-3 flex items-center justify-between shadow-sm"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: "var(--color-surface-variant)",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined text-xl"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            volume_up
          </span>
          <span
            className="text-label-md"
            style={{ color: "var(--color-on-surface)" }}
          >
            Read translation aloud
          </span>
        </div>
        <button
          id="btn-tts-toggle"
          onClick={handleToggle}
          className={`toggle-switch ${ttsEnabled ? "active" : ""}`}
          role="switch"
          aria-checked={ttsEnabled}
          aria-label="Toggle text-to-speech"
        />
      </div>

      {/* Sensitivity Slider (from Stitch lines 344-357) */}
      <div
        className="border rounded-lg p-3 flex flex-col gap-3 shadow-sm"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: "var(--color-surface-variant)",
        }}
      >
        <div className="flex justify-between items-center">
          <span
            className="text-label-md"
            style={{ color: "var(--color-on-surface)" }}
          >
            Detection Sensitivity
          </span>
          <span
            className="text-label-md font-bold"
            style={{ color: "var(--color-primary-container)" }}
          >
            {sensitivity}%
          </span>
        </div>
        <input
          id="sensitivity-slider"
          type="range"
          min="0"
          max="100"
          value={sensitivity}
          onChange={handleSensitivity}
          aria-label="Detection sensitivity"
        />
      </div>

      {/* Clear All (from Stitch lines 358-361) */}
      <button
        id="btn-clear"
        onClick={onClear}
        className="w-full border text-body-md py-3 rounded transition-colors duration-200 mt-1 cursor-pointer active:scale-95"
        style={{
          backgroundColor: "transparent",
          borderColor: "var(--color-outline-variant)",
          color: "var(--color-on-surface)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor =
            "var(--color-surface-variant)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
      >
        Clear All
      </button>
    </div>
  );
}
