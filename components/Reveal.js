"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

export function Reveal({
  as = "div",
  className = "",
  children,
  amount = 0.15,
  ...rest
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag
      className={className}
      variants={container}
      initial={reduced ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({ as = "div", className = "", children, ...rest }) {
  const reduced = useReducedMotion();
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag
      className={className}
      variants={item}
      initial={reduced ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
