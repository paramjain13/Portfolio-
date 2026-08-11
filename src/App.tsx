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
   MOTION TOKENS — one easing curve everywhere.
   This single choice does more for perceived polish than any
   individual animation. Expo-out: fast start, long soft settle.
   ============================================================ */

const EASE = [0.16, 1, 0.3, 1] as const
const DUR = 0.8

/* ============================================================
   DATA — every number verified against the repo.
   Sources: predictions_baseline_mini.json, eval/error_taxonomy.md,
   config.py, agent/graph.py, agent/db.py
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
  { value: 64.4, suffix: "%", label: "execution accuracy", sub: "BIRD-SQL Mini-Dev, 500 questions" },
  { value: 1.0, suffix: "", label: "LLM calls per query", sub: "leading systems use dozens" },
  { value: 178, suffix: "", label: "failures classified", sub: "root-caused by AST diff" },
  { value: 2, suffix: "", label: "publications", sub: "peer-reviewed" },
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

const PROJECTS = [
  {
    id: "nl2sql",
    name: "nl2sql-agent",
    tag: "Self-correcting text-to-SQL",
    stack: ["LangGraph", "Claude API", "sqlglot", "SQLite"],
    href: "https://github.com/paramjain13/nl2sql-agent",
    blurb:
      "An agent that generates SQL, executes it, and repairs itself from execution errors. Benchmarked on BIRD-SQL Mini-Dev. The target isn't leaderboard SOTA — it's strong accuracy at minimal LLM calls, plus an ablation isolating which components earn their cost.",
    expandable: true,
  },
  {
    id: "analyzer",
    name: "ai-content-analyzer-pro",
    tag: "Multi-document RAG",
    stack: ["Python", "RAG", "GPT-4", "Gemini"],
    href: "https://github.com/paramjain13/ai-content-analyzer-pro",
    blurb:
      "Retrieval pipeline over a vector store for analyzing document collections, with a model-agnostic backend running against both GPT-4 and Gemini.",
    expandable: false,
  },
  {
    id: "elara",
    name: "ELARA",
    tag: "TODO — fill in",
    stack: ["TODO"],
    href: "https://github.com/paramjain13/elara-speech-enhancement",
    blurb: "TODO — one or two sentences: what it does and the interesting technical decision.",
    expandable: false,
  },
]

/* ============================================================
   SMOOTH SCROLL — the single biggest polish lever.
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

/* ============================================================
   HOOKS
   ============================================================ */

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

/** Masked reveal — content slides up from behind a clipping edge.
 *  Used consistently for every entrance so the page has one voice. */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
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

/** Softer fade+rise for body copy and blocks. */
function Rise({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
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

/** Count-up. Earned here — the numbers are the argument. */
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const reduce = useReducedMotion()
  const mv = useMotionValue(0)
  const decimals = to % 1 !== 0 ? 1 : 0
  const text = useTransform(mv, (v) => v.toFixed(decimals))

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      mv.set(to)
      return
    }
    const controls = animate(mv, to, { duration: 1.4, ease: EASE })
    return controls.stop
  }, [inView, to, mv, reduce])

  return (
    <span ref={ref}>
      <motion.span>{text}</motion.span>
      {suffix}
    </span>
  )
}

/** Link with a wiping underline on hover. */
function HoverLink({
  href,
  children,
  className = "",
  external = false,
}: {
  href: string
  children: React.ReactNode
  className?: string
  external?: boolean
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={`group relative inline-block ${className}`}
    >
      {children}
      <span className="absolute left-0 -bottom-0.5 h-px w-full origin-right scale-x-0 bg-verified transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:origin-left group-hover:scale-x-100" />
    </a>
  )
}

/* ============================================================
   LAYOUT PRIMITIVES
   ============================================================ */

function Section({
  id,
  n,
  eyebrow,
  title,
  children,
}: {
  id: string
  n: string
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
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

/* ============================================================
   STAT BLOCK
   ============================================================ */

function StatBlock() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 border-t border-line pt-10">
      {STATS.map((s, i) => (
        <Rise key={s.label} delay={i * 0.08}>
          <p className="font-display font-extrabold tracking-[-0.04em] text-[clamp(2.5rem,6vw,3.75rem)] leading-none text-verified">
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
    <div className="mt-8 border border-line rounded-xl bg-surface/40 overflow-hidden">
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
              At <span className="text-verified font-mono">1.0</span> LLM calls per query. For
              scale: human experts reach 92.96% EX on BIRD dev (Li et al., 2023), and current
              leading systems sit near 82% — but reach it through elaborate multi-step pipelines
              costing many calls per question. The interesting axis is the other one.
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
                      n.tier === "strong"
                        ? "text-hot"
                        : n.tier === "cheap"
                        ? "text-verified"
                        : "text-muted"
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
              level. The correction loop is bounded at 3 attempts, because unbounded retry is how
              text-to-SQL agents quietly burn 40 calls on a question they'll never get right.
            </p>
          </div>
        )}

        {tab === "errors" && (
          <div>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              Root-cause classification of all 178 failures, via AST diff — zero API calls.
              Knowing <em>where</em> accuracy leaks is what makes the ablation worth running.
            </p>
            <div className="space-y-3">
              {TAXONOMY.map((t, i) => (
                <div key={t.cat}>
                  <div className="flex justify-between font-mono text-[0.7rem] mb-1.5">
                    <span className="text-ink/80">{t.cat}</span>
                    <span className="text-muted">
                      {t.n} · {t.pct}%
                    </span>
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
              the wrong columns or the wrong tables, not the wrong logic. That points squarely at
              schema linking as the highest-leverage component to ablate first.
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
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 90])

  return (
    <div className="bg-ground text-ink min-h-dvh selection:bg-verified/25">
      <TraceRail active={active} log={log} />

      <main className="lg:pl-60">
        <div className="max-w-3xl mx-auto px-6 sm:px-10">

          {/* HERO — one orchestrated sequence */}
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
                I build LLM agents that plan, execute, and correct themselves — and the evaluation
                harnesses that prove whether they actually work.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DUR, ease: EASE, delay: 0.7 }}
                className="mt-12 pt-6 border-t border-line font-mono text-xs sm:text-sm text-muted flex flex-wrap gap-x-8 gap-y-3"
              >
                <span>MS CS · Northeastern · Dec 2027</span>
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
                  I work on agentic systems — LLM agents that decompose tasks, call tools, and
                  repair their own failures. Most of my attention goes to the unglamorous half of
                  that problem: <span className="text-ink">evaluation</span>. Measuring which
                  components of an agent graph actually earn their latency and token cost, and
                  which are decoration.
                </p>
                <p>
                  Before that, production ML — a fraud-detection pipeline on AWS — and systems work
                  in Rust. The through-line is a preference for things you can measure over things
                  that merely demo well.
                </p>
              </div>
            </Rise>

            <Rise delay={0.1}>
              <dl className="mt-12 grid sm:grid-cols-2 gap-x-8 gap-y-6 font-mono text-sm">
                <div>
                  <dt className="text-muted text-xs mb-1.5">education</dt>
                  <dd className="text-ink/85">M.S. Computer Science (AI/ML)</dd>
                  <dd className="text-muted text-xs mt-1">Northeastern University · Dec 2027</dd>
                </div>
                <div>
                  <dt className="text-muted text-xs mb-1.5">previously</dt>
                  <dd className="text-ink/85">B.Tech Computer Science</dd>
                  <dd className="text-muted text-xs mt-1">Medi-Caps University, Indore</dd>
                </div>
              </dl>
            </Rise>

            <Rise delay={0.15}>
              <div className="mt-10 mb-16 flex flex-wrap gap-2 font-mono text-xs">
                {["Python", "Rust", "LangGraph", "RAG", "PyTorch", "AWS", "Docker", "FastAPI"].map(
                  (t) => (
                    <span
                      key={t}
                      className="px-3 py-1.5 border border-line rounded-full text-muted transition-colors duration-300 hover:border-verified/50 hover:text-ink"
                    >
                      {t}
                    </span>
                  )
                )}
              </div>
            </Rise>

            <StatBlock />
          </Section>

          {/* EXPERIENCE */}
          <Section id="experience" n="02" eyebrow="experience" title="Where the work shipped.">
            <div className="space-y-12">
              {[
                {
                  role: "ML Engineering Intern",
                  org: "Genesis Technologies",
                  when: "TODO — period",
                  bullets: [
                    "TODO — fraud-detection pipeline: model/approach, and a metric (precision, recall, or AUC)",
                    "TODO — production deployment on AWS: which services, and a scale number (transactions/day, latency)",
                  ],
                },
                {
                  role: "AI Engineering Intern",
                  org: "DevQAExpert",
                  when: "TODO — period",
                  bullets: [
                    "TODO — CI/CD automation: what you automated and time saved (build time cut from X to Y)",
                    "TODO — ML classifier: task, and accuracy or throughput number",
                  ],
                },
              ].map((job, i) => (
                <Rise key={job.org} delay={i * 0.1}>
                  <div className="border-l border-line pl-6 relative group">
                    <span className="absolute -left-[3px] top-2 w-1.5 h-1.5 rounded-full bg-verified transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-150" />
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-3">
                      <h3 className="font-display font-bold text-xl">{job.role}</h3>
                      <span className="font-mono text-xs text-muted">{job.when}</span>
                    </div>
                    <p className="font-mono text-sm text-hot mb-4">{job.org}</p>
                    <ul className="space-y-2.5">
                      {job.bullets.map((b, j) => (
                        <li key={j} className="text-ink/75 leading-relaxed flex gap-3">
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
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-3">
                      <h3 className="font-display font-bold text-2xl">{p.name}</h3>
                      <HoverLink
                        href={p.href}
                        external
                        className="font-mono text-xs text-muted hover:text-verified transition-colors"
                      >
                        view code ↗
                      </HoverLink>
                    </div>
                    <p className="font-mono text-xs text-hot mb-4">{p.tag}</p>
                    <p className="text-ink/75 leading-relaxed max-w-2xl">{p.blurb}</p>
                    <div className="mt-4 flex flex-wrap gap-2 font-mono text-[0.7rem]">
                      {p.stack.map((s) => (
                        <span key={s} className="px-2.5 py-1 border border-line rounded text-muted">
                          {s}
                        </span>
                      ))}
                    </div>
                    {p.expandable && <Nl2sqlExplorer />}
                  </article>
                </Rise>
              ))}
            </div>
          </Section>

          {/* PUBLICATIONS */}
          <Section id="publications" n="04" eyebrow="publications" title="Peer-reviewed.">
            <div className="space-y-6">
              {[
                { title: "TODO — paper title", venue: "GIJET", year: "TODO" },
                { title: "TODO — paper title", venue: "IJSREM", year: "TODO" },
              ].map((pub, i) => (
                <Rise key={i} delay={i * 0.08}>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 pb-6 border-b border-line">
                    <span className="font-mono text-xs text-muted shrink-0 sm:w-20">{pub.year}</span>
                    <div>
                      <p className="text-ink/85 leading-snug">{pub.title}</p>
                      <p className="font-mono text-xs text-hot mt-1.5">{pub.venue}</p>
                    </div>
                  </div>
                </Rise>
              ))}
            </div>
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
                { label: "email", value: "TODO — your email", href: "mailto:TODO" },
                {
                  label: "linkedin",
                  value: "in/paramsachinjain",
                  href: "https://www.linkedin.com/in/paramsachinjain/",
                },
                { label: "github", value: "paramjain13", href: "https://github.com/paramjain13" },
                { label: "resume", value: "download PDF", href: "TODO — resume link" },
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
                    <p className="text-ink/85 group-hover:text-verified transition-colors duration-300">
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
