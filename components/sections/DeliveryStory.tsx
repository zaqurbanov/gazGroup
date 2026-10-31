import type { Dictionary } from "@/lib/dictionaries";

/**
 * Scroll story: filling, loading, delivery. The copy is always in the HTML. When the 3D scene is
 * running, CSS turns this into a tall section with a sticky stage and highlights the active step
 * (the scene sets `data-step`). Without 3D it is an ordinary section.
 */
export function DeliveryStory({ dict }: { dict: Dictionary }) {
  return (
    <section data-scene="delivery" aria-labelledby="delivery-title" className="story section-dark relative z-[1]">
      <div className="story-stage container-x">
        <div className="max-w-xl space-y-4 sm:pt-6">
          <p className="eyebrow">{dict.story.eyebrow}</p>
          <h2 id="delivery-title" className="h-section">
            {dict.story.title}
          </h2>
        </div>
        <ol className="story-steps">
          {dict.story.steps.map((step, i) => (
            <li key={step.title} className="story-step" data-i={i + 1}>
              <span className="font-display text-sm font-semibold text-emerald">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-1 font-display text-base font-semibold sm:text-lg">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/80">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
