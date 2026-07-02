import Reveal from "./Reveal";

export default function SectionHeading({
  kicker,
  title,
  subtitle,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Reveal className="mb-14">
      {kicker && (
        <p className="mb-3 font-mono text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          {kicker}
        </p>
      )}
      <h2 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 max-w-2xl text-lg text-muted">{subtitle}</p>}
    </Reveal>
  );
}
