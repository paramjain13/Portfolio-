import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { scrollToTarget, prefersReducedMotion } from '@/lib/scroll'
import MagneticButton from '@/components/MagneticButton'

gsap.registerPlugin(ScrollTrigger, useGSAP)

function useBostonTime() {
  const [now, setNow] = useState('')
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    })
    const tick = () => setNow(fmt.format(new Date()))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

const WATERMARK = 'PARAM JAIN'

export default function Footer() {
  const time = useBostonTime()
  const wmRef = useRef<HTMLDivElement>(null)

  // Giant watermark parallax: rises 40px as the footer enters the viewport.
  useGSAP(() => {
    if (prefersReducedMotion() || !wmRef.current) return
    gsap.fromTo(
      wmRef.current,
      { y: 40 },
      {
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: wmRef.current.parentElement,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: true,
        },
      },
    )
  })

  // Per-letter volt shimmer on hover (desktop only).
  const shimmer = (e: MouseEvent) => {
    if (prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return
    const letters = wmRef.current?.querySelectorAll('span')
    if (!letters) return
    gsap.fromTo(
      letters,
      { color: '#1A1A1E' },
      { color: '#22D3EE', duration: 0.25, stagger: 0.03, yoyo: true, repeat: 1, ease: 'power1.inOut' },
    )
    void e
  }

  return (
    <footer className="relative border-t border-line">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-4 px-[clamp(20px,5vw,80px)] py-8 md:grid-cols-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
          © 2025 PARAM JAIN · BOSTON, MA
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted md:text-center">
          LOCAL · <span className="text-volt tabular-nums">{time}</span>
        </p>
        <div className="md:justify-self-end">
          <MagneticButton variant="ghost" onClick={() => scrollToTarget(0)} className="!px-4 !py-2 !text-[10px]">
            BACK TO TOP <span className="text-volt">↑</span>
          </MagneticButton>
        </div>
      </div>
      <div
        className="pointer-events-auto relative select-none overflow-hidden"
        onMouseEnter={shimmer}
        aria-hidden
      >
        <div
          ref={wmRef}
          className="whitespace-nowrap text-center font-display font-bold uppercase leading-[0.8] tracking-[-0.03em] text-surface-2"
          style={{ fontSize: 'clamp(4rem, 14vw, 12rem)', transform: 'translateY(18%)' }}
        >
          {WATERMARK.split('').map((ch, i) => (
            <span key={i}>{ch === ' ' ? '\u00A0' : ch}</span>
          ))}
        </div>
      </div>
    </footer>
  )
}
