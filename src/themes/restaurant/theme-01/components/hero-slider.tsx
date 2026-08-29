import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Slide } from "../types";

/** Autoplaying hero slider; every field (image, copy, button, target) is DB-driven. */
export function HeroSlider({
  slides,
  fallbackTitle,
  prevLabel,
  nextLabel,
}: {
  slides: Slide[];
  fallbackTitle: string;
  prevLabel: string;
  nextLabel: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % slides.length),
      6000,
    );
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const current = slides[index % Math.max(slides.length, 1)];
  if (!current) return null;

  const target = current.button_target === "_blank" ? "_blank" : "_self";

  return (
    <section className="relative" id="home">
      <div className="relative h-[70vh] min-h-[420px] w-full overflow-hidden">
        {current.image_url ? (
          <img
            src={current.image_url}
            alt={current.title ?? fallbackTitle}
            className="h-full w-full object-cover"
            width={1920}
            height={1080}
          />
        ) : (
          <div className="h-full w-full bg-surface" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />

        <div className="container-page absolute inset-x-0 bottom-14">
          <div className="max-w-2xl">
            {current.eyebrow ? <span className="eyebrow">{current.eyebrow}</span> : null}
            {current.title ? (
              <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
                {current.title}
              </h1>
            ) : null}
            {current.description ? (
              <p className="mt-4 text-base text-muted-foreground">{current.description}</p>
            ) : null}
            {current.button_label && current.button_href ? (
              <Button size="lg" className="mt-6" asChild>
                <a
                  href={current.button_href}
                  target={target}
                  rel={target === "_blank" ? "noreferrer noopener" : undefined}
                >
                  {current.button_label}
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        {slides.length > 1 ? (
          <>
            <div className="absolute bottom-5 right-5 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                aria-label={prevLabel}
                onClick={() => setIndex((index - 1 + slides.length) % slides.length)}
              >
                <ChevronLeft className="size-4" aria-hidden />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                aria-label={nextLabel}
                onClick={() => setIndex((index + 1) % slides.length)}
              >
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
            <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 gap-1.5">
              {slides.map((slide, dot) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`${dot + 1}`}
                  onClick={() => setIndex(dot)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    dot === index ? "w-6 bg-primary" : "w-3 bg-muted-foreground/50",
                  )}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
