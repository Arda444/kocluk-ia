"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { saveElapsedAction } from "@/app/actions";

export type TimerTask = {
  id: string;
  title: string;
  subject: string;
  targetMinutes: number;
  elapsedSeconds: number;
};

type StoredTimer = {
  task: TimerTask;
  running: boolean;
  startedAt: number | null;
  accumulated: number;
  fullscreen: boolean;
};

const STORAGE_KEY = "allstar-timer-v1";

function readStore(): StoredTimer | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredTimer;
    if (!parsed?.task?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStore(value: StoredTimer | null) {
  if (typeof window === "undefined") return;
  if (!value) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function liveSeconds(store: StoredTimer | null, now = Date.now()) {
  if (!store) return 0;
  if (!store.running || !store.startedAt) return Math.max(0, store.accumulated);
  return Math.max(0, store.accumulated + Math.floor((now - store.startedAt) / 1000));
}

type TimerContextValue = {
  task: TimerTask | null;
  running: boolean;
  fullscreen: boolean;
  elapsed: number;
  start: (task: TimerTask, options?: { fullscreen?: boolean }) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  setFullscreen: (value: boolean) => void;
};

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<StoredTimer | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const storeRef = useRef<StoredTimer | null>(null);
  storeRef.current = store;

  const persist = useCallback((next: StoredTimer | null) => {
    storeRef.current = next;
    setStore(next);
    setNow(Date.now());
    writeStore(next);
  }, []);

  const save = useCallback(async (next: StoredTimer | null) => {
    if (!next) return;
    await saveElapsedAction(next.task.id, liveSeconds(next), false);
  }, []);

  useEffect(() => {
    const restored = readStore();
    if (restored) setStore(restored);
  }, []);

  useEffect(() => {
    if (!store?.running) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [store?.running]);

  useEffect(() => {
    if (!store?.running) return;
    const id = window.setInterval(() => {
      const current = storeRef.current;
      if (current) void save(current);
    }, 15000);
    return () => window.clearInterval(id);
  }, [store?.running, save]);

  useEffect(() => {
    function flush() {
      const current = storeRef.current;
      if (current) {
        const seconds = liveSeconds(current);
        writeStore({ ...current, accumulated: seconds, startedAt: current.running ? Date.now() : null });
        void saveElapsedAction(current.task.id, seconds);
      }
    }
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, []);

  const elapsed = liveSeconds(store, now);

  const start = useCallback(
    (task: TimerTask, options?: { fullscreen?: boolean }) => {
      const current = storeRef.current;
      if (current && current.task.id !== task.id) {
        const seconds = liveSeconds(current);
        void saveElapsedAction(current.task.id, seconds, true);
      }
      persist({
        task: { ...task, elapsedSeconds: task.elapsedSeconds },
        running: true,
        startedAt: Date.now(),
        accumulated: current?.task.id === task.id ? liveSeconds(current) : task.elapsedSeconds,
        fullscreen: options?.fullscreen ?? true,
      });
    },
    [persist],
  );

  const pause = useCallback(() => {
    const current = storeRef.current;
    if (!current) return;
    const seconds = liveSeconds(current);
    const next = { ...current, running: false, startedAt: null, accumulated: seconds };
    persist(next);
    void saveElapsedAction(next.task.id, seconds, true);
  }, [persist]);

  const resume = useCallback(() => {
    const current = storeRef.current;
    if (!current) return;
    persist({ ...current, running: true, startedAt: Date.now(), accumulated: liveSeconds(current) });
  }, [persist]);

  const stop = useCallback(() => {
    const current = storeRef.current;
    if (!current) return;
    const seconds = liveSeconds(current);
    void saveElapsedAction(current.task.id, seconds, true);
    persist(null);
  }, [persist]);

  const reset = useCallback(() => {
    const current = storeRef.current;
    if (!current) return;
    const next: StoredTimer = {
      ...current,
      task: { ...current.task, elapsedSeconds: 0 },
      running: false,
      startedAt: null,
      accumulated: 0,
    };
    persist(next);
    void saveElapsedAction(next.task.id, 0, true);
  }, [persist]);

  const setFullscreen = useCallback(
    (value: boolean) => {
      const current = storeRef.current;
      if (!current) return;
      persist({ ...current, fullscreen: value });
    },
    [persist],
  );

  const value = useMemo(
    () => ({
      task: store?.task ?? null,
      running: Boolean(store?.running),
      fullscreen: Boolean(store?.fullscreen),
      elapsed,
      start,
      pause,
      resume,
      stop,
      reset,
      setFullscreen,
    }),
    [store, elapsed, start, pause, resume, stop, reset, setFullscreen],
  );

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const value = useContext(TimerContext);
  if (!value) throw new Error("TimerProvider eksik");
  return value;
}
