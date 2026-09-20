import { useRef } from 'react'
import type { ReactNode, RefObject, MouseEvent as FMMouseEvent } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface MagneticButtonProps {
  children: ReactNode
  variant?: 'primary' | 'ghost'
  href?: string
  onClick?: () => void
  className?: string
  cursorLabel?: string
  target?: string
  rel?: string
  type?: 'button' | 'submit'
  ariaLabel?: string
}

const canMagnet = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Magnetic button · translates toward the cursor (max 12px pull),
 * inner label moves 1.4x for parallax, springs back on leave
 * (Framer Motion spring, stiffness 200, damping 15).
 */
export default function MagneticButton({
  children,
  variant = 'primary',
  href,
  onClick,
  className = '',
  cursorLabel,
  target,
  rel,
  type = 'button',
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const lx = useMotionValue(0)
  const ly = useMotionValue(0)
  const spring = { stiffness: 200, damping: 15 }
  const sx = useSpring(x, spring)
  const sy = useSpring(y, spring)
  const slx = useSpring(lx, spring)
  const sly = useSpring(ly, spring)

  const handleMove = (e: FMMouseEvent) => {
    if (!canMagnet() || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    const pull = 12
    const nx = Math.max(-pull, Math.min(pull, dx * 0.35))
    const ny = Math.max(-pull, Math.min(pull, dy * 0.35))
    x.set(nx)
    y.set(ny)
    // inner label parallax: 1.4x, capped at 6px
    lx.set(Math.max(-6, Math.min(6, nx * 1.4 * 0.5)))
    ly.set(Math.max(-6, Math.min(6, ny * 1.4 * 0.5)))
  }

  const handleLeave = () => {
    x.set(0)
    y.set(0)
    lx.set(0)
    ly.set(0)
  }

  const base =
    'group inline-flex items-center justify-center gap-2 rounded px-6 py-3 font-mono text-xs font-medium uppercase tracking-[0.08em] transition-colors duration-200 focus-visible:outline-none'
  const styles =
    variant === 'primary'
      ? 'bg-volt text-bg hover:shadow-[0_0_24px_#22D3EE33] hover:scale-[1.02] transition-transform'
      : 'border border-line text-ink hover:border-volt hover:text-volt'

  const inner = (
    <motion.span style={{ x: slx, y: sly }} className="inline-flex items-center gap-2">
      {children}
    </motion.span>
  )

  const cursorAttrs = cursorLabel
    ? { 'data-cursor': 'link', 'data-cursor-label': cursorLabel }
    : { 'data-cursor': 'link' }

  if (href) {
    return (
      <motion.a
        ref={ref as RefObject<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel ?? (target === '_blank' ? 'noreferrer noopener' : undefined)}
        onClick={onClick}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ x: sx, y: sy }}
        className={`${base} ${styles} ${className}`}
        aria-label={ariaLabel}
        {...cursorAttrs}
      >
        {inner}
      </motion.a>
    )
  }

  return (
    <motion.button
      ref={ref as RefObject<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }}
      className={`${base} ${styles} ${className}`}
      aria-label={ariaLabel}
      {...cursorAttrs}
    >
      {inner}
    </motion.button>
  )
}
