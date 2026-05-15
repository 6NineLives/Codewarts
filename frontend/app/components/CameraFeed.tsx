"use client";

import { useRef, useEffect } from "react";

interface CameraFeedProps {
  frame: string | null;
  fps: number;
  isCollecting: boolean;
  connected: boolean;
}

export default function CameraFeed({
  frame,
  fps,
  isCollecting,
  connected,
}: CameraFeedProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (frame && imgRef.current) {
      imgRef.current.src = `data:image/jpeg;base64,${frame}`;
    }
  }, [frame]);

  return (
    <div
      id="camera-feed"
      className="w-full h-full relative rounded-lg border overflow-hidden flex flex-col shadow-sm"
      style={{
        backgroundColor: "var(--color-surface-container-highest)",
        borderColor: "var(--color-surface-variant)",
      }}
    >
      {/* Video / Frame Display */}
      <div
        className="w-full h-full relative flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: "var(--color-surface-container-low)" }}
      >
        {frame ? (
          <img
            ref={imgRef}
            alt="Camera feed with FSL skeleton overlay"
            className="w-full h-full object-contain"
            style={{ imageRendering: "auto" }}
          />
        ) : (
          /* Placeholder when no frames are arriving */
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center animate-skeleton-pulse"
              style={{ backgroundColor: "var(--color-surface-variant)" }}
            >
              <span
                className="material-symbols-outlined text-5xl"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                videocam
              </span>
            </div>
            <p
              className="text-body-md"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              {connected
                ? "Initializing camera..."
                : "Waiting for server connection..."}
            </p>
          </div>
        )}

        {/* Overlay UI — bottom status bar (from Stitch lines 280-291) */}
        {frame && (
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-20">
            {/* Tracking Status */}
            <div
              className="backdrop-blur-sm border rounded py-2 px-3 flex items-center gap-3"
              style={{
                backgroundColor: "rgba(255,255,255,0.8)",
                borderColor: "var(--color-surface-variant)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {isCollecting ? (
                <>
                  <span className="relative flex h-3 w-3">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{
                        backgroundColor: "var(--color-primary-container)",
                      }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-3 w-3"
                      style={{
                        backgroundColor: "var(--color-primary-container)",
                      }}
                    />
                  </span>
                  <span className="text-label-sm uppercase tracking-wider font-semibold"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    Tracking Active
                  </span>
                </>
              ) : (
                <>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "var(--color-success)" }}
                  />
                  <span className="text-label-sm uppercase tracking-wider"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    Camera Ready
                  </span>
                </>
              )}
            </div>

            {/* FPS Counter */}
            <div
              className="backdrop-blur-sm border rounded py-2 px-3"
              style={{
                backgroundColor: "rgba(255,255,255,0.8)",
                borderColor: "var(--color-surface-variant)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <span
                className="text-label-sm"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                FPS:{" "}
                <span
                  className="font-bold"
                  style={{ color: "var(--color-primary-container)" }}
                >
                  {fps}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
