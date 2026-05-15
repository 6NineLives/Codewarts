"use client";

import TopNav from "./components/TopNav";
import Sidebar from "./components/Sidebar";
import BottomNav from "./components/BottomNav";
import CameraFeed from "./components/CameraFeed";
import StatusBadge from "./components/StatusBadge";
import DetectedSigns from "./components/DetectedSigns";
import TranslationOutput from "./components/TranslationOutput";
import ControlsPanel from "./components/ControlsPanel";
import { useFSLWebSocket } from "./hooks/useFSLWebSocket";

const SUPPORTED_SIGNS = [
  "Hello",
  "Thank You",
  "Goodbye",
  "Help",
  "Please",
  "Sorry",
  "Yes",
  "No",
  "I Love You",
  "How Are You",
];

export default function Home() {
  const {
    frame,
    fps,
    isCollecting,
    detectedSigns,
    translation,
    newSign,
    connected,
    startCollecting,
    stopCollecting,
    clearAll,
    toggleTTS,
    setSensitivity,
  } = useFSLWebSocket();

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* Navigation */}
      <TopNav connected={connected} />
      <Sidebar />
      <BottomNav />

      {/* Main Content — matches Stitch layout (lines 237-363) */}
      <main
        className="pt-16 md:pl-64 flex-1 flex flex-col h-full overflow-hidden pb-20 md:pb-0"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        {/* Header Section (from Stitch lines 238-246) */}
        <header
          className="flex-none py-4 md:py-6 px-4 md:px-6 text-center border-b"
          style={{
            borderColor: "var(--color-surface-variant)",
            backgroundColor: "var(--color-surface-container-lowest)",
          }}
        >
          <h1
            className="text-headline-lg-mobile md:text-headline-lg mb-2"
            style={{ color: "var(--color-on-surface)" }}
          >
            Filipino Sign Language Translator
          </h1>
          <div className="overflow-x-auto whitespace-nowrap pb-1 scrollbar-hide">
            <p
              className="text-label-md inline-block"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Supported:{" "}
              {SUPPORTED_SIGNS.map((sign, i) => (
                <span key={sign}>
                  {sign}
                  {i < SUPPORTED_SIGNS.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          </div>
        </header>

        {/* Two-column grid (from Stitch lines 248-363) */}
        <div className="flex-1 p-4 md:p-6 flex flex-col lg:flex-row gap-6 overflow-hidden h-full">
          {/* Left Column (65%): Camera Feed */}
          <div className="lg:w-[65%] h-64 md:h-full">
            <CameraFeed
              frame={frame}
              fps={fps}
              isCollecting={isCollecting}
              connected={connected}
            />
          </div>

          {/* Right Column (35%): Control Panel Stack */}
          <div className="lg:w-[35%] flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar pb-4">
            <StatusBadge isCollecting={isCollecting} connected={connected} />
            <DetectedSigns signs={detectedSigns} newSign={newSign} />
            <TranslationOutput translation={translation} />
            <ControlsPanel
              isCollecting={isCollecting}
              onStart={startCollecting}
              onStop={stopCollecting}
              onClear={clearAll}
              onToggleTTS={toggleTTS}
              onSetSensitivity={setSensitivity}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
