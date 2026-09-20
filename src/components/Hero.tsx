import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { scrollToTarget, prefersReducedMotion } from '@/lib/scroll'
import MagneticButton from '@/components/MagneticButton'

const ParticleField = lazy(() => import('@/components/ParticleField'))

gsap.registerPlugin(ScrollTrigger, useGSAP)

const EMAIL = 'jain.param@northeastern.edu'
const STATS = ['64.4% BIRD-SQL', '10K+ EVENTS/SEC', '30K+ MONTHLY USERS', '97% UPTIME']

function MaskedLine({ text, caret }: { text: string; caret?: boolean }) {
  return (
    <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
      {text.split('').map((ch, i) => (
        <span key={i} className="hero-char inline-block will-change-transform">
          {ch}
        </span>
      ))}
      {caret && (
        <span className="hero-caret caret-blink ml-2 inline-block text-volt will-change-transform">_</span>
      )}
    </span>
  )
}

interface HeroProps {
  /** True once the loader curtains begin to exit · hero reveal starts mid-exit. */
  revealed: boolean
}

export default function Hero({ revealed }: HeroProps) {
  const [fieldActive, setFieldActive] = useState(true)
  const [copied, setCopied] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const fieldScaleRef = useRef<HTMLDivElement>(null)
  const reduced = prefersReducedMotion()

  // Pause the particle field when the hero leaves the viewport.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setFieldActive(entry.isIntersecting), {
      threshold: 0,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Pre-hide reveal targets before the curtain clears.
  useGSAP(
    () => {
      if (reduced) return
      gsap.set('.hero-char', { yPercent: 110 })
      gsap.set('.hero-caret', { scale: 0 })
      gsap.set(['.hero-eyebrow', '.hero-scroll-hint'], { opacity: 0 })
      gsap.set('.hero-sub', { opacity: 0, y: 24 })
      gsap.set(['.hero-cta', '.hero-stats'], { opacity: 0, y: 16 })
    },
    { scope: sectionRef },
  )

  // Intro reveal timeline (starts 0.55s into the curtain exit so the hero
  // begins its reveal 0.15s before the curtains fully clear).
  useGSAP(
    () => {
      if (!revealed || reduced) return
      const tl = gsap.timeline({ delay: 0.55 })
      tl.to('.hero-eyebrow', { opacity: 1, duration: 0.4, ease: 'power2.out' })
        .to(
          '.hero-char',
          { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.035 },
          '-=0.1',
        )
        .to('.hero-caret', { scale: 1, duration: 0.5, ease: 'back.out(2.5)' }, '-=0.2')
        .to('.hero-sub', { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, '-=0.4')
        .to('.hero-cta', { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.1 }, '-=0.3')
        .to('.hero-stats', { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, '-=0.2')
        .to('.hero-scroll-hint', { opacity: 1, duration: 0.5 }, '<')
    },
    { scope: sectionRef, dependencies: [revealed] },
  )

  // Scroll: content parallaxes up at 0.85x and fades to 0.2; field scales 1 -> 1.08.
  useGSAP(
    () => {
      if (reduced) return
      gsap.to(contentRef.current, {
        yPercent: -15,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '60% top',
          scrub: true,
        },
      })
      if (fieldScaleRef.current) {
        gsap.fromTo(
          fieldScaleRef.current,
          { scale: 1 },
          {
            scale: 1.08,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      }
    },
    { scope: sectionRef },
  )

  const copyEmail = () => {
    navigator.clipboard?.writeText(EMAIL).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative -mt-16 flex min-h-[100dvh] flex-col overflow-hidden"
    >
      {/* Layer 0: particle field + CSS fallback glows */}
      <div className="absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(600px 400px at 30% 40%, rgba(34,211,238,0.05), transparent 70%), radial-gradient(700px 500px at 70% 60%, rgba(34,211,238,0.04), transparent 70%)',
          }}
        />
        <Suspense fallback={null}>
          <ParticleField active={fieldActive} animate={!reduced} scaleRef={fieldScaleRef} />
        </Suspense>
      </div>

      {/* Layer 1: content */}
      <div
        ref={contentRef}
        className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center px-[clamp(20px,5vw,80px)] pt-16"
      >
        <p className="hero-eyebrow mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-volt">
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-volt opacity-60" style={{ animationDuration: '2s' }} />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-volt" />
            </span>
            {'// AI/ML ENGINEER · BOSTON, MA'}
          </span>
          <span className="text-muted">OPEN TO OPPORTUNITIES (CPT-AUTHORIZED)</span>
        </p>

        <h1
          className="font-display font-bold uppercase leading-[0.95] tracking-[-0.03em] text-ink"
          style={{ fontSize: 'clamp(3.5rem, 12vw, 11rem)' }}
        >
          <MaskedLine text="PARAM" />
          <MaskedLine text="JAIN" caret />
        </h1>

        <p className="hero-sub mt-8 max-w-[520px] text-base leading-[1.65] text-muted md:text-lg">
          I build ML systems that catch their own failures · self-correcting agents, anomaly
          detectors, and pipelines measured by what they prevent, not just what they demo.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <div className="hero-cta">
            <MagneticButton variant="primary" onClick={() => scrollToTarget('#projects')}>
              VIEW PROJECTS <span className="text-bg">↓</span>
            </MagneticButton>
          </div>
          <div className="hero-cta relative">
            <MagneticButton variant="ghost" onClick={copyEmail} ariaLabel="Copy email address">
              {EMAIL} <span className="text-volt">↗</span>
            </MagneticButton>
            <span
              className={`pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border border-line bg-surface px-2 py-1 font-mono text-[10px] tracking-[0.08em] text-volt transition-opacity duration-200 ${
                copied ? 'opacity-100' : 'opacity-0'
              }`}
              role="status"
            >
              COPIED ✓
            </span>
          </div>
        </div>
      </div>

      {/* Right edge: vertical SCROLL hint (desktop) */}
      <div
        className="hero-scroll-hint absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 items-center gap-3 lg:flex"
        aria-hidden
      >
        <span
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted"
          style={{ writingMode: 'vertical-rl' }}
        >
          SCROLL
        </span>
        <span className="relative h-16 w-px overflow-hidden bg-line">
          <span className="scroll-line absolute left-0 top-0 h-1/2 w-full bg-volt" />
        </span>
      </div>

      {/* Layer 2: bottom stat strip */}
      <div className="hero-stats relative z-10 mx-auto w-full max-w-[1280px] px-[clamp(20px,5vw,80px)] pb-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
          {STATS.map((s, i) => (
            <span key={s}>
              {i > 0 && <span className="mx-3 text-volt">·</span>}
              <span className="tabular-nums">{s}</span>
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
