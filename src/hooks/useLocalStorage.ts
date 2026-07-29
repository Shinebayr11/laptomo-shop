"use client";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const initialRef = useRef(initial);
  const [value, setStoredValue] = useState<T>(initial);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const valueRef = useRef<T>(initial);
  const loadedKeyRef = useRef<string | null>(null);

  const readValue = useCallback(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialRef.current;
    } catch {
      return initialRef.current;
    }
  }, [key]);

  /** ref болон state-ийг зэрэг шинэчилнэ — updater дотор side effect хийхээс сэргийлнэ. */
  const commit = useCallback((next: T, nextLoadedKey: string) => {
    valueRef.current = next;
    loadedKeyRef.current = nextLoadedKey;
    setStoredValue(next);
    setLoadedKey(nextLoadedKey);
  }, []);

  useEffect(() => {
    commit(readValue(), key);
  }, [commit, key, readValue]);

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (next) => {
      const current =
        loadedKeyRef.current === key ? valueRef.current : readValue();
      const resolved =
        typeof next === "function"
          ? (next as (value: T) => T)(current)
          : next;

      commit(resolved, key);

      try {
        localStorage.setItem(key, JSON.stringify(resolved));
        window.dispatchEvent(
          new CustomEvent("laptomo-local-storage", { detail: { key } }),
        );
      } catch {
        /* алгасна */
      }
    },
    [commit, key, readValue],
  );

  useEffect(() => {
    const sync = (event: Event) => {
      if (event instanceof StorageEvent && event.key && event.key !== key) {
        return;
      }
      if (event instanceof CustomEvent && event.detail?.key !== key) {
        return;
      }
      commit(readValue(), key);
    };

    window.addEventListener("storage", sync);
    window.addEventListener("laptomo-local-storage", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("laptomo-local-storage", sync);
    };
  }, [commit, key, readValue]);

  const ready = loadedKey === key;

  return [value, setValue, ready] as const;
}
