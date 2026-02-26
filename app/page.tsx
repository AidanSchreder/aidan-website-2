"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [isDark, setIsDark] = useState(false);

  const bgClass = isDark
    ? "bg-slate-950 text-slate-50"
    : "bg-slate-100 text-slate-900";

  const cardBase =
    "rounded-3xl border shadow-[0_18px_60px_rgba(15,23,42,0.26)] backdrop-blur-md transition-transform duration-300";

  const logoPathCard = isDark
    ? "bg-slate-900/90 border-slate-700"
    : "bg-white border-slate-200";

  const engineeringPathCard = isDark
    ? "bg-slate-900/90 border-slate-700"
    : "bg-slate-900 text-slate-50 border-slate-900";

  return (
    <main
      className={`${bgClass} min-h-screen font-sans antialiased transition-colors duration-300`}
    >
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="pointer-events-none absolute -left-32 top-[-10rem] h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-8rem] right-[-4rem] h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-16 pt-10 sm:px-6 sm:pt-12 lg:px-10 lg:pt-16">
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
          <div className="pointer-events-none absolute -left-16 top-10 h-48 w-48 -rotate-6 rounded-3xl border border-dashed border-slate-400/60 bg-gradient-to-tr from-slate-200/80 via-white/70 to-indigo-100/80 blur-xl sm:blur-2xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-60 w-60 rotate-6 rounded-full bg-gradient-to-tr from-indigo-500/20 via-sky-400/10 to-emerald-300/30 blur-3xl" />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-10">
            <div className="space-y-6">
              <div
                className={`${cardBase} relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-50`}
              >
                <div className="pointer-events-none absolute inset-0 opacity-35">
                  <div className="h-full w-full bg-[radial-gradient(circle_at_0_0,#22d3ee_0,transparent_55%),radial-gradient(circle_at_100%_0,#4f46e5_0,transparent_55%)]" />
                </div>

                <div className="relative grid gap-8 p-7 sm:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)] sm:p-9">
                  <div className="space-y-5">
                    <p className="inline-flex items-center gap-2 rounded-full border border-dashed border-slate-600 bg-slate-900/70 px-3 py-1 text-[0.65rem] font-mono uppercase tracking-[0.28em]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      <span>Futuristic scrapbook</span>
                    </p>

                    <h1 className="text-[2.4rem] leading-[1.05] tracking-tight sm:text-[2.9rem] lg:text-[3.2rem]">
                      Logos, code, and
                      <span className="block font-mono text-sm uppercase tracking-[0.55em] text-emerald-300/90">
                        small experiments in light
                      </span>
                      <span className="mt-2 block bg-gradient-to-r from-emerald-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                        stitched into one studio.
                      </span>
                    </h1>

                    <p className="max-w-xl text-sm text-slate-200/80 sm:text-base">
                      I&apos;m Aidan — a logo designer and engineer building
                      strange, thoughtful interfaces. This is a living notebook
                      where brand marks, prototypes, and half-finished ideas all
                      sit on the same page.
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-4 -top-4 hidden rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/80 px-3 py-1 text-[0.65rem] font-mono uppercase tracking-[0.28em] text-slate-300 sm:inline-flex">
                      work in progress
                    </div>

                    <div className="relative h-40 w-full rounded-3xl border border-slate-700/80 bg-slate-900/80 shadow-[0_18px_60px_rgba(0,0,0,0.6)] sm:h-52">
                      <Image
                        src="/profile.jpg"
                        alt="Aidan in the studio"
                        fill
                        sizes="(min-width: 1024px) 280px, 220px"
                        className="object-cover object-center mix-blend-screen"
                      />
                      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[0.7rem] font-mono uppercase tracking-[0.22em] text-slate-200/90">
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-500/80 bg-slate-900/80 text-[0.6rem]">
                          N°
                        </span>
                        <span>2026 portfolio cut</span>
                      </div>
                    </div>

                    <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-2xl border border-emerald-300/60 bg-slate-900/90 px-3 py-1.5 text-[0.7rem] font-mono uppercase tracking-[0.2em] text-emerald-200 shadow-lg">
                      <span className="inline-flex h-2 w-8 animate-pulse bg-gradient-to-r from-emerald-300 via-sky-300 to-emerald-300" />
                      <span>always prototyping</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mt-10 space-y-4">
                <div className="pointer-events-none absolute -left-6 -top-8 hidden h-16 w-16 rounded-full border border-dashed border-slate-400/70 md:block" />

                <div className="grid gap-4 md:grid-cols-2">
                  <Link
                    href="/logos"
                    className={`${cardBase} ${logoPathCard} group relative px-5 py-6 sm:px-6 sm:py-7 hover:-translate-y-1`}
                  >
                    <div className="absolute -right-6 -top-6 h-16 w-16 rotate-6 rounded-3xl border border-slate-300/60 bg-gradient-to-br from-slate-100/80 via-white/70 to-indigo-100/80" />
                    <div className="relative space-y-3">
                      <p className="text-[0.7rem] font-mono uppercase tracking-[0.32em] text-slate-500">
                        Path one
                      </p>
                      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        Logo design lab
                      </h2>
                      <p className="text-sm text-slate-600">
                        Monograms, marks, and experimental typography crafted
                        for founders and weird little products.
                      </p>
                      <button
                        type="button"
                        className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-900 px-4 py-1.5 text-xs font-medium text-slate-50 shadow-sm transition group-hover:-translate-y-0.5 group-hover:bg-slate-800"
                      >
                        Enter logo studio
                        <span className="text-sm">↳</span>
                      </button>
                    </div>
                  </Link>

                  <Link
                    href="/engineering"
                    className={`${cardBase} ${engineeringPathCard} group relative px-5 py-6 sm:px-6 sm:py-7 hover:-translate-y-1`}
                  >
                    <div className="absolute -left-5 -top-4 h-10 w-24 -rotate-3 rounded-full border border-slate-500/60 bg-slate-900/70 text-[0.6rem] font-mono uppercase tracking-[0.26em] text-slate-200/90 sm:flex sm:items-center sm:justify-center">
                      code & systems
                    </div>
                    <div className="relative space-y-3">
                      <p className="text-[0.7rem] font-mono uppercase tracking-[0.32em] text-slate-300/90">
                        Path two
                      </p>
                      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        Engineering scrapbook
                      </h2>
                      <p className="text-sm text-slate-200/80">
                        Interfaces, prototypes, and small tools built in
                        Next.js — the behind-the-scenes of how things work.
                      </p>
                      <button
                        type="button"
                        className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-500 bg-slate-50 px-4 py-1.5 text-xs font-medium text-slate-900 shadow-sm transition group-hover:-translate-y-0.5 group-hover:bg-emerald-100"
                      >
                        Explore engineering work
                        <span className="text-sm">⇱</span>
                      </button>
                    </div>
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 text-[0.7rem] font-mono uppercase tracking-[0.26em] text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-400/70 px-3 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Blends logo craft & code</span>
                  </span>
                  <span>Freelance · collaborations · experiments</span>
                </div>
              </div>
            </div>

            <aside className="relative mt-4 space-y-5 lg:mt-0">
              <div
                className={`${cardBase} relative overflow-hidden bg-white/90 px-5 py-6 text-slate-900 sm:px-6 sm:py-7`}
              >
                <div className="absolute inset-x-6 top-0 h-10 bg-gradient-to-r from-slate-100 via-emerald-50/70 to-sky-100" />
                <div className="relative flex items-start gap-4">
                  <div className="relative h-16 w-16 shrink-0 -rotate-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-200/80 shadow-md">
                    <Image
                      src="/profile.jpg"
                      alt="Aidan portrait"
                      fill
                      sizes="64px"
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[0.7rem] font-mono uppercase tracking-[0.3em] text-slate-500">
                      Aidan · designer / engineer
                    </p>
                    <p className="text-sm leading-relaxed text-slate-700">
                      I work at the overlap of identity, interface, and motion —
                      designing logos that feel like tiny worlds and interfaces
                      that feel a bit like instruments.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative space-y-4">
                <div className="absolute -right-6 -top-6 hidden h-16 w-16 rotate-6 rounded-3xl border border-dashed border-slate-400/70 md:block" />

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="relative -rotate-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/90 px-4 py-3 text-xs text-slate-700 shadow-sm">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.26em] text-slate-500">
                      Notes from the desk
                    </p>
                    <p className="mt-1">
                      Favorite tools: a notebook, Figma, and a very messy
                      Next.js repo.
                    </p>
                  </div>

                  <div className="relative rotate-1 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-4 py-3 text-xs text-slate-800 shadow-sm">
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.26em] text-emerald-600">
                      Currently exploring
                    </p>
                    <p className="mt-1">
                      Kinetic logo systems, generative palettes, and small
                      tools that help teams think visually.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[0.7rem] text-slate-500">
                  <span>Based in GMT · open to remote work</span>
                  <span className="hidden font-mono uppercase tracking-[0.25em] sm:inline">
                    Built with Next.js & Tailwind
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

