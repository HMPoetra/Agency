"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

export default function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.5,
  className = "",
}) {
  const target = Number(value) || 0;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  const count = useMotionValue(reduced ? target : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(count, target, { duration, ease: EASE });
    return () => controls.stop();
  }, [inView, reduced, count, target, duration]);

  const text = useTransform(count, (v) => {
    const n = decimals
      ? v.toFixed(decimals)
      : Math.round(v).toLocaleString("id-ID");
    return `${prefix}${n}${suffix}`;
  });

  return (
    <motion.span ref={ref} className={className} aria-label={`${prefix}${target}${suffix}`}>
      {text}
    </motion.span>
  );
}
