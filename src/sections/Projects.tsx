import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import SectionEyebrow from '@/components/SectionEyebrow'
import ProjectCard from '@/sections/projects/ProjectCard'
import { prefersReducedMotion } from '@/lib/scroll'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const H2_WORDS = ['Built', 'to', 'be', 'measured.']

const BENCH_ROWS = [
  { split: 'OVERALL', n: '500', correct: '322', acc: '64.4' },
  { split: 'SIMPLE', n: '148', correct: '112', acc: '75.7' },
  { split: 'MODERATE', n: '250', correct: '154', acc: '61.6' },
  { split: 'CHALLENGING', n: '102', correct: '56', acc: '54.9' },
]

const GRID_PROJECTS = [
  {
    cover: '/project-research-agent.png',
    title: 'Multi-Agent Research Assistant',
    tags: ['LANGGRAPH', 'GPT-4', 'PINECONE', 'AIRFLOW'],
    description:
      'Three cooperating agents over vector search, SQL, and web; Airflow ingests 500+ docs across 3 chunking strategies; per-agent eval harness.',
    stat: '90%+',
    statLabel: 'RETRIEVAL ACCURACY',
    date: 'JAN–MAY 2026',
    repoUrl: 'https://github.com/paramjain13',
  },
  {
    cover: '/project-fleet.png',
    title: 'Fleet Telemetry Platform',
    tags: ['KAFKA', 'POSTGRESQL', 'GRAFANA', 'LINUX'],
    description:
      '1,000+ simulated vehicles streaming through Kafka into PostgreSQL with 3-sigma anomaly detection and live Grafana dashboards.',
    stat: '10,000+',
    statLabel: 'EVENTS / SEC',
    date: 'JAN–MAR 2026',
    repoUrl: 'https://github.com/paramjain13',
  },
  {
    cover: '/project-navsim.png',
    title: 'Navigation Validation Simulator',
    tags: ['C++', 'DOCKER', 'GITHUB ACTIONS', 'LINUX'],
    description:
      'Release-gate simulator enforcing a 98% accuracy threshold; reproducible Docker sweeps; failure-log root-cause clustering.',
    stat: '98%',
    statLabel: 'RELEASE GATE',
    date: 'AUG 2026–PRESENT',
    repoUrl: 'https://github.com/paramjain13',
  },
  {
    cover: '/project-skillmatch.png',
    title: 'SkillMatchAI',
    tags: ['REACT', 'NEXT.JS', 'TYPESCRIPT', 'OPENAI', 'PINECONE'],
    description:
      'Full-stack skill-matching over 10K+ records with OpenAI embeddings + Pinecone retrieval; Selenium + Airflow ingestion.',
    stat: '85%+',
    statLabel: 'MATCH RELEVANCE',
    date: 'OCT–DEC 2025',
    repoUrl: 'https://github.com/paramjain13',
  },
]

export default function Projects() {
  const rootRef = useRef<HTMLElement>(null)
  const featRef = useRef<HTMLDivElement>(null)
  const ghostRef = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !rootRef.current) return

      // H2 word-level mask reveal + sub-note (y-32 fade).
      gsap.fromTo(
        '.proj-h2-word',
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.05,
          scrollTrigger: { trigger: '.proj-h2', start: 'top 80%', once: true },
        },
      )
      gsap.fromTo(
        '.proj-note',
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'expo.out',
          delay: 0.2,
          scrollTrigger: { trigger: '.proj-h2', start: 'top 80%', once: true },
        },
      )

      // Accuracy count-up: 300ms random-digit flicker, then expo-out count (~1.2s total).
      const runCounts = () => {
        rootRef.current
          ?.querySelectorAll<HTMLElement>('[data-count]')
          .forEach((el, i) => {
            const raw = el.dataset.count ?? '0'
            const target = parseFloat(raw)
            const decimals = raw.includes('.') ? raw.split('.')[1].length : 0
            const flick = window.setInterval(() => {
              el.textContent = `${(Math.random() * 100).toFixed(decimals)}%`
            }, 40)
            gsap.delayedCall(0.3 + i * 0.06, () => {
              window.clearInterval(flick)
              const obj = { v: 0 }
              gsap.to(obj, {
                v: target,
                duration: 0.9,
                ease: 'expo.out',
                onUpdate: () => {
                  el.textContent = `${obj.v.toFixed(decimals)}%`
                },
              })
            })
          })
      }

      // Featured card: clip-path reveal left→right (1s), benchmark rows stagger 0.08s.
      const tl = gsap.timeline({
        scrollTrigger: { trigger: featRef.current, start: 'top 75%', once: true },
      })
      tl.fromTo(
        featRef.current,
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'expo.out' },
      )
        .fromTo(
          '.bench-row',
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out', stagger: 0.08 },
          '-=0.45',
        )
        .add(runCounts, '-=0.35')

      // Grid cards: y-56 + fade, stagger 0.12s.
      gsap.fromTo(
        '.proj-grid-card',
        { y: 56, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.12,
          scrollTrigger: { trigger: '.proj-grid', start: 'top 85%', once: true },
        },
      )

      // Ghost heading parallax (0.9x scroll speed feel).
      gsap.fromTo(
        ghostRef.current,
        { y: 80 },
        {
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      )
    },
    { scope: rootRef },
  )

  return (
    <section
      id="projects"
      ref={rootRef}
      className="relative mx-auto max-w-[1280px] px-[clamp(20px,5vw,80px)] py-[clamp(96px,14vh,180px)]"
    >
      <SectionEyebrow index="04" label="PROJECTS" />

      <div className="mt-12">
        <h2 className="proj-h2 font-display text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink">
          {H2_WORDS.map((w) => (
            <span key={w} className="inline-block overflow-hidden pb-1 align-bottom">
              <span className="proj-h2-word inline-block will-change-transform">{w}&nbsp;</span>
            </span>
          ))}
        </h2>
        <p className="proj-note mt-4 max-w-[640px] font-mono text-[11px] uppercase leading-relaxed tracking-[0.08em] text-muted">
          METRICS &gt; SCREENSHOTS. EVERY NUMBER BELOW IS FROM A BENCHMARK, DASHBOARD, OR RELEASE LOG.
        </p>
      </div>

      {/* ── Featured: NL2SQL Agent ─────────────────────────────── */}
      <div
        ref={featRef}
        className="group relative mt-16 grid overflow-hidden rounded-lg border border-line bg-surface transition-colors duration-300 hover:border-volt/60 lg:grid-cols-12"
      >
        <span aria-hidden className="pointer-events-none absolute left-2 top-2 z-10 font-mono text-xs text-muted">+</span>
        <span aria-hidden className="pointer-events-none absolute right-2 top-2 z-10 font-mono text-xs text-muted">+</span>

        {/* Cover · 7 cols */}
        <a
          href="https://github.com/paramjain13/nl2sql-agent"
          target="_blank"
          rel="noreferrer noopener"
          data-cursor="media"
          data-cursor-label="REPO ↗"
          aria-label="NL2SQL Agent · GitHub repository"
          className="relative block aspect-[3/2] overflow-hidden border-b border-line lg:col-span-7 lg:aspect-auto lg:border-b-0 lg:border-r"
        >
          <img
            src="/project-nl2sql.png"
            alt="NL2SQL Agent cover art · glowing SQL query tree"
            loading="lazy"
            className="h-full w-full object-cover grayscale-[45%] transition-all duration-500 ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-1/3 -translate-y-[150%] bg-gradient-to-b from-transparent via-volt/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-y-[350%]"
          />
        </a>

        {/* Content · 5 cols */}
        <div className="flex flex-col gap-5 p-6 md:p-8 lg:col-span-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-volt">
              LANGGRAPH · CLAUDE API · SQLGLOT · PYTHON
            </p>
            <p className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.08em] text-muted/70">
              NOV–DEC 2025
            </p>
          </div>
          <h3 className="font-display text-[2rem] font-semibold leading-tight tracking-[-0.01em] text-ink">
            NL2SQL Agent
          </h3>
          <p className="text-sm leading-relaxed text-muted">
            Self-correcting text-to-SQL agent. Schema linking, cost-aware model tiering, and a
            sqlglot AST verifier that traverses the foreign-key graph · catching its own bad
            queries before execution. One LLM call per question.
          </p>

          {/* Benchmark mini-table */}
          <div className="font-mono text-[11px] uppercase tracking-[0.08em]" role="table" aria-label="BIRD-SQL benchmark results">
            <div className="grid grid-cols-4 gap-2 border-b border-line pb-2 text-muted" role="row">
              <span role="columnheader">SPLIT</span>
              <span role="columnheader" className="text-right">N</span>
              <span role="columnheader" className="text-right">CORRECT</span>
              <span role="columnheader" className="text-right">ACC</span>
            </div>
            {BENCH_ROWS.map((r) => (
              <div
                key={r.split}
                role="row"
                className={`bench-row grid grid-cols-4 gap-2 border-b border-line py-2 ${
                  r.split === 'OVERALL' ? 'border-l-2 border-l-volt pl-2 text-volt' : 'text-ink'
                }`}
              >
                <span role="cell">{r.split}</span>
                <span role="cell" className="text-right tabular-nums">{r.n}</span>
                <span role="cell" className="text-right tabular-nums">{r.correct}</span>
                <span role="cell" data-count={r.acc} className="text-right tabular-nums text-volt">
                  {r.acc}%
                </span>
              </div>
            ))}
          </div>

          {/* Big stat */}
          <div className="mt-auto flex items-end justify-between gap-4 border-t border-line pt-5">
            <p className="font-mono text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-none tabular-nums text-volt">
              <span data-count="64.4">64.4%</span>
            </p>
            <p className="max-w-[200px] text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.08em] text-muted">
              EXECUTION ACCURACY ON BIRD-SQL VS A <span className="text-volt">1M+</span> ROW DATABASE
            </p>
          </div>
        </div>
      </div>

      {/* ── Grid of 4 ──────────────────────────────────────────── */}
      <div className="relative mt-16">
        <span
          ref={ghostRef}
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 select-none whitespace-nowrap font-display font-bold uppercase leading-none text-surface-2"
          style={{ fontSize: '18vw' }}
        >
          PROJECTS
        </span>
        <div className="proj-grid relative grid grid-cols-1 gap-6 md:grid-cols-2">
          {GRID_PROJECTS.map((p) => (
            <ProjectCard key={p.title} {...p} />
          ))}
        </div>
      </div>
    </section>
  )
}
