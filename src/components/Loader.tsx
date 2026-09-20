import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '@/lib/scroll'

gsap.registerPlugin(useGSAP)

const NAME = 'PARAM JAIN'
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>/\\'
const MICRO_LABELS = ['INIT PARTICLE FIELD', 'MOUNTING SECTIONS', 'CALIBRATING CURSOR']
const SESSION_KEY = 'pj-loader-done'

interface LoaderProps {
  /** Fires when the curtain panels begin sliding apart. */
  onReveal: () => void
  /** Fires when the loader has fully exited. */
  onDone: () => void
}

/**
 * Loading screen: mono % counter (expo-out, lingers at 64), scramble-decode
 * name reveal, micro-label ticker, volt progress hairline, twin-curtain exit.
 * Total <= 2.8s. Skipped instantly on prefers-reduced-motion or repeat visits
 * in the same session.
 */
export default function Loader({ onReveal, onDone }: LoaderProps) {
  const [skip] = useState(
    () => prefersReducedMotion() || sessionStorage.getItem(SESSION_KEY) === '1',
  )
  const [count, setCount] = useState(0)
  const [label, setLabel] = useState(MICRO_LABELS[0])
  const [name, setName] = useState(NAME.replace(/[A-Z]/g, '#'))
  const [exiting, setExiting] = useState(false)
  const [gone, setGone] = useState(skip)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (skip) {
      onReveal()
      onDone()
      return
    }

    // Micro-label ticker, 400ms apart.
    let li = 0
    const labelTimer = window.setInterval(() => {
      li = (li + 1) % MICRO_LABELS.length
      setLabel(MICRO_LABELS[li])
    }, 400)

    // Scramble-decode name, left to right over 1.4s.
    const start = performance.now()
    let raf = 0
    const decode = (now: number) => {
      const t = Math.min(1, (now - start) / 1400)
      const resolved = Math.floor(t * NAME.length)
      let out = ''
      for (let i = 0; i < NAME.length; i++) {
        const ch = NAME[i]
        if (ch === ' ') out += ' '
        else if (i < resolved) out += ch
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      }
      setName(out)
      if (t < 1) raf = requestAnimationFrame(decode)
    }
    raf = requestAnimationFrame(decode)

    // Counter 0 -> 100, expo-out, lingering at 64 for 120ms (nod to 64.4%).
    const proxy = { v: 0 }
    const tl = gsap.timeline({
      onComplete: () => {
        window.setTimeout(() => {
          setExiting(true)
          onReveal()
          window.setTimeout(() => {
            sessionStorage.setItem(SESSION_KEY, '1')
            setGone(true)
            onDone()
          }, 700)
        }, 200)
      },
    })
    tl.to(proxy, {
      v: 64,
      duration: 0.9,
      ease: 'expo.out',
      onUpdate: () => setCount(Math.round(proxy.v)),
    })
      .to(proxy, { v: 64, duration: 0.12 })
      .to(proxy, {
        v: 100,
        duration: 0.8,
        ease: 'expo.out',
        onUpdate: () => setCount(Math.round(proxy.v)),
      })

    return () => {
      window.clearInterval(labelTimer)
      cancelAnimationFrame(raf)
      tl.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip])

  // Curtain exit: twin panels slide apart vertically, trailing 2px volt edges.
  useGSAP(() => {
    if (!exiting) return
    gsap.to('.loader-curtain-top', { yPercent: -100, duration: 0.7, ease: 'expo.inOut' })
    gsap.to('.loader-curtain-bottom', { yPercent: 100, duration: 0.7, ease: 'expo.inOut' })
    gsap.to('.loader-content', { opacity: 0, duration: 0.25 })
  }, [exiting])

  if (gone) return null

  return (
    <div ref={rootRef} className="fixed inset-0 z-[100]" aria-hidden={exiting}>
      {/* Top curtain */}
      <div className="loader-curtain-top absolute inset-x-0 top-0 h-1/2 bg-bg" style={{ borderBottom: '2px solid #22D3EE' }} />
      {/* Bottom curtain */}
      <div className="loader-curtain-bottom absolute inset-x-0 bottom-0 h-1/2 bg-bg" style={{ borderTop: '2px solid #22D3EE' }} />

      <div className="loader-content absolute inset-0">
        {/* Center: scrambling name decode */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="font-display text-[clamp(2rem,7vw,5rem)] font-bold uppercase tracking-[-0.03em] text-ink">
            {name}
          </h1>
        </div>

        {/* Top-right micro labels */}
        <p className="absolute right-[clamp(20px,5vw,80px)] top-8 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
          {label}
        </p>

        {/* Bottom-left counter */}
        <p className="absolute bottom-8 left-[clamp(20px,5vw,80px)] font-mono font-bold tabular-nums text-ink" style={{ fontSize: 'clamp(4rem, 10vw, 8rem)', lineHeight: 1 }}>
          {String(count).padStart(3, '0')}
          <span className="text-volt" style={{ fontSize: '0.35em' }}>%</span>
        </p>

        {/* Volt progress hairline */}
        <div
          className="absolute bottom-0 left-0 h-px bg-volt transition-[width] duration-100"
          style={{ width: `${count}%` }}
        />
      </div>
    </div>
  )
}
