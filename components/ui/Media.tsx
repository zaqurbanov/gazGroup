import Image from "next/image";
import { mediaUrl } from "@/lib/seo";

/** Image stored in GridFS. Renders a neutral gradient block when none was uploaded. */
export function Media({
  id,
  alt,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  className = "",
  priority = false,
}: {
  id?: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  if (!id) {
    return (
      <div
        aria-hidden="true"
        className={`bg-gradient-to-br from-deep to-ink ${className}`}
        style={{ backgroundImage: "radial-gradient(circle at 70% 30%, color-mix(in oklab, var(--emerald) 40%, transparent), transparent 60%)" }}
      />
    );
  }
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image src={mediaUrl(id)} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
