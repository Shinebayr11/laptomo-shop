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

  const readValue = useCallback(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialRef.current;
    } catch {
      return initialRef.current;
    }
  }, [key]);

  useEffect(() => {
    setStoredValue(readValue());
    setLoadedKey(key);
  }, [key, readValue]);

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (next) => {
      setStoredValue((prev) => {
        const currentValue = loadedKey === key ? prev : readValue();
        const resolved =
          typeof next === "function"
            ? (next as (value: T) => T)(currentValue)
            : next;

        try {
          localStorage.setItem(key, JSON.stringify(resolved));
          window.dispatchEvent(
            new CustomEvent("laptomo-local-storage", { detail: { key } }),
          );
        } catch {
          /* алгасна */
        }

        return resolved;
      });
    },
    [key, loadedKey, readValue],
  );

  useEffect(() => {
    const sync = (event: Event) => {
      if (event instanceof StorageEvent && event.key && event.key !== key) {
        return;
      }
      if (event instanceof CustomEvent && event.detail?.key !== key) {
        return;
      }
      setStoredValue(readValue());
      setLoadedKey(key);
    };

    window.addEventListener("storage", sync);
    window.addEventListener("laptomo-local-storage", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("laptomo-local-storage", sync);
    };
  }, [key, readValue]);

  const ready = loadedKey === key;

  return [value, setValue, ready] as const;
}
