import { useEffect, useRef, useState } from "react"
import {
  motion,
  useReducedMotion,
  useInView,
  useMotionValue,
  useTransform,
  useScroll,
  animate,
} from "framer-motion"
import Lenis from "lenis"

/* ============================================================
   MOTION TOKENS
   ============================================================ */

const EASE = [0.16, 1, 0.3, 1] as const
const DUR = 0.8

/* ============================================================
   DATA
   ============================================================ */

const SECTIONS = [
  { id: "intake", label: "intake" },
  { id: "about", label: "about" },
  { id: "experience", label: "experience" },
  { id: "projects", label: "projects" },
  { id: "publications", label: "publications" },
  { id: "contact", label: "contact" },
] as const

const STATS = [
  { value: 10000, suffix: "+", label: "events per second", sub: "distributed telemetry pipeline" },
  { value: 97, suffix: "%", label: "uptime in production", sub: "30K+ monthly users" },
  { value: 64, suffix: "%", label: "execution accuracy", sub: "500 BIRD-SQL questions" },
  { value: 42, suffix: "%", label: "defect prediction lift", sub: "15,000+ scenarios per release" },
]

const EXPERIENCE = [
  {
    role: "Software Engineer Intern",
    org: "DevQAExpert Solution Private Limited",
    when: "May 2024 — Aug 2025",
    bullets: [
      "Lifted defect prediction accuracy 42% across 15,000+ validation scenarios per release by writing Python automation with scikit-learn that scored every scenario by failure risk and ran the riskiest first, replacing the spreadsheet-driven triage process.",
      "Cut manual engineering effort 60% by wiring test execution into Jenkins and GitHub Actions CI/CD, pulling result data through SQL queries and REST API calls instead of manual exports, so every code change was validated before sign-off without an engineer in the loop.",
      "Caught 40+ defects per release before production by building monitoring and alerts across 12 deployment cycles tracking runtime, stage failures, and latency anomalies — then troubleshooting each at code level to isolate root cause.",
      "Reduced code review turnaround 30% by designing the release validation process the team adopted, documenting every step and supporting peers until they could run it end to end independently.",
    ],
  },
  {
    role: "Machine Learning Intern",
    org: "Genesis Technologies",
    when: "Jan 2023 — Dec 2023",
    bullets: [
      "Rebuilt an end-to-end machine learning system in Python with TensorFlow and scikit-learn serving 30K+ monthly users, owning design, testing, deployment, and ongoing maintenance against live production traffic.",
      "Engineered 15+ features from image and document quality signals after diagnosing that input quality — not model architecture — was the real bottleneck, deduplicating and validating each batch before training.",
      "Sustained 97% uptime across 1,000+ daily requests by deploying containerized services on AWS Lambda, S3, and EC2 with Docker and Flask REST APIs, instrumenting latency and error-rate alerting that surfaced degradation during traffic peaks.",
      "Lifted the F1 score from 0.71 to 0.89 by automating cross-validation that scored every candidate build against the previous release under identical conditions, then tuning thresholds guided by systematic failure analysis.",
    ],
  },
  {
    role: "Data Analyst Intern",
    org: "Agrawal's 420 Namkeen, Sweets & Bakery",
    when: "Jan 2022 — Jun 2022",
    bullets: [
      "Cut pipeline runtime 45% by profiling slow query paths across Oracle and PostgreSQL, rewriting join logic and moving heavy jobs off peak schedules for the Python and SQL workloads feeding downstream reporting.",
      "Improved freshness and reliability of daily analysis used across marketing, sales, and warehouse teams through scheduled automation that validated completeness at every stage before downstream querying.",
      "Accelerated root-cause investigation by building monitoring scorecards and automated alerting on job latency, failures, and data freshness — surfacing degraded jobs the moment they failed rather than hours later.",
      "Translated system-level metrics into self-service dashboards non-engineering teams could act on unaided, working with peers and managers to define what each metric needed to surface and why.",
    ],
  },
]

const RESULTS = [
  { tier: "Overall", n: 500, ex: 64.4, correct: 322 },
  { tier: "Simple", n: 148, ex: 75.7, correct: 112 },
  { tier: "Moderate", n: 250, ex: 61.6, correct: 154 },
  { tier: "Challenging", n: 102, ex: 54.9, correct: 56 },
]

const NODES = [
  { name: "schema_linker", role: "Prunes schema to relevant tables and columns", tier: "cheap" },
  { name: "sql_generator", role: "Drafts SQL from linked schema and evidence", tier: "strong" },
  { name: "executor", role: "Runs SQL against SQLite — no LLM involved", tier: "none" },
  { name: "validator", role: "Routes to completion or repair", tier: "none" },
  { name: "self_corrector", role: "Rewrites SQL from the execution error", tier: "strong" },
]

const TAXONOMY = [
  { cat: "projection_differs", n: 58, pct: 32.6 },
  { cat: "table_set_differs", n: 45, pct: 25.3 },
  { cat: "aggregation_differs", n: 30, pct: 16.9 },
  { cat: "join_structure_differs", n: 20, pct: 11.2 },
  { cat: "filter_differs", n: 16, pct: 9.0 },
  { cat: "literal_differs", n: 5, pct: 2.8 },
  { cat: "unparseable_or_empty", n: 2, pct: 1.1 },
  { cat: "order_limit_differs", n: 1, pct: 0.6 },
  { cat: "unclassified", n: 1, pct: 0.6 },
]

/* href: set to "" to hide the "view code" link entirely.
   Paste a real GitHub URL to show it. */
const PROJECTS = [
  {
    id: "navsim",
    name: "Navigation Validation Simulator",
    tag: "C++ simulation and release automation",
    when: "Aug 2026 — Present",
    stack: ["C++", "Linux", "Docker", "GitHub Actions"],
    href: "",
    bullets: [
      "Gates releases at a 98% accuracy threshold by replaying routes against expected outputs, so regressions automatically block their own deployment container.",
      "Every validation run is reproducible — the full sweep is automated through GitHub Actions and Docker, so results from any two builds are directly comparable without manual setup.",
      "A root-cause module parses failure logs and clusters routes by failure signature into one traceable summary an engineer can act on.",
    ],
    expandable: false,
  },
  {
    id: "telemetry",
    name: "Fleet Telemetry Observability Platform",
    tag: "Distributed pipeline with monitoring",
    when: "Jan 2026 — Mar 2026",
    stack: ["Kafka", "PostgreSQL", "Grafana", "Linux"],
    href: "",
    bullets: [
      "Sustains 10,000+ events per second from 1,000+ simulated devices through a distributed Kafka and PostgreSQL pipeline on Linux, validating every signal stream for completeness before storage.",
      "Flags traffic anomalies automatically with 3-sigma detection over streaming data, replacing manual inspection of raw telemetry logs across the entire simulated fleet.",
      "Grafana dashboards surface latency, throughput, and error-rate trends — each metric documented so any engineer can read them unaided.",
    ],
    expandable: false,
  },
  {
    id: "nl2sql",
    name: "NL2SQL Agent",
    tag: "Information retrieval and query verification",
    when: "Nov 2025 — Dec 2025",
    stack: ["Python", "LangGraph", "sqlglot", "SQLite"],
    href: "https://github.com/paramjain13/nl2sql-agent",
    bullets: [
      "Reaches 64% execution accuracy across 500 BIRD-SQL benchmark questions against a 1M+ row database through iterative self-correction and automated query repair loops.",
      "A static verifier parses SQL into an AST and walks the foreign-key graph to reject invalid join paths, catching confident model failures most text-to-SQL systems miss.",
      "Cuts compute cost per query without moving accuracy by profiling cost and latency across the workload and routing simple questions to lighter models.",
    ],
    expandable: true,
  },
]

const SKILLS = [
  { group: "Languages", items: "Python · C++ · C · TypeScript · JavaScript · SQL · Bash · Rust" },
  { group: "Systems", items: "Data Structures & Algorithms · Object-Oriented Design · Scalable Distributed Systems · Distributed & Parallel Systems · Unix/Linux · Scripting & Automation · Monitoring & Alerts" },
  { group: "ML & AI", items: "PyTorch · TensorFlow · scikit-learn · Pandas · NumPy · Machine Learning · NLP · Information Retrieval" },
  { group: "Data", items: "Kafka · PostgreSQL · MySQL · MongoDB · Apache Airflow · ETL Pipelines · Grafana" },
  { group: "Web & Cloud", items: "React · Next.js · FastAPI · Flask · REST APIs · Docker · CI/CD · GitHub Actions · Git · AWS (S3, Lambda, EC2)" },
]

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */

function useLenis(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
    let id = 0
    const raf = (time: number) => {
      lenis.raf(time)
      id = requestAnimationFrame(raf)
    }
    id = requestAnimationFrame(raf)

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]')
      if (!a) return
      const href = a.getAttribute("href")
      if (!href || href === "#") return
      e.preventDefault()
      lenis.scrollTo(href, { offset: -40 })
    }
    document.addEventListener("click", onClick)

    return () => {
      cancelAnimationFrame(id)
      document.removeEventListener("click", onClick)
      lenis.destroy()
    }
  }, [enabled])
}

function useActiveSection() {
  const [active, setActive] = useState<string>("intake")
  const [log, setLog] = useState<{ id: string; t: string }[]>([])
  const seen = useRef(new Set<string>())
  const start = useRef(Date.now())

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const id = e.target.id
          setActive(id)
          if (!seen.current.has(id)) {
            seen.current.add(id)
            const s = Math.floor((Date.now() - start.current) / 1000)
            const t = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`
            setLog((prev) => [...prev, { id, t }])
          }
        })
      },
      { rootMargin: "-45% 0px -45% 0px" }
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  return { active, log }
}

/* ============================================================
   MOTION PRIMITIVES
   ============================================================ */

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "110%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: DUR, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </div>
  )
}

function Rise({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: DUR, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const reduce = useReducedMotion()
  const mv = useMotionValue(0)
  const text = useTransform(mv, (v) =>
    to >= 1000 ? Math.round(v).toLocaleString() : Math.round(v).toString()
  )

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      mv.set(to)
      return
    }
    const controls = animate(mv, to, { duration: 1.5, ease: EASE })
    return controls.stop
  }, [inView, to, mv, reduce])

  return (
    <span ref={ref}>
      <motion.span>{text}</motion.span>
      {suffix}
    </span>
  )
}

function Section({ id, n, eyebrow, title, children }: { id: string; n: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 py-28 sm:py-40 border-t border-line">
      <Reveal>
        <p className="font-mono text-xs tracking-[0.14em] uppercase text-muted mb-5">
          <span className="text-hot">{n}</span> — {eyebrow}
        </p>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="font-display font-bold tracking-[-0.035em] leading-[0.95] text-[clamp(2.25rem,5.5vw,3.75rem)] mb-10">
          {title}
        </h2>
      </Reveal>
      {children}
    </section>
  )
}

/* ============================================================
   TRACE RAIL
   ============================================================ */

function TraceRail({ active, log }: { active: string; log: { id: string; t: string }[] }) {
  const idx = SECTIONS.findIndex((s) => s.id === active)

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 h-dvh w-60 flex-col justify-center px-8 border-r border-line/50 z-40">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="font-mono text-[0.65rem] tracking-[0.16em] uppercase text-muted mb-6"
        >
          run trace
        </motion.p>

        <nav className="flex flex-col">
          {SECTIONS.map((s, i) => {
            const isActive = s.id === active
            const done = i < idx
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.06, duration: 0.6, ease: EASE }}
                className="flex items-stretch gap-3"
              >
                <div className="flex flex-col items-center w-3">
                  <motion.span
                    animate={{ scale: isActive ? 1.35 : 1 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className={[
                      "w-2 h-2 rounded-full shrink-0 mt-3 transition-colors duration-500",
                      isActive ? "bg-hot" : done ? "bg-verified" : "bg-line",
                    ].join(" ")}
                  />
                  {i < SECTIONS.length - 1 && (
                    <span className="w-px flex-1 bg-line relative overflow-hidden">
                      <motion.span
                        className="absolute inset-0 bg-verified/50 origin-top"
                        animate={{ scaleY: done ? 1 : 0 }}
                        transition={{ duration: 0.5, ease: EASE }}
                      />
                    </span>
                  )}
                </div>
                <a
                  href={`#${s.id}`}
                  className={[
                    "font-mono text-xs py-2 transition-all duration-300 hover:text-ink hover:translate-x-0.5",
                    isActive ? "text-ink" : done ? "text-verified/70" : "text-muted",
                  ].join(" ")}
                >
                  {s.label}
                </a>
              </motion.div>
            )
          })}
        </nav>

        <div className="mt-8 pt-5 border-t border-line/50 font-mono text-[0.65rem] leading-relaxed text-muted h-24 overflow-hidden">
          {log.slice(-4).map((l) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="truncate"
            >
              [{l.t}] {l.id} <span className="text-verified">ok</span>
            </motion.div>
          ))}
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-ground/85 backdrop-blur-md border-b border-line">
        <div className="flex gap-1 px-4 pt-3">
          {SECTIONS.map((s, i) => (
            <span key={s.id} className="h-0.5 flex-1 rounded-full bg-line overflow-hidden">
              <motion.span
                className={`block h-full origin-left ${i === idx ? "bg-hot" : "bg-verified"}`}
                animate={{ scaleX: i <= idx ? 1 : 0 }}
                transition={{ duration: 0.5, ease: EASE }}
              />
            </span>
          ))}
        </div>
        <p className="font-mono text-[0.65rem] text-muted px-4 py-2">
          node={active} <span className="text-verified">ok</span>
        </p>
      </div>
    </>
  )
}

function StatBlock() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 border-t border-line pt-10">
      {STATS.map((s, i) => (
        <Rise key={s.label} delay={i * 0.08}>
          <p className="font-display font-extrabold tracking-[-0.04em] text-[clamp(2rem,5vw,3.25rem)] leading-none text-verified">
            <CountUp to={s.value} suffix={s.suffix} />
          </p>
          <p className="mt-3 font-mono text-xs text-ink/70">{s.label}</p>
          <p className="mt-1 font-mono text-[0.65rem] text-muted leading-relaxed">{s.sub}</p>
        </Rise>
      ))}
    </div>
  )
}

/* ============================================================
   NL2SQL EXPLORER
   ============================================================ */

function Nl2sqlExplorer() {
  const [tab, setTab] = useState<"results" | "arch" | "errors">("results")
  const tabs = [
    { k: "results", label: "results" },
    { k: "arch", label: "architecture" },
    { k: "errors", label: "error analysis" },
  ] as const

  return (
    <div className="mt-6 border border-line rounded-xl bg-surface/40 overflow-hidden">
      <div className="flex border-b border-line font-mono text-xs overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`relative px-5 py-3.5 whitespace-nowrap transition-colors duration-300 ${
              tab === t.k ? "text-ink" : "text-muted hover:text-ink/80"
            }`}
          >
            {t.label}
            {tab === t.k && (
              <motion.span
                layoutId="tab-underline"
                className="absolute inset-x-0 -bottom-px h-px bg-hot"
                transition={{ duration: 0.4, ease: EASE }}
              />
            )}
          </button>
        ))}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="p-5 sm:p-7"
      >
        {tab === "results" && (
          <div>
            <table className="w-full font-mono text-xs sm:text-sm">
              <thead>
                <tr className="text-muted text-left">
                  <th className="pb-3 font-normal">tier</th>
                  <th className="pb-3 font-normal text-right">n</th>
                  <th className="pb-3 font-normal text-right">correct</th>
                  <th className="pb-3 font-normal text-right">EX</th>
                </tr>
              </thead>
              <tbody>
                {RESULTS.map((r, i) => (
                  <tr key={r.tier} className={i === 0 ? "border-b border-line" : ""}>
                    <td className={`py-2.5 ${i === 0 ? "text-ink" : "text-muted"}`}>{r.tier}</td>
                    <td className="py-2.5 text-right text-muted">{r.n}</td>
                    <td className="py-2.5 text-right text-muted">{r.correct}</td>
                    <td className={`py-2.5 text-right ${i === 0 ? "text-verified" : "text-ink/80"}`}>
                      {r.ex}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-6 text-sm text-muted leading-relaxed">
              At <span className="text-verified font-mono">1.0</span> LLM calls per query. Human
              experts reach 92.96% EX on BIRD dev (Li et al., 2023); leading systems sit near 82%
              but get there through multi-step pipelines costing many calls per question.
            </p>
          </div>
        )}

        {tab === "arch" && (
          <div>
            <pre className="font-mono text-[0.7rem] sm:text-xs text-muted leading-relaxed overflow-x-auto mb-6">
{`question → schema_linker → sql_generator → executor → validator ─┬─→ answer
                                              ▲                  │
                                              └── self_corrector ◀┘`}
            </pre>
            <div className="space-y-2.5">
              {NODES.map((n, i) => (
                <motion.div
                  key={n.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: EASE }}
                  className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4"
                >
                  <code
                    className={`font-mono text-xs shrink-0 sm:w-40 ${
                      n.tier === "strong" ? "text-hot" : n.tier === "cheap" ? "text-verified" : "text-muted"
                    }`}
                  >
                    {n.name}
                  </code>
                  <span className="text-sm text-ink/75">{n.role}</span>
                </motion.div>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted leading-relaxed">
              Schema linking runs on the cheap model — feeding full DDL to the generator wastes
              tokens and hurts precision. All executed SQL is read-only, blocked at the driver
              level. The correction loop is bounded at 3 attempts.
            </p>
          </div>
        )}

        {tab === "errors" && (
          <div>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              Root-cause classification of all 178 failures via AST diff — zero API calls.
            </p>
            <div className="space-y-3">
              {TAXONOMY.map((t, i) => (
                <div key={t.cat}>
                  <div className="flex justify-between font-mono text-[0.7rem] mb-1.5">
                    <span className="text-ink/80">{t.cat}</span>
                    <span className="text-muted">{t.n} · {t.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-line/60 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: EASE, delay: i * 0.05 }}
                      style={{ width: `${(t.pct / 32.6) * 100}%`, originX: 0 }}
                      className="h-full rounded-full bg-hot"
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted leading-relaxed">
              Over half of all failures are projection or table-selection errors — the agent picks
              the wrong columns or tables, not the wrong logic. That points at schema linking as
              the highest-leverage component to improve.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

/* ============================================================
   PAGE
   ============================================================ */

export default function App() {
  const reduce = useReducedMotion()
  useLenis(!reduce)
  const { active, log } = useActiveSection()

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 90])

  return (
    <div className="bg-ground text-ink min-h-dvh selection:bg-verified/25">
      <TraceRail active={active} log={log} />

      <main className="lg:pl-60">
        <div className="max-w-3xl mx-auto px-6 sm:px-10">

          {/* HERO */}
          <section ref={heroRef} id="intake" className="min-h-dvh flex flex-col justify-center py-28">
            <motion.div style={reduce ? undefined : { opacity: heroOpacity, y: heroY }}>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="font-mono text-xs sm:text-sm text-muted tracking-wider mb-8 flex items-center gap-3"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-hot animate-pulse" />
                [00:00] node=intake status=running
              </motion.p>

              <h1 className="font-display font-extrabold leading-[0.86] tracking-[-0.04em] text-[clamp(3rem,11.5vw,7.25rem)]">
                <span className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={reduce ? undefined : { y: "110%" }}
                    animate={reduce ? undefined : { y: 0 }}
                    transition={{ duration: 1, ease: EASE, delay: 0.15 }}
                  >
                    PARAM
                  </motion.span>
                </span>
                <span className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={reduce ? undefined : { y: "110%" }}
                    animate={reduce ? undefined : { y: 0 }}
                    transition={{ duration: 1, ease: EASE, delay: 0.27 }}
                  >
                    JAIN
                  </motion.span>
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DUR, ease: EASE, delay: 0.55 }}
                className="mt-8 text-lg sm:text-xl leading-relaxed text-ink/85 max-w-xl"
              >
                I build systems that catch their own failures — release gates, streaming anomaly
                detection, and query verifiers that reject bad output before it ships.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DUR, ease: EASE, delay: 0.7 }}
                className="mt-12 pt-6 border-t border-line font-mono text-xs sm:text-sm text-muted flex flex-wrap gap-x-8 gap-y-3"
              >
                <span>MS CS · Northeastern</span>
                <span>Boston, MA</span>
                <span className="text-verified">open to co-ops</span>
              </motion.div>

              <motion.a
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: EASE, delay: 1 }}
                href="#about"
                className="mt-16 font-mono text-xs text-muted hover:text-ink transition-colors w-fit flex items-center gap-2 group"
              >
                <span className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-1">
                  ↓
                </span>
                continue trace
              </motion.a>
            </motion.div>
          </section>

          {/* ABOUT */}
          <Section id="about" n="01" eyebrow="about" title="What I build.">
            <Rise>
              <div className="space-y-5 text-base sm:text-lg leading-relaxed text-ink/80">
                <p>
                  I'm a Computer Science master's student who has shipped machine learning to
                  production for 30K+ monthly users at 97% uptime, built a distributed telemetry
                  pipeline sustaining 10,000+ events per second, and published peer-reviewed NLP
                  research.
                </p>
                <p>
                  The through-line across all of it is{" "}
                  <span className="text-ink">verification</span>. A release gate that blocks its
                  own deployment when accuracy drops. Anomaly detection that flags bad signal
                  instead of waiting for someone to read the logs. A verifier that rejects an
                  invalid query before it executes. Systems that check their own work are the ones
                  you can actually leave running.
                </p>
                <p>
                  I work in Python, C++, and TypeScript across scalable distributed systems,
                  production ML services, and release automation on Linux, grounded in data
                  structures and algorithms.
                </p>
              </div>
            </Rise>

            <Rise delay={0.1}>
              <dl className="mt-12 grid sm:grid-cols-2 gap-x-8 gap-y-6 font-mono text-sm">
                <div>
                  <dt className="text-muted text-xs mb-1.5">education</dt>
                  <dd className="text-ink/85">M.S. Computer Science</dd>
                  <dd className="text-muted text-xs mt-1">Northeastern University, Boston</dd>
                </div>
                <div>
                  <dt className="text-muted text-xs mb-1.5">previously</dt>
                  <dd className="text-ink/85">B.Tech Computer Science</dd>
                  <dd className="text-muted text-xs mt-1">Medi-Caps University, Indore</dd>
                </div>
              </dl>
            </Rise>

            <div className="mt-16 mb-16">
              <StatBlock />
            </div>

            <div className="space-y-5">
              {SKILLS.map((s, i) => (
                <Rise key={s.group} delay={i * 0.05}>
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-6 pb-5 border-b border-line/60">
                    <p className="font-mono text-xs text-hot shrink-0 sm:w-28 pt-0.5">{s.group}</p>
                    <p className="font-mono text-xs text-muted leading-relaxed">{s.items}</p>
                  </div>
                </Rise>
              ))}
            </div>
          </Section>

          {/* EXPERIENCE */}
          <Section id="experience" n="02" eyebrow="experience" title="Where the work shipped.">
            <div className="space-y-14">
              {EXPERIENCE.map((job, i) => (
                <Rise key={job.org} delay={i * 0.08}>
                  <div className="border-l border-line pl-6 relative group">
                    <span className="absolute -left-[3px] top-2 w-1.5 h-1.5 rounded-full bg-verified transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-150" />
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
                      <h3 className="font-display font-bold text-xl">{job.role}</h3>
                      <span className="font-mono text-xs text-muted shrink-0">{job.when}</span>
                    </div>
                    <p className="font-mono text-sm text-hot mb-4">{job.org}</p>
                    <ul className="space-y-3">
                      {job.bullets.map((b, j) => (
                        <li key={j} className="text-ink/75 leading-relaxed flex gap-3 text-[0.95rem]">
                          <span className="text-line mt-2 shrink-0">—</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Rise>
              ))}
            </div>
          </Section>

          {/* PROJECTS */}
          <Section id="projects" n="03" eyebrow="projects" title="Selected work.">
            <div className="space-y-16">
              {PROJECTS.map((p, i) => (
                <Rise key={p.id} delay={i * 0.08}>
                  <article>
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-1">
                      <h3 className="font-display font-bold text-2xl">{p.name}</h3>
                      <span className="font-mono text-xs text-muted shrink-0">{p.when}</span>
                    </div>
                    <p className="font-mono text-xs text-hot mb-5">{p.tag}</p>

                    <ul className="space-y-3 mb-5">
                      {p.bullets.map((b, j) => (
                        <li key={j} className="text-ink/75 leading-relaxed flex gap-3 text-[0.95rem]">
                          <span className="text-line mt-2 shrink-0">—</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap items-center gap-2 font-mono text-[0.7rem]">
                      {p.stack.map((s) => (
                        <span key={s} className="px-2.5 py-1 border border-line rounded text-muted">
                          {s}
                        </span>
                      ))}
                      {p.href && (
                        <a
                          href={p.href}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-auto text-muted hover:text-verified transition-colors"
                        >
                          view code ↗
                        </a>
                      )}
                    </div>

                    {p.expandable && <Nl2sqlExplorer />}
                  </article>
                </Rise>
              ))}
            </div>
          </Section>

          {/* PUBLICATIONS */}
          <Section id="publications" n="04" eyebrow="publications" title="Peer-reviewed.">
            <Rise>
              <div className="pb-6 border-b border-line">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                  <span className="font-mono text-xs text-muted shrink-0 sm:w-20">2024</span>
                  <div>
                    <p className="text-ink/85 leading-snug">
                      Enhancing Human-Robot Interaction through Advanced NLP
                    </p>
                    <p className="font-mono text-xs text-hot mt-1.5">IJSREM</p>
                    <p className="text-sm text-muted mt-3 leading-relaxed">
                      Integrated BERT and GPT-3 for real-time speech recognition and emotion
                      detection — 86.5% accuracy at sub-500ms latency.
                    </p>
                  </div>
                </div>
              </div>
            </Rise>

            <Rise delay={0.08}>
              <div className="mt-8">
                <p className="font-mono text-xs text-muted mb-3">certifications</p>
                <p className="text-ink/75 text-[0.95rem] leading-relaxed">
                  AWS Academy — Cloud Foundations, Data Engineering, and Generative AI Foundations
                  (2026)
                </p>
              </div>
            </Rise>
          </Section>

          {/* CONTACT */}
          <Section id="contact" n="05" eyebrow="contact" title="Open to co-ops.">
            <Rise>
              <p className="text-lg text-ink/80 leading-relaxed max-w-xl mb-10">
                Looking for SDE and ML/AI internship and co-op roles. US work authorized, no
                sponsorship required.
              </p>
            </Rise>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "email", value: "jain.param@northeastern.edu", href: "mailto:jain.param@northeastern.edu" },
                { label: "linkedin", value: "in/paramsachinjain", href: "https://www.linkedin.com/in/paramsachinjain/" },
                { label: "github", value: "paramjain13", href: "https://github.com/paramjain13" },
                { label: "resume", value: "download PDF", href: "/param-jain-resume.pdf" },
              ].map((c, i) => (
                <Rise key={c.label} delay={i * 0.06}>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group block border border-line rounded-xl p-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-verified/50 hover:-translate-y-1 hover:bg-surface/40"
                  >
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted mb-2">
                      {c.label}
                    </p>
                    <p className="text-ink/85 group-hover:text-verified transition-colors duration-300 break-all">
                      {c.value}
                    </p>
                  </a>
                </Rise>
              ))}
            </div>

            <Rise delay={0.2}>
              <p className="mt-24 pb-20 font-mono text-xs text-muted">
                [end of trace] status=<span className="text-verified">complete</span> · Boston, MA
              </p>
            </Rise>
          </Section>

        </div>
      </main>
    </div>
  )
}
