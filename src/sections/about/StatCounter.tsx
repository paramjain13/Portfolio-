import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '@/lib/scroll'

gsap.registerPlugin(ScrollTrigger)

interface StatCounterProps {
  /** Final numeric value (e.g. 10000, 64.4). */
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  label: string
  /** Stagger delay across the grid (seconds). */
  delay?: number
}

const DIGITS = '0123456789'

/**
 * Live stat counter · instrument-boot feel. On entering the viewport the
 * number runs a 300ms random-digit flicker, then counts 0 -> final over
 * 1.4s with expo-out easing (staggered 0.15s across the grid). Fires once.
 */
export default function StatCounter({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  label,
  delay = 0,
}: StatCounterProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const num = numRef.current
    const root = rootRef.current
    if (!num || !root) return

    const format = (v: number) =>
      v.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    const finalStr = `${prefix}${format(value)}${suffix}`

    // Reduced motion: set instantly, no flicker, no count.
    if (prefersReducedMotion()) {
      num.textContent = finalStr
      return
    }

    let flickerId: number | undefined
    const counter = { v: 0 }
    let startCall: gsap.core.Tween | undefined
    let tween: gsap.core.Tween | undefined

    const flickerFrame = () => {
      num.textContent = finalStr.replace(
        /[0-9]/g,
        () => DIGITS[Math.floor(Math.random() * 10)],
      )
    }

    const st = ScrollTrigger.create({
      trigger: root,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        // Grid stagger: hold the boot sequence until this cell's slot.
        startCall = gsap.delayedCall(delay, () => {
          // 300ms random-digit flicker, then the count locks in.
          flickerFrame()
          flickerId = window.setInterval(flickerFrame, 40)
          tween = gsap.to(counter, {
            v: value,
            duration: 1.4,
            delay: 0.3,
            ease: 'expo.out',
            onStart: () => {
              if (flickerId !== undefined) {
                window.clearInterval(flickerId)
                flickerId = undefined
              }
              num.textContent = `${prefix}${format(0)}${suffix}`
            },
            onUpdate: () => {
              num.textContent = `${prefix}${format(counter.v)}${suffix}`
            },
            onComplete: () => {
              num.textContent = finalStr
            },
          })
        })
      },
    })

    return () => {
      st.kill()
      if (flickerId !== undefined) window.clearInterval(flickerId)
      startCall?.kill()
      tween?.kill()
    }
  }, [value, decimals, prefix, suffix, delay])

  return (
    <div ref={rootRef} className="border-t border-line pt-4">
      <span
        ref={numRef}
        className="block font-mono text-[clamp(2rem,3vw,2.75rem)] font-bold tabular-nums leading-none text-volt"
      >
        {prefix}
        {(0).toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
        {suffix}
      </span>
      <span className="mt-3 block font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
        {label}
      </span>
    </div>
  )
}
