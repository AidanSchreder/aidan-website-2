"use client";
import Image from "next/image";
import { useState } from "react";

const skills = [
  {
    label: "Product thinking",
    description:
      "Translating ambiguous ideas into clear problem statements, flows, and interfaces.",
  },
  {
    label: "Interface design",
    description:
      "Designing calm, minimal layouts with attention to hierarchy, rhythm, and motion.",
  },
  {
    label: "Front‑end engineering",
    description:
      "Building accessible, performant interfaces in React / Next.js with clean architecture.",
  },
  {
    label: "Systems & tokens",
    description:
      "Creating reusable components, tokens, and documentation that scale across products.",
  },
  {
    label: "Collaboration",
    description:
      "Working closely with founders, PMs, and engineers to ship quickly without chaos.",
  },
];

const projects = [
  {
    title: "Interactive Dashboard",
    description:
      "A realtime analytics dashboard with live charts, filters, and responsive layout.",
    tags: ["Next.js", "Tailwind", "Charts"],
  },
  {
    title: "Design System Kit",
    description:
      "A reusable component library with tokens, documentation, and theming support.",
    tags: ["Storybook", "Design Systems"],
  },
  {
    title: "Creative Landing Page",
    description:
      "A high-conversion marketing page with motion, A/B tests, and SEO optimizations.",
    tags: ["SEO", "Animation", "A/B Testing"],
  },
];

export default function HomePage() {
  const [isDark, setIsDark] = useState(false);
  const [activeSkill, setActiveSkill] = useState(skills[0]);

  const bgClass = isDark
    ? "bg-slate-950 text-slate-50"
    : "bg-slate-50 text-slate-900";

  const panelClass = isDark
    ? "bg-slate-900/70 ring-1 ring-slate-800"
    : "bg-white/70 ring-1 ring-slate-200";

  const subtleText = isDark ? "text-slate-400" : "text-slate-500";

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
              <p className="text-sm font-medium uppercase tracking-[0.18em]">
                Portfolio
              </p>
              <p className={`text-xs ${subtleText}`}>Designer & Developer</p>
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

        <section className="grid flex-1 gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-12">
          <div className="flex flex-col gap-8">
            <div
              className={`${panelClass} relative overflow-hidden rounded-3xl p-7 shadow-lg backdrop-blur-sm sm:p-10`}
            >
              <div className="absolute right-[-3rem] top-[-3rem] h-40 w-40 rounded-full bg-gradient-to-br from-indigo-500/70 to-sky-400/70 opacity-60 blur-3xl" />

              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-indigo-500">
                Portfolio · 2026
              </p>

              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Crafting calm, modern
                <span className="block bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 bg-clip-text text-transparent">
                  digital experiences.
                </span>
              </h1>

              <p className={`mt-6 max-w-xl text-base sm:text-lg ${subtleText}`}>
                I design and build thoughtful interfaces with a focus on
                clarity, motion, and accessibility — from first sketches to
                production-ready code.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-50 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:translate-y-0 active:shadow-sm"
                >
                  View selected work
                </button>
                <button
                  type="button"
                  className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition ${
                    isDark
                      ? "text-slate-100 hover:text-slate-50"
                      : "text-slate-800 hover:text-slate-950"
                  }`}
                >
                  Get in touch
                  <span className="ml-2 text-base leading-none">↗</span>
                </button>
              </div>

              <div className="mt-8 grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <p
                    className={`text-xs font-medium uppercase tracking-[0.18em] ${subtleText}`}
                  >
                    Role
                  </p>
                  <p className="mt-1 font-medium">Product Designer · Engineer</p>
                </div>
                <div>
                  <p
                    className={`text-xs font-medium uppercase tracking-[0.18em] ${subtleText}`}
                  >
                    Location
                  </p>
                  <p className="mt-1 font-medium">Remote · GMT</p>
                </div>
                <div>
                  <p
                    className={`text-xs font-medium uppercase tracking-[0.18em] ${subtleText}`}
                  >
                    Availability
                  </p>
                  <p className="mt-1 font-medium">Open to new projects</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)]">
              <div className={`${panelClass} rounded-3xl p-6 shadow-md`}>
                <h2 className="text-lg font-semibold tracking-tight">
                  Selected skills
                </h2>
                <p className={`mt-2 text-sm ${subtleText}`}>
                  A blend of product thinking, visual craft, and robust
                  engineering.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <button
                      key={skill.label}
                      type="button"
                      onClick={() => setActiveSkill(skill)}
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition ${
                        activeSkill.label === skill.label
                          ? isDark
                            ? "bg-indigo-500 text-slate-50 shadow-sm"
                            : "bg-slate-900 text-slate-50 shadow-sm"
                          : isDark
                          ? "bg-slate-900/80 text-slate-100 ring-1 ring-slate-700/80 hover:bg-slate-800"
                          : "bg-slate-100 text-slate-900 ring-1 ring-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {skill.label}
                    </button>
                  ))}
                </div>
                <p className={`mt-4 text-sm leading-relaxed ${subtleText}`}>
                  {activeSkill.description}
                </p>
              </div>

              <div
                className={`${panelClass} group relative overflow-hidden rounded-3xl p-6 shadow-md`}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-sky-400/5 to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                      Experience snapshot
                    </h2>
                    <p className={`mt-2 text-sm ${subtleText}`}>
                      5+ years designing & building product experiences for
                      startups and agencies.
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <p className={`font-medium ${subtleText}`}>Shipped</p>
                    <p className="text-2xl font-semibold">40+</p>
                    <p className={subtleText}>projects</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <p className={subtleText}>Web · Product · Systems · Brand</p>
                  <p className={subtleText}>Available for freelance & full-time</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div
              className={`${panelClass} relative overflow-hidden rounded-3xl p-5 shadow-lg backdrop-blur-sm`}
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500/60 to-sky-400/50 blur-2xl" />

              <div className="relative flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-3xl ring-2 ring-slate-900/80">
                  <Image
                    src="/profile.jpg"
                    alt="Portrait"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-400">
                    Hello, I&apos;m
                  </p>
                  <p className="mt-1 text-xl font-semibold tracking-tight">
                    Aidan
                  </p>
                  <p className={`mt-1 text-sm ${subtleText}`}>
                    Product designer & front‑end engineer
                  </p>
                </div>
              </div>

              <p className={`relative mt-4 text-sm leading-relaxed ${subtleText}`}>
                I help teams translate messy ideas into crisp digital products —
                balancing usability, aesthetics, and performance.
              </p>
            </div>

            <div
              className={`${panelClass} grid flex-1 grid-rows-[auto,1fr] gap-4 rounded-3xl p-5 shadow-md`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.22em]">
                  Selected work
                </h2>
                <span
                  className={`rounded-full px-2 py-1 text-[0.65rem] font-medium uppercase tracking-[0.18em] ${
                    isDark
                      ? "bg-slate-900 text-slate-200"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  Case studies
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-3">
                {projects.map((project) => (
                  <button
                    key={project.title}
                    type="button"
                    className={`group flex flex-1 flex-col justify-between rounded-2xl border p-4 text-left transition hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isDark
                        ? "border-slate-800 bg-slate-950/40"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold tracking-tight">
                          {project.title}
                        </p>
                        <p className={`mt-1 text-xs ${subtleText}`}>
                          {project.description}
                        </p>
                      </div>
                      <span
                        className={`mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs transition ${
                          isDark
                            ? "bg-slate-900 text-slate-200 group-hover:bg-slate-800"
                            : "bg-slate-100 text-slate-900 group-hover:bg-slate-900 group-hover:text-slate-50"
                        }`}
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`rounded-full px-2 py-0.5 text-[0.68rem] font-medium ${
                            isDark
                              ? "bg-slate-900 text-slate-200"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs">
              <p className={subtleText}>
                Built with Next.js · Tailwind CSS · App Router.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

