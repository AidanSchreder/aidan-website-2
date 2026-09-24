"use client";

import { emailFor, mailto, page, type SectionId } from "@/content/site";
import { trackContact } from "@/app/_lib/track";
import { MessageForm } from "./MessageForm";

/**
 * One sentence and an email link. The subject line tells you which door it
 * came through. With `form`, a message form follows it (MessageForm.tsx), in
 * the same type as the line.
 */
export function ContactLine({ section, className, form }: { section: SectionId; className?: string; form?: boolean }) {
  const cls = className ? `contact-line ${className}` : "contact-line";
  const line = (
    <>
      {page(section).contact}{" "}
      <a href={mailto(section)} onClick={() => trackContact(section)}>
        {emailFor(section)}
      </a>
    </>
  );
  if (!form) return <p className={cls}>{line}</p>;
  return (
    <div className={cls}>
      <p>{line}</p>
      <MessageForm section={section} />
    </div>
  );
}
