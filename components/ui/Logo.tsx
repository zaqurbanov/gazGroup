import Image from "next/image";
import { mediaUrl } from "@/lib/seo";

/** Text mark used until a real logo is uploaded in the admin panel. */
function Mark() {
  return (
    <svg viewBox="0 0 40 40" width="38" height="38" aria-hidden="true" className="shrink-0">
      <rect x="1" y="1" width="38" height="38" rx="11" fill="none" stroke="currentColor" strokeWidth="2" opacity=".35" />
      <circle cx="14" cy="22" r="6" fill="currentColor" />
      <circle cx="27" cy="13" r="4" fill="var(--emerald)" />
      <circle cx="27" cy="28" r="4" fill="var(--emerald)" />
      <path d="M14 22 L27 13 M14 22 L27 28" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function Logo({ name, logo }: { name: string; logo?: string }) {
  if (logo) {
    return <Image src={mediaUrl(logo)} alt={name} width={160} height={44} className="h-10 w-auto" priority />;
  }
  const [first, ...rest] = name.split(" ");
  return (
    <span className="flex items-center gap-3">
      <Mark />
      <span className="font-display text-[0.95rem] font-semibold leading-none tracking-tight">
        {first}
        <span className="block pt-1 text-[0.62rem] font-medium uppercase tracking-[0.22em] opacity-70">
          {rest.join(" ")}
        </span>
      </span>
    </span>
  );
}
