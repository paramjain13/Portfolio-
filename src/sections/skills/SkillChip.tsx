import { memo, useRef } from 'react'
import type { MouseEvent as FMMouseEvent, RefObject } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface SkillChipProps {
  name: string
  /** Core skills carry a 4px volt dot prefix. */
  core?: boolean
}

const canMagnet = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Skill chip · mono pill with magnetic pull (max 4px toward cursor,
 * springs back on leave) and volt border on hover.
 */
function SkillChip({ name, core = false }: SkillChipProps) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 300, damping: 18 })
  const sy = useSpring(y, { stiffness: 300, damping: 18 })

  const handleMove = (e: FMMouseEvent) => {
    if (!canMagnet() || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    const pull = 4
    x.set(Math.max(-pull, Math.min(pull, dx * 0.25)))
    y.set(Math.max(-pull, Math.min(pull, dy * 0.25)))
  }

  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span
      ref={ref as RefObject<HTMLSpanElement>}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }}
      data-cursor="media"
      data-cursor-label="◆"
      className="skill-chip inline-flex items-center gap-2 rounded-full border border-line bg-surface px-[14px] py-2 font-mono text-[0.8rem] tracking-[0.02em] text-ink transition-colors duration-200 hover:border-volt"
    >
      {core && <span aria-hidden className="h-1 w-1 rounded-full bg-volt" />}
      {name}
    </motion.span>
  )
}

export default memo(SkillChip)
