import Link from "next/link";
import { NAME } from "@/content/site";

/**
 * The one quiet line every landing page carries: back to the lobby, and to
 * this section's own about page. Deliberately no "see my other work".
 */
export function FooterLine({ about, children, className }: { about?: string; children?: React.ReactNode; className?: string }) {
  return (
    <footer className={className ? `footer-line ${className}` : "footer-line"}>
      <Link href="/">{NAME}</Link>
      {about && <Link href={about}>About</Link>}
      {children}
    </footer>
  );
}
