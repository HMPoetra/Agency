"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const SPEED = 42;
const WORD_PAUSE = 170;

function splitAccent(text) {
  return text
    .split("*")
    .map((chunk, i) => ({ chunk, accent: i % 2 === 1 }))
    .filter((part) => part.chunk);
}

export default function TypeTitle({
  as: Tag = "h2",
  text,
  accentClass = "text-pine-400",
  className = "",
  startDelay = 0,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduced = useReducedMotion();
  const parts = useMemo(() => splitAccent(text), [text]);
  // plain[i] indexes characters; parts[] indexes segments. Only plain may be
  // indexed by the running character counter.
  const plain = useMemo(() => text.replaceAll("*", ""), [text]);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (reduced || !inView) return;
    let i = 0;
    let pause = 0;
    const step = () => {
      i += 1;
      setTyped(i);
      if (i >= plain.length) return;
      pause = setTimeout(
        step,
        plain[i] === " " ? SPEED + WORD_PAUSE : SPEED,
      );
    };
    const start = setTimeout(step, startDelay);
    return () => {
      clearTimeout(start);
      clearTimeout(pause);
    };
  }, [inView, reduced, plain, startDelay]);

  const done = typed >= plain.length;
  const rendered = parts.reduce(
    (acc, part) => {
      const start = acc.offset;
      acc.offset += part.chunk.length;
      acc.chunks.push({
        accent: part.accent,
        text: done
          ? part.chunk
          : part.chunk.slice(0, Math.max(0, typed - start)),
      });
      return acc;
    },
    { offset: 0, chunks: [] },
  );

  return (
    <Tag ref={ref} className={className} aria-label={text.replaceAll("*", "")}>
      {rendered.chunks.map((chunk, i) =>
        chunk.accent ? (
          <span key={i} className={accentClass}>
            {chunk.text}
          </span>
        ) : (
          <span key={i}>{chunk.text}</span>
        ),
      )}
      {!done && (
        <span
          aria-hidden="true"
          className={`type-caret ${accentClass}`}
        />
      )}
    </Tag>
  );
}
