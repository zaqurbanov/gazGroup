export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  as: Tag = "h2",
  className = "",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={`reveal max-w-3xl space-y-4 ${className}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Tag className="h-section">{title}</Tag>
      {subtitle && <p className="text-lg leading-relaxed opacity-80">{subtitle}</p>}
    </div>
  );
}
