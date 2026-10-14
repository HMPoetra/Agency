// app/hooks/useMounted.js
"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}