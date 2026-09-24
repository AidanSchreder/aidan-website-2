"use client";

// "or", then a message field and an email field under a section's email line.
// Each field is a grey bubble as wide as that email address (a hidden copy of
// it sets the width, so it matches in any font), one line tall until the text
// wraps. "Send" slides in once both have something in them; Enter in the email
// field sends too. Posts to /api/message, which forwards it to Aidan's phone.
//
// Motion (all 200–400ms, eased out; reduced motion keeps only the fades):
//   typing   — the bubble eases to its new height as lines wrap or unwrap.
//   ready    — "Send" folds open under the fields and drops into place.
//   sending  — the fields dim and "Sending" breathes.
//   invalid  — the email bubble gives a small shake; the note folds open.
//   sent     — the form lifts and folds away, then the confirmation rises in.
//
// Bots: a hidden "company" field people never see, and the time from the
// first keystroke to sending (see app/api/message/route.ts).

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import { emailFor, type SectionId } from "@/content/site";
import { trackContact } from "@/app/_lib/track";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ease = [0.22, 1, 0.36, 1] as const;

type Status = "idle" | "sending" | "sent" | "invalid" | "error";

/**
 * Sets a textarea's height to fit its text. The height is measured on a
 * hidden copy, so the field itself only ever goes from one pixel height to
 * another and its CSS transition can ease between them.
 */
function fit(el: HTMLTextAreaElement | null) {
  if (!el?.parentNode) return;
  const copy = el.cloneNode() as HTMLTextAreaElement;
  copy.value = el.value;
  copy.tabIndex = -1;
  copy.setAttribute("aria-hidden", "true");
  copy.style.cssText = `position:absolute;visibility:hidden;height:auto;transition:none;min-width:0;width:${el.offsetWidth}px`;
  el.parentNode.appendChild(copy);
  const height = copy.scrollHeight;
  copy.remove();
  el.style.height = `${height}px`;
  // The browser scrolls a too-short field to the caret; keep the text still
  // and let the bubble grow down to reveal the new line instead.
  el.scrollTop = 0;
}

/** Fits a textarea to its text as it changes, and whenever its width changes. */
function useAutosize(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => fit(ref.current), [value]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let width = el.offsetWidth;
    const ro = new ResizeObserver(() => {
      if (el.offsetWidth === width) return;
      width = el.offsetWidth;
      fit(el);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return ref;
}

export function MessageForm({ section }: { section: SectionId }) {
  const reduce = useReducedMotion();
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const started = useRef(0);
  const company = useRef<HTMLInputElement>(null);
  const textRef = useAutosize(text);
  const emailRef = useAutosize(email);
  const ready = Boolean(text.trim() && email.trim());
  const sending = status === "sending";

  const begin = () => {
    if (!started.current) started.current = Date.now();
  };

  async function send(e?: FormEvent) {
    e?.preventDefault();
    if (!ready || sending) return;
    if (!EMAIL.test(email.trim())) {
      setStatus("invalid");
      const el = emailRef.current;
      el?.focus();
      if (el && !reduce) animate(el, { x: [0, -5, 5, -3, 3, 0] }, { duration: 0.36, ease: "easeInOut" });
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          section,
          text,
          email: email.trim(),
          company: company.current?.value ?? "",
          elapsed: Date.now() - started.current,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      trackContact(section);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  const note = status === "invalid" ? "That email doesn’t look right." : status === "error" ? "Couldn’t send. Please use the email above." : null;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === "sent" ? (
        <motion.p
          key="sent"
          className="message-note message-sent"
          role="status"
          initial={{ opacity: 0, y: reduce ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
        >
          Sent. I’ll reply to {email.trim()}.
        </motion.p>
      ) : (
        <motion.form
          key="form"
          className="message-form"
          onSubmit={send}
          noValidate
          data-sending={sending || undefined}
          exit={{ opacity: 0, height: 0, marginTop: 0, y: reduce ? 0 : -10, overflow: "hidden" }}
          transition={{ duration: 0.4, ease }}
        >
          <p className="message-or">or</p>
          <div className="message-fields">
            <span className="message-sizer" aria-hidden="true">
              {emailFor(section)}
            </span>
            <textarea
              ref={textRef}
              className="message-field"
              name="message"
              rows={1}
              placeholder="Enter message"
              aria-label="Message"
              maxLength={2000}
              readOnly={sending}
              value={text}
              onFocus={begin}
              onChange={(e) => setText(e.target.value)}
            />
            <textarea
              ref={emailRef}
              className="message-field"
              name="email"
              rows={1}
              placeholder="Enter email"
              aria-label="Your email"
              aria-invalid={status === "invalid" || undefined}
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={200}
              readOnly={sending}
              value={email}
              onFocus={begin}
              onChange={(e) => {
                // An email address is one line; Enter sends instead.
                setEmail(e.target.value.replace(/[\r\n]+/g, ""));
                if (status === "invalid") setStatus("idle");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  send();
                }
              }}
            />
            {/* Out of sight and out of the tab order; only bots fill it in. */}
            <input ref={company} className="message-trap" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className="message-send-row" data-show={ready || undefined}>
              <div>
                <button type="submit" className="message-send" disabled={!ready || sending} tabIndex={ready ? 0 : -1}>
                  {sending ? "Sending" : "Send"}
                </button>
              </div>
            </div>
            <AnimatePresence initial={false}>
              {note && (
                <motion.p
                  key={status}
                  className="message-note"
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <span>{note}</span>
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
