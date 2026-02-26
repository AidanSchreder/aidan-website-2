"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [isDark, setIsDark] = useState(false);

  const bgClass = isDark
    ? "bg-slate-950 text-slate-50"
    : "bg-slate-100 text-slate-900";

  return (
    <main
      className={`${bgClass} min-h-screen font-sans antialiased transition-colors duration-300`}
    >
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="pointer-events-none absolute -left-32 top-[-10rem] h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-8rem] right-[-4rem] h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-24 pt-10 sm:px-6 sm:pt-12 lg:px-10 lg:pt-16">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xl font-semibold shadow-sm transition ${
                isDark
                  ? "bg-slate-900 text-slate-50"
                  : "bg-slate-900 text-slate-50"
              }`}
            >
              A
            </div>
            <div className="leading-tight">
              <p className="text-[0.65rem] font-mono uppercase tracking-[0.28em]">
                Aidan Studio
              </p>
              <p className="text-xs text-slate-500">
                Logos · Interfaces · Experiments
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDark((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium shadow-sm ring-1 transition-colors ${
              isDark
                ? "bg-slate-900 text-slate-100 ring-slate-700 hover:bg-slate-800"
                : "bg-white text-slate-900 ring-slate-200 hover:bg-slate-100"
            }`}
            aria-label="Toggle color scheme"
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[0.7rem] transition ${
                isDark ? "bg-slate-800" : "bg-slate-900 text-slate-50"
              }`}
            >
              {isDark ? "☾" : "☀"}
            </span>
            <span>{isDark ? "Dark mode" : "Light mode"}</span>
          </button>
        </header>

        <section className="relative flex-1">
          <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 -rotate-6 border border-dashed border-slate-400/40 bg-gradient-to-tr from-slate-200/70 via-white/60 to-indigo-100/70 blur-2xl -z-10" />
          <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rotate-6 rounded-full bg-gradient-to-tr from-indigo-500/15 via-sky-400/10 to-emerald-300/25 blur-3xl -z-10" />

          <div className="relative z-10 space-y-20 pb-10">
            {/* Hero text + image collage */}
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-[0.7rem] font-mono font-semibold uppercase tracking-[0.3em] text-slate-500">
                  FUTURISTIC SCRAPBOOK · 2026
                </p>
                <h1 className="max-w-3xl text-4xl font-black uppercase tracking-tight sm:text-5xl lg:text-[3.4rem]">
                  LOGOS / CODE / SMALL EXPERIMENTS
                </h1>
                <p className="max-w-xl text-sm font-medium uppercase tracking-[0.18em] text-slate-600 sm:text-[0.8rem]">
                  AIDAN · DESIGNER / ENGINEER CREATING LOGOS THAT FEEL LIKE
                  GLYPHS AND INTERFACES THAT FEEL LIKE INSTRUMENTS.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="relative -rotate-2 overflow-hidden rounded-3xl shadow-[0_18px_60px_rgba(15,23,42,0.28)]">
                  <div className="relative aspect-[4/5]">
                    <Image
                      src="/profile.jpg"
                      alt="Logo sketch and early mark exploration"
                      fill
                      sizes="(min-width: 1024px) 260px, 40vw"
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <p className="absolute bottom-3 left-4 text-[0.65rem] font-mono font-semibold uppercase tracking-[0.28em] text-slate-100">
                    LOGO ROUGHS
                  </p>
                </div>

                <div className="relative rotate-1 overflow-hidden rounded-3xl shadow-[0_18px_60px_rgba(15,23,42,0.24)]">
                  <div className="relative aspect-[4/5]">
                    <Image
                      src="/profile.jpg"
                      alt="Interface prototype detail"
                      fill
                      sizes="(min-width: 1024px) 260px, 40vw"
                      className="object-cover object-[center_top]"
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-900/70 via-transparent to-slate-900/60" />
                  <p className="absolute top-3 left-4 text-[0.65rem] font-mono font-semibold uppercase tracking-[0.3em] text-emerald-300">
                    UI WIRES
                  </p>
                </div>

                <div className="relative -rotate-1 overflow-hidden rounded-3xl shadow-[0_18px_60px_rgba(15,23,42,0.26)] sm:translate-y-6">
                  <div className="relative aspect-[4/5]">
                    <Image
                      src="/profile.jpg"
                      alt="Studio desk and tools"
                      fill
                      sizes="(min-width: 1024px) 260px, 40vw"
                      className="object-cover object-[center_bottom]"
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/40 via-transparent to-sky-400/40" />
                  <p className="absolute bottom-3 right-4 text-[0.65rem] font-mono font-semibold uppercase tracking-[0.28em] text-slate-100">
                    STUDIO
                  </p>
                </div>
              </div>
            </div>

            {/* Logo design path */}
            <div className="space-y-6">
              <p className="text-[0.7rem] font-mono font-semibold uppercase tracking-[0.3em] text-slate-500">
                PATH ONE · LOGO WORK
              </p>

              <Link href="/logos" className="group block">
                <div className="relative">
                  <div className="relative aspect-[5/3] overflow-hidden rounded-[2.25rem] shadow-[0_26px_90px_rgba(15,23,42,0.36)]">
                    <Image
                      src="/profile.jpg"
                      alt="Grid of logo marks"
                      fill
                      sizes="(min-width: 1024px) 900px, 100vw"
                      className="object-cover object-center"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90" />
                  </div>

                  <div className="absolute inset-x-6 bottom-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-[0.7rem] font-mono font-semibold uppercase tracking-[0.32em] text-slate-300">
                        LOGO DESIGN LAB
                      </p>
                      <p className="max-w-xl text-xs font-medium uppercase tracking-[0.2em] text-slate-200">
                        MONOGRAMS, WORDMARKS, AND SYMBOLS FOR FOUNDERS, CLUBS,
                        AND WEIRD LITTLE PRODUCTS.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-md bg-slate-50 px-4 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-slate-900 shadow-sm transition group-hover:-translate-y-0.5 group-hover:bg-emerald-100"
                    >
                      Enter logo studio
                      <span className="text-sm">↳</span>
                    </button>
                  </div>
                </div>
              </Link>
            </div>

            {/* Engineering path */}
            <div className="space-y-6">
              <p className="text-[0.7rem] font-mono font-semibold uppercase tracking-[0.3em] text-slate-500">
                PATH TWO · ENGINEERING
              </p>

              <Link href="/engineering" className="group block">
                <div className="relative">
                  <div className="relative aspect-[5/3] overflow-hidden rounded-[2.25rem] shadow-[0_26px_90px_rgba(15,23,42,0.34)]">
                    <Image
                      src="/profile.jpg"
                      alt="Interface details and code overlays"
                      fill
                      sizes="(min-width: 1024px) 900px, 100vw"
                      className="object-cover object-[center_top]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-slate-950/85 via-slate-900/40 to-sky-400/40" />
                  </div>

                  <div className="absolute inset-x-6 bottom-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-[0.7rem] font-mono font-semibold uppercase tracking-[0.32em] text-slate-200">
                        ENGINEERING SCRAPBOOK
                      </p>
                      <p className="max-w-xl text-xs font-medium uppercase tracking-[0.2em] text-slate-200">
                        INTERFACES, PROTOTYPES, AND SMALL TOOLS IN NEXT.JS —
                        THE BEHIND-THE-SCENES OF HOW THINGS WORK.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-md bg-slate-900/90 px-4 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-slate-50 shadow-sm ring-1 ring-slate-600 transition group-hover:-translate-y-0.5 group-hover:bg-slate-950"
                    >
                      Explore engineering work
                      <span className="text-sm">⇱</span>
                    </button>
                  </div>
                </div>
              </Link>
            </div>

            {/* About blurb */}
            <div className="space-y-4 border-t border-slate-200 pt-10">
              <p className="text-[0.7rem] font-mono font-semibold uppercase tracking-[0.3em] text-slate-500">
                ABOUT
              </p>
              <p className="max-w-2xl text-sm font-medium text-slate-700">
                I LIKE PROJECTS WHERE THE BRAND MARK, PRODUCT SURFACE, AND
                LITTLE INTERNAL TOOLS ALL TALK TO EACH OTHER. IF YOU&apos;RE
                LOOKING FOR SOMEONE WHO CAN DESIGN THE LOGO, BUILD THE SITE, AND
                KEEP THE EXPERIMENTS GOING, YOU&apos;RE IN THE RIGHT PLACE.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

