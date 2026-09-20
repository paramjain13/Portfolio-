import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { AnimatePresence, motion } from 'framer-motion'
import SectionEyebrow from '@/components/SectionEyebrow'
import MagneticButton from '@/components/MagneticButton'
import { prefersReducedMotion } from '@/lib/scroll'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const EMAIL = 'jain.param@northeastern.edu'

// word, volt-highlighted (italic) phrase at the end
const H2_WORDS: Array<{ w: string; volt: boolean }> = [
  { w: "Let's", volt: false },
  { w: 'build', volt: false },
  { w: 'something', volt: false },
  { w: 'that', volt: false },
  { w: 'catches', volt: true },
  { w: 'its', volt: true },
  { w: 'own', volt: true },
  { w: 'failures.', volt: true },
]

interface BurstParticle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

export default function Contact() {
  const rootRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const burstRef = useRef<() => void>(() => {})
  const [copied, setCopied] = useState(false)

  // One-shot volt particle burst (~120 particles, ~1.5s, then dissipates).
  burstRef.current = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const cx = rect.width / 2
    const cy = rect.height * 0.35
    const particles: BurstParticle[] = Array.from({ length: 120 }, () => {
      const a = Math.random() * Math.PI * 2
      const sp = 2 + Math.random() * 6
      return { x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 1 + Math.random() * 2 }
    })

    const start = performance.now()
    const tick = (t: number) => {
      const el = (t - start) / 1000
      ctx.clearRect(0, 0, rect.width, rect.height)
      const life = Math.max(0, 1 - el / 1.5)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.96
        p.vy *= 0.96
        ctx.globalAlpha = life * 0.9
        ctx.fillStyle = '#22D3EE'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      if (el < 1.6) requestAnimationFrame(tick)
      else ctx.clearRect(0, 0, rect.width, rect.height)
    }
    requestAnimationFrame(tick)
  }

  useGSAP(
    () => {
      if (prefersReducedMotion() || !rootRef.current) return

      // H2 word-level mask reveal (stagger 0.05s, top 75%); burst fires on complete.
      gsap.fromTo(
        '.contact-h2-word',
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.05,
          scrollTrigger: { trigger: '.contact-h2', start: 'top 75%', once: true },
          onComplete: () => burstRef.current(),
        },
      )

      // Sub + CTAs stagger up 0.1s.
      gsap.fromTo(
        '.contact-rise',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'expo.out',
          stagger: 0.1,
          delay: 0.25,
          scrollTrigger: { trigger: '.contact-h2', start: 'top 75%', once: true },
        },
      )
    },
    { scope: rootRef },
  )

  const copyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(EMAIL).catch(() => {})
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section
      id="contact"
      ref={rootRef}
      className="relative overflow-hidden border-t border-line"
    >
      {/* particle burst canvas · behind content */}
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
      />

      <div className="relative z-10 mx-auto max-w-[1280px] px-[clamp(20px,5vw,80px)] py-[clamp(96px,14vh,180px)]">
        <SectionEyebrow index="06" label="CONTACT" />

        <div className="mt-20 flex flex-col items-center text-center">
          <h2 className="contact-h2 max-w-[1000px] font-display text-[clamp(2.5rem,7vw,6rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink">
            {H2_WORDS.map(({ w, volt }) => (
              <span key={w} className="inline-block overflow-hidden pb-1 align-bottom">
                <span
                  className={`contact-h2-word inline-block will-change-transform ${
                    volt ? 'italic text-volt' : ''
                  }`}
                >
                  {w}&nbsp;
                </span>
              </span>
            ))}
          </h2>

          <p className="contact-rise mt-6 max-w-[520px] text-base leading-relaxed text-muted">
            I'm open to internships and collaborations in ML engineering, data engineering, and
            agentic systems. Boston-based, CPT-authorized · no sponsorship needed to start.
          </p>

          <div className="contact-rise mt-12 flex flex-wrap items-center justify-center gap-4">
            {/* Big volt slab · mailto + click-to-copy */}
            <span className="relative inline-block rounded transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_48px_#22D3EE44]">
              <AnimatePresence>
                {copied && (
                  <motion.span
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border border-volt/40 bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-volt"
                  >
                    COPIED ✓
                  </motion.span>
                )}
              </AnimatePresence>
              <MagneticButton
                variant="primary"
                href={`mailto:${EMAIL}`}
                onClick={copyEmail}
                cursorLabel="SAY HI"
                className="!px-10 !py-5 !text-sm"
                ariaLabel={`Email ${EMAIL}`}
              >
                {EMAIL} <span>↗</span>
              </MagneticButton>
            </span>

            <MagneticButton
              variant="ghost"
              href="https://linkedin.com/in/paramsachinjain"
              target="_blank"
            >
              LINKEDIN <span className="text-volt">↗</span>
            </MagneticButton>
            <MagneticButton
              variant="ghost"
              href="https://github.com/paramjain13"
              target="_blank"
            >
              GITHUB <span className="text-volt">↗</span>
            </MagneticButton>
            <MagneticButton
              variant="ghost"
              href="https://paramjain.vercel.app"
              target="_blank"
            >
              PARAMJAIN.VERCEL.APP <span className="text-volt">↗</span>
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  )
}
