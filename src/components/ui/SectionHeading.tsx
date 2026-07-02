import Reveal from "./Reveal";

export default function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <Reveal className="mb-12 text-center">
      <h2 className="font-mono text-3xl font-bold sm:text-4xl">
        <span className="text-accent">#</span> {title}
      </h2>
      {subtitle && <p className="mt-3 text-muted">{subtitle}</p>}
      <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-accent via-accent-2 to-accent-3" />
    </Reveal>
  );
}
