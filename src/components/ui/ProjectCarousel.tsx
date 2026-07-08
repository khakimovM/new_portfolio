"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";

const AUTOPLAY_MS = 4000;

/** Loyiha kartasidagi rasm karuseli — avto aylanadi, tugmalar bilan boshqariladi */
export default function ProjectCarousel({ images, title }: { images: string[]; title: string }) {
  const t = useTranslations("projects");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // Surish tugagach karta linki bosilib ketmasligi uchun
  const dragging = useRef(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  useEffect(() => {
    if (images.length < 2 || paused) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [images.length, paused, next]);

  // Karta butunlay <a> ichida — tugma bosilganda linkka o'tib ketmasligi kerak
  const stop = (e: React.MouseEvent, fn: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
  };

  return (
    <motion.div
      className={`relative h-full w-full ${images.length > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      drag={images.length > 1 ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.12}
      onDragStart={() => {
        dragging.current = true;
      }}
      onDragEnd={(_, info) => {
        if (info.offset.x < -40 || info.velocity.x < -300) next();
        else if (info.offset.x > 40 || info.velocity.x > 300) prev();
        // click hodisasi drag'dan keyin keladi — biroz kutib bayroqni tushiramiz
        setTimeout(() => {
          dragging.current = false;
        }, 100);
      }}
      onClickCapture={(e) => {
        if (dragging.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={images[index]}
            alt={`${title} — ${index + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label={t("prevImage")}
            onClick={(e) => stop(e, prev)}
            className="absolute top-1/2 left-2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground opacity-0 backdrop-blur-sm transition group-hover:opacity-100 focus-visible:opacity-100 hover:bg-accent hover:text-white"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label={t("nextImage")}
            onClick={(e) => stop(e, next)}
            className="absolute top-1/2 right-2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground opacity-0 backdrop-blur-sm transition group-hover:opacity-100 focus-visible:opacity-100 hover:bg-accent hover:text-white"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`${i + 1}`}
                onClick={(e) => stop(e, () => setIndex(i))}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-4 bg-accent" : "w-1.5 bg-background/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
