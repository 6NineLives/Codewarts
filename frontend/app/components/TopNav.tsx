"use client";

import Link from "next/link";

interface TopNavProps {
  connected: boolean;
}

export default function TopNav({ connected }: TopNavProps) {
  return (
    <nav
      id="top-nav"
      className="flex justify-between items-center px-6 h-16 w-full fixed top-0 z-50 border-b"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-surface-variant)",
      }}
    >
      {/* Logo / Title */}
      <div className="flex items-center gap-6">
        <span
          className="text-headline-md font-bold"
          style={{ color: "var(--color-on-surface)" }}
        >
          Filipino Sign Language Translator
        </span>
      </div>

      {/* Desktop Nav Links */}
      <div className="hidden md:flex gap-6 items-center h-full">
        <Link
          href="#"
          className="font-bold border-b-2 pb-2 flex items-center h-full transition-colors duration-200"
          style={{
            color: "var(--color-primary-container)",
            borderColor: "var(--color-primary-container)",
          }}
        >
          Dashboard
        </Link>
        {["History", "Dictionary", "Settings"].map((item) => (
          <Link
            key={item}
            href="#"
            className="text-label-md flex items-center h-full transition-colors duration-200 cursor-pointer hover:opacity-80"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Connection indicator + Profile */}
      <div className="flex items-center gap-3">
        {/* Connection status dot */}
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full transition-colors duration-300"
            style={{
              backgroundColor: connected
                ? "var(--color-success)"
                : "var(--color-error)",
            }}
          />
          <span
            className="text-label-sm hidden sm:inline"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            {connected ? "Connected" : "Offline"}
          </span>
        </div>

        <button
          className="transition-colors duration-200 cursor-pointer hover:opacity-80"
          style={{ color: "var(--color-on-surface)" }}
        >
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </nav>
  );
}
