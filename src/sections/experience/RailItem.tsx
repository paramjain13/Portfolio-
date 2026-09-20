import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface RailItemProps {
  index: string
  label: string
  active: boolean
}

/**
 * Progress-rail item · mono index ticks like an odometer (y-mask swap)
 * when it becomes active; active index in volt, label in ink, rest muted.
 */
export default function RailItem({ index, label, active }: RailItemProps) {
  const numRef = useRef<HTMLSpanElement>(null)
  const wasActive = useRef(false)

  useEffect(() => {
    if (active && !wasActive.current && numRef.current) {
      gsap.fromTo(
        numRef.current,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.4, ease: 'expo.out' },
      )
    }
    wasActive.current = active
  }, [active])

  return (
    <div className="flex items-center gap-4 py-4">
      <span className="inline-flex h-[1.3em] overflow-hidden">
        <span
          ref={numRef}
          className={`font-mono text-sm font-bold tabular-nums tracking-[0.08em] transition-colors duration-300 ${
            active ? 'text-volt' : 'text-muted'
          }`}
        >
          {index}
        </span>
      </span>
      <span
        className={`font-mono text-[11px] font-medium uppercase tracking-[0.08em] transition-colors duration-300 ${
          active ? 'text-ink' : 'text-muted'
        }`}
      >
        {label}
      </span>
    </div>
  )
}
