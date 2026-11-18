"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sectionFor } from "@/content/site";
import { trackMissing } from "@/app/_lib/track";

/**
 * Where to go instead of a missing page: the section its address was under
 * (a broken /photography/… link leads to /photography), else the root card.
 * Never a list of sections, which the root deliberately avoids. The path is
 * reported to /stats so broken links and old URLs can be redirected.
 */
export function NotFoundLine({ className }: { className?: string }) {
  const pathname = usePathname();
  const { href } = sectionFor(pathname);

  useEffect(() => {
    trackMissing(pathname);
  }, [pathname]);

  return (
    <p className={className ? `contact-line ${className}` : "contact-line"}>
      Nothing lives at this address. Try <Link href={href}>aidanschreder.com{href === "/" ? "" : href}</Link>
    </p>
  );
}
