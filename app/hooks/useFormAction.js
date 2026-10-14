// app/hooks/useFormAction.js
"use client";

import { useState } from "react";

export function useFormAction(action, onSuccess) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await action(null, new FormData(e.currentTarget));
      if (res?.error) {
        setError(res.error);
        return;
      }
      onSuccess?.(res);
    } catch (err) {
      setError(err?.message || "Terjadi kesalahan.");
    } finally {
      setPending(false);
    }
  }

  return { handleSubmit, pending, error };
}