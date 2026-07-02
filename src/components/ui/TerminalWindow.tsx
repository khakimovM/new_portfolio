"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type TerminalLine =
  | { type: "cmd"; text: string }
  | { type: "out"; text: string; color?: string };

const TYPE_SPEED = 45; // ms / belgi (komandalar yoziladi)
const OUT_DELAY = 350; // natija chiqishidan oldingi pauza

/**
 * Terminal oynasi: komandalar belgima-belgi "yoziladi",
 * natijalar esa birdaniga chiqadi — haqiqiy terminal kabi.
 */
export default function TerminalWindow({ lines }: { lines: TerminalLine[] }) {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const done = lineIdx >= lines.length;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (done) return;
    const line = lines[lineIdx];

    if (line.type === "cmd" && charIdx < line.text.length) {
      timer.current = setTimeout(() => setCharIdx((c) => c + 1), TYPE_SPEED);
    } else {
      timer.current = setTimeout(
        () => {
          setLineIdx((i) => i + 1);
          setCharIdx(0);
        },
        line.type === "cmd" ? OUT_DELAY : 180
      );
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [lines, lineIdx, charIdx, done]);

  const visible = useMemo(() => {
    const rows: { line: TerminalLine; partial?: number }[] = [];
    for (let i = 0; i < Math.min(lineIdx + 1, lines.length); i++) {
      rows.push({ line: lines[i], partial: i === lineIdx ? charIdx : undefined });
    }
    return rows;
  }, [lines, lineIdx, charIdx]);

  return (
    <div className="overflow-hidden rounded-xl border border-border-dim bg-surface shadow-2xl">
      {/* sarlavha paneli */}
      <div className="flex items-center gap-2 border-b border-border-dim bg-surface-2 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <span className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-3 font-mono text-xs text-muted">aziz@codewithaziz: ~</span>
      </div>

      <div className="min-h-[220px] p-5 font-mono text-sm leading-7">
        {visible.map(({ line, partial }, i) => {
          const text =
            partial !== undefined && line.type === "cmd"
              ? line.text.slice(0, partial)
              : line.text;
          const isTyping = partial !== undefined && line.type === "cmd";
          return (
            <div key={i} className="whitespace-pre-wrap break-words">
              {line.type === "cmd" ? (
                <>
                  <span className="text-accent">$ </span>
                  <span className="text-foreground">{text}</span>
                  {isTyping && <span className="cursor-blink text-accent">▊</span>}
                </>
              ) : (
                <span style={{ color: line.color ?? "var(--muted)" }}>{text}</span>
              )}
            </div>
          );
        })}
        {done && (
          <div>
            <span className="text-accent">$ </span>
            <span className="cursor-blink text-accent">▊</span>
          </div>
        )}
      </div>
    </div>
  );
}
