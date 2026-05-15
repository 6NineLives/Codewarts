"use client";

const TABS = [
  { icon: "videocam", label: "Translate", active: true },
  { icon: "history", label: "History", active: false },
  { icon: "school", label: "Learn", active: false },
];

export default function BottomNav() {
  return (
    <nav
      id="bottom-nav"
      className="fixed bottom-0 w-full z-50 rounded-t-xl border-t shadow-[0_-4px_16px_rgba(0,0,0,0.05)] md:hidden"
      style={{
        backgroundColor: "var(--color-surface-container)",
        borderColor: "var(--color-outline-variant)",
      }}
    >
      <div className="flex justify-around items-center h-20 w-full px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ icon, label, active }) => (
          <button
            key={label}
            className={`flex flex-col items-center justify-center px-5 py-1.5 transition-all duration-150 cursor-pointer active:scale-95 ${
              active ? "rounded-full text-white" : ""
            }`}
            style={
              active
                ? { backgroundColor: "var(--color-primary-container)" }
                : { color: "var(--color-on-surface-variant)" }
            }
          >
            <span
              className="material-symbols-outlined"
              style={
                active
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              {icon}
            </span>
            <span className="text-label-md mt-1">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
