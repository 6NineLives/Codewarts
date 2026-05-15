"use client";

interface StatusBadgeProps {
  isCollecting: boolean;
  connected: boolean;
}

export default function StatusBadge({ isCollecting, connected }: StatusBadgeProps) {
  const isActive = connected && isCollecting;

  return (
    <div className="flex flex-col gap-1">
      <span
        className="text-label-sm uppercase tracking-wider"
        style={{ color: "var(--color-on-surface-variant)" }}
      >
        Status
      </span>
      <div className="flex items-center">
        <div
          className="h-6 px-3 rounded-full flex items-center gap-2"
          style={{
            background: isActive
              ? "linear-gradient(90deg, rgba(16,185,129,0.1) 0%, rgba(4,120,87,0.2) 100%)"
              : connected
              ? "linear-gradient(90deg, rgba(59,130,246,0.1) 0%, rgba(37,99,235,0.2) 100%)"
              : "linear-gradient(90deg, rgba(186,26,26,0.1) 0%, rgba(153,27,27,0.2) 100%)",
            border: isActive
              ? "1px solid rgba(16,185,129,0.2)"
              : connected
              ? "1px solid rgba(59,130,246,0.2)"
              : "1px solid rgba(186,26,26,0.2)",
          }}
        >
          <div
            className={`w-2 h-2 rounded-full ${isActive ? "animate-pulse" : ""}`}
            style={{
              backgroundColor: isActive
                ? "#10b981"
                : connected
                ? "#3b82f6"
                : "#ba1a1a",
            }}
          />
          <span
            className="text-label-sm uppercase tracking-wider"
            style={{
              color: isActive
                ? "#047857"
                : connected
                ? "#1d4ed8"
                : "#991b1b",
            }}
          >
            {isActive ? "Active" : connected ? "Ready" : "Offline"}
          </span>
        </div>
      </div>
    </div>
  );
}
