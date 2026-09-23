"use client";

// Multi-select dropdown styled from the section's own tokens (font, size,
// background), since a native <select> popup can't be restyled.
// Motion: panel fades in with a 4px drop and 0.98→1 scale from its top-left
// (160ms); the caret rotates; each checkmark draws itself in.
// Keyboard: Enter/Space/↓ opens, ↑/↓ move, Enter/Space toggle, Esc closes.

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import styles from "./MultiSelect.module.css";

interface Props {
  label: string;
  placeholder: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}

const ease = [0.16, 1, 0.3, 1] as const;

export function MultiSelect({ label, placeholder, options, value, onChange }: Props) {
  const reduce = useReducedMotion();
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const toggle = (opt: string) => onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) button.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    list.current?.focus();
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  const summary = value.length === 0 ? placeholder : value.length === 1 ? value[0] : `${value[0]} + ${value.length - 1}`;

  return (
    <div ref={root} className={styles.root}>
      <button
        ref={button}
        type="button"
        className={styles.button}
        data-active={value.length > 0 || undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={`${label}: ${summary}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive(0);
            setOpen(true);
          }
        }}
      >
        <span>{summary}</span>
        <motion.svg className={styles.caret} viewBox="0 0 10 6" aria-hidden="true" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25, ease }}>
          <path d="M1 1l4 4 4-4" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, y: reduce ? 0 : -4, scale: reduce ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : -4, transition: { duration: 0.12 } }}
            transition={{ duration: 0.16, ease }}
          >
            <ul
              ref={list}
              id={`${id}-list`}
              role="listbox"
              aria-multiselectable="true"
              aria-label={label}
              aria-activedescendant={`${id}-opt-${active}`}
              tabIndex={-1}
              className={styles.list}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") setActive((a) => Math.min(options.length - 1, a + 1));
                else if (e.key === "ArrowUp") setActive((a) => Math.max(0, a - 1));
                else if (e.key === "Home") setActive(0);
                else if (e.key === "End") setActive(options.length - 1);
                else if (e.key === " " || e.key === "Enter") toggle(options[active]);
                else if (e.key === "Escape") close();
                else if (e.key === "Tab") close(false);
                else return;
                e.preventDefault();
              }}
            >
              {options.map((opt, i) => {
                const selected = value.includes(opt);
                return (
                  <li
                    key={opt}
                    id={`${id}-opt-${i}`}
                    role="option"
                    aria-selected={selected}
                    data-active={i === active || undefined}
                    className={styles.option}
                    onPointerEnter={() => setActive(i)}
                    onClick={() => toggle(opt)}
                  >
                    <span className={styles.box} data-checked={selected || undefined} aria-hidden="true">
                      <svg viewBox="0 0 12 12">
                        <motion.path
                          d="M2.5 6.2l2.3 2.3 4.7-5"
                          initial={false}
                          animate={{ pathLength: selected ? 1 : 0, opacity: selected ? 1 : 0 }}
                          transition={{ duration: reduce ? 0 : 0.22, ease }}
                        />
                      </svg>
                    </span>
                    {opt}
                  </li>
                );
              })}
            </ul>
            {value.length > 0 && (
              <button type="button" className={styles.clear} onClick={() => onChange([])}>
                Clear
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
