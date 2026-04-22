import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const WorldUIContext = createContext(null);

export function WorldUIProvider({ children }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [savedEventIds, setSavedEventIds] = useState(() => new Set(["ev-2"]));
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((message, variant = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleBookmark = useCallback((eventId) => {
    setSavedEventIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
        pushToast("Removed from saved stalls", "default");
      } else {
        next.add(eventId);
        pushToast("Saved to your pouch", "success");
      }
      return next;
    });
  }, [pushToast]);

  const value = useMemo(
    () => ({
      searchOpen,
      setSearchOpen,
      assistantOpen,
      setAssistantOpen,
      savedEventIds,
      toggleBookmark,
      toasts,
      dismissToast,
      pushToast,
    }),
    [
      searchOpen,
      assistantOpen,
      savedEventIds,
      toggleBookmark,
      toasts,
      dismissToast,
      pushToast,
    ]
  );

  return <WorldUIContext.Provider value={value}>{children}</WorldUIContext.Provider>;
}

export function useWorldUI() {
  const ctx = useContext(WorldUIContext);
  if (!ctx) {
    throw new Error("useWorldUI must be used within WorldUIProvider");
  }
  return ctx;
}
