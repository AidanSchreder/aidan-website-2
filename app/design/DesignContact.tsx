"use client";

// Contact at the foot of every design page. The address is the headline: the
// hero's hollow stencil, filling in on hover, with the footer's grain pill
// stuck on its end. The section's line sits over it in grey italic, and the
// message form runs in one row underneath, the fields drawn as underlines.
// "Send" opens out at the end of the row once both fields have text (folds
// down under them on phones).
//
// Layout: "CONTACT" in design.module.css.

import { emailFor, mailto, page } from "@/content/site";
import { trackContact } from "@/app/_lib/track";
import { MessageForm } from "../_components/MessageForm";
import { FooterShape } from "./FooterShape";
import styles from "./design.module.css";

export function DesignContact() {
  return (
    <div className={styles.contact}>
      <p className={styles.contactLead}>{page("design").contact}</p>
      <div className={styles.contactAddress}>
        <a href={mailto("design")} onClick={() => trackContact("design")}>
          {emailFor("design")}
        </a>
        <FooterShape />
      </div>
      <MessageForm
        section="design"
        className={styles.contactForm}
        or={false}
        fit={false}
        placeholders={{ message: "Or leave a message", email: "Your email" }}
      />
    </div>
  );
}
