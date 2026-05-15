"use client";

const NAV_ITEMS = [
  { icon: "videocam", label: "Live Translate", active: true },
  { icon: "bookmark", label: "Saved Phrases", active: false },
  { icon: "menu_book", label: "Glossary", active: false },
  { icon: "bar_chart", label: "Analytics", active: false },
  { icon: "help", label: "Help", active: false },
];

export default function Sidebar() {
  return (
    <aside
      id="sidebar-nav"
      className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 flex-col py-6 border-r shadow-sm hidden md:flex z-40"
      style={{
        backgroundColor: "var(--color-surface-container-low)",
        borderColor: "var(--color-surface-variant)",
      }}
    >
      {/* Brand */}
      <div className="px-6 mb-8">
        <h2
          className="text-title-lg font-black mb-1"
          style={{ color: "var(--color-primary-container)" }}
        >
          FSL Translator
        </h2>
        <p className="text-label-sm" style={{ color: "var(--color-on-surface-variant)" }}>
          AI-Powered Translation
        </p>
      </div>

      {/* New Session Button */}
      <div className="px-6 mb-8">
        <button
          id="new-session-btn"
          className="w-full text-white text-label-md py-2.5 rounded flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-95 shadow-sm"
          style={{ backgroundColor: "var(--color-primary-container)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--color-primary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor =
              "var(--color-primary-container)")
          }
        >
          <span className="material-symbols-outlined text-lg">add</span>
          New Session
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-1 px-6">
        {NAV_ITEMS.map(({ icon, label, active }) => (
          <a
            key={label}
            href="#"
            className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-200 cursor-pointer active:scale-95 ${
              active ? "font-bold border-r-4" : ""
            }`}
            style={
              active
                ? {
                    color: "var(--color-primary-container)",
                    borderColor: "var(--color-primary-container)",
                    backgroundColor: "var(--color-surface-container-highest)",
                  }
                : {
                    color: "var(--color-on-surface-variant)",
                  }
            }
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor =
                  "var(--color-surface-variant)";
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            <span className="material-symbols-outlined text-xl">{icon}</span>
            <span className="text-label-md">{label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
