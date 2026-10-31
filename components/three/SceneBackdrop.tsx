import { SceneLoader } from "./SceneLoader";

/**
 * Fixed backdrop behind the home page. The gradient and static molecule render on the server,
 * so the page looks complete before (or without) WebGL. The canvas fades in on top.
 */
export function SceneBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-ink [&:has(canvas)>svg]:opacity-0"
      style={{
        backgroundImage:
          "radial-gradient(60rem 40rem at 78% 30%, color-mix(in oklab, var(--emerald) 22%, transparent), transparent 70%), radial-gradient(50rem 40rem at 10% 90%, color-mix(in oklab, var(--deep) 90%, white 6%), transparent 70%)",
      }}
    >
      <svg
        viewBox="0 0 400 300"
        className="absolute right-[-6%] top-[18%] w-[min(46rem,70vw)] opacity-40 transition-opacity duration-700"
        fill="none"
      >
        <line x1="150" y1="150" x2="250" y2="150" stroke="#fff" strokeWidth="5" opacity=".6" />
        <line x1="150" y1="138" x2="250" y2="138" stroke="#fff" strokeWidth="5" opacity=".6" />
        <circle cx="140" cy="150" r="52" fill="#10b981" />
        <circle cx="260" cy="150" r="52" fill="#10b981" />
      </svg>
      <div className="absolute inset-0 [&>canvas]:animate-[fade-in_1.2s_ease_both]">
        <SceneLoader />
      </div>
    </div>
  );
}
