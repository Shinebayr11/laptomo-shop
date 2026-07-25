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
  const [ready, setReady] = useState(false);

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
    setReady(true);
  }, [readValue]);

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (next) => {
      setStoredValue((prev) => {
        const resolved =
          typeof next === "function"
            ? (next as (value: T) => T)(prev)
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
    [key],
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
    };

    window.addEventListener("storage", sync);
    window.addEventListener("laptomo-local-storage", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("laptomo-local-storage", sync);
    };
  }, [key, readValue]);

  return [value, setValue, ready] as const;
}
