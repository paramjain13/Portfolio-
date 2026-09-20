import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import SectionEyebrow from '@/components/SectionEyebrow'
import { prefersReducedMotion } from '@/lib/scroll'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const CERTS = [
  { title: 'AWS ACADEMY · CLOUD FOUNDATIONS', year: '2026' },
  { title: 'AWS ACADEMY · DATA ENGINEERING', year: '2026' },
  { title: 'AWS ACADEMY · GENERATIVE AI FOUNDATIONS', year: '2026' },
]

export default function Publications() {
  const rootRef = useRef<HTMLElement>(null)
  const pubRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !rootRef.current) return

      // Publication card: clip-reveal bottom→top (0.9s, top 80%).
      gsap.fromTo(
        pubRef.current,
        { clipPath: 'inset(100% 0 0 0)' },
        {
          clipPath: 'inset(0% 0 0 0)',
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: { trigger: pubRef.current, start: 'top 80%', once: true },
        },
      )

      // Stat chips: spring pop (scale 0.8 → 1, stagger 0.1s).
      gsap.fromTo(
        '.pub-chip',
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'back.out(2)',
          stagger: 0.1,
          scrollTrigger: { trigger: pubRef.current, start: 'top 75%', once: true },
        },
      )

      // Cert cards: slide in from right (x 40 → 0, stagger 0.12s).
      gsap.fromTo(
        '.cert-card',
        { x: 40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'expo.out',
          stagger: 0.12,
          scrollTrigger: { trigger: '.cert-stack', start: 'top 80%', once: true },
        },
      )
    },
    { scope: rootRef },
  )

  return (
    <section
      id="writing"
      ref={rootRef}
      className="mx-auto max-w-[1280px] px-[clamp(20px,5vw,80px)] py-[clamp(96px,14vh,180px)]"
    >
      <SectionEyebrow index="05" label="PUBLICATIONS & CERTS" />

      <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* ── Left: featured publication (7 cols) ─────────────── */}
        <div
          ref={pubRef}
          className="group relative overflow-hidden rounded-lg border border-line bg-surface transition-colors duration-300 hover:border-volt/60 lg:col-span-7"
        >
          <span aria-hidden className="pointer-events-none absolute left-2 top-2 z-10 font-mono text-xs text-muted">+</span>
          <span aria-hidden className="pointer-events-none absolute right-2 top-2 z-10 font-mono text-xs text-muted">+</span>

          <div
            className="relative aspect-[3/2] overflow-hidden border-b border-line"
            data-cursor="media"
            data-cursor-label="VIEW"
          >
            <img
              src="/pub-paper.png"
              alt="Publication thumbnail · robotic arm exchanging a speech waveform with a human outline"
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
            {/* scan-line sweep on hover */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-1/3 -translate-y-[150%] bg-gradient-to-b from-transparent via-volt/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-y-[350%]"
            />
          </div>

          <div className="flex flex-col gap-4 p-6 md:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-volt">
              PEER-REVIEWED · IJSREM 2024
            </p>
            <h3 className="font-display text-2xl font-semibold leading-snug tracking-[-0.01em] text-ink">
              Enhancing Human-Robot Interaction through Advanced NLP.
            </h3>
            <p className="text-sm leading-relaxed text-muted">
              BERT + GPT-3 pipeline for intent recognition in collaborative robotics · robots that
              understand what you meant, not just what you said.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <span className="pub-chip inline-flex items-center gap-2 rounded-full border border-volt/40 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em]">
                <span className="font-bold tabular-nums text-volt">86.5%</span>
                <span className="text-muted">INTENT ACCURACY</span>
              </span>
              <span className="pub-chip inline-flex items-center gap-2 rounded-full border border-volt/40 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em]">
                <span className="font-bold tabular-nums text-volt">&lt;500ms</span>
                <span className="text-muted">LATENCY</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── Right: certifications stack (5 cols) ────────────── */}
        <div className="cert-stack flex flex-col gap-4 lg:col-span-5">
          {CERTS.map((c) => (
            <div
              key={c.title}
              className="cert-card group flex items-center justify-between gap-4 rounded-lg border border-line border-l-2 border-l-volt bg-surface px-6 py-5 transition-all duration-300 hover:translate-x-1 hover:border-volt"
            >
              <div>
                <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-ink">
                  {c.title}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                  {c.year}
                </p>
              </div>
              <a
                href="https://awsacademy.instructure.com/"
                target="_blank"
                rel="noreferrer noopener"
                data-cursor="link"
                aria-label={`Verify ${c.title}`}
                className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.08em] text-muted transition-colors duration-200 hover:text-volt"
              >
                VERIFY <span className="text-volt">↗</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
