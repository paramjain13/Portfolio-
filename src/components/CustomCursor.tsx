import { useEffect, useRef, useState } from 'react'

type CursorState = 'default' | 'link' | 'media' | 'text'

const canUseCustomCursor = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: fine)').matches &&
  window.matchMedia('(min-width: 1024px)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Custom cursor: 8px volt dot + 32px trailing ring (lerp 0.15).
 * States via `data-cursor` attributes in the DOM:
 *   "link"  · hover on links/buttons: ring 1.6x, dot hidden
 *   "media" · hover on project cards/media: ring 3.2x solid volt, blend-difference, label
 *   "text"  · hover on paragraphs: ring collapses to a 2px caret bar
 * Label text comes from `data-cursor-label`.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const [state, setState] = useState<CursorState>('default')
  const [label, setLabel] = useState('')
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!canUseCustomCursor()) return
    setEnabled(true)
    document.documentElement.classList.add('custom-cursor-active')

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ring = { x: pos.x, y: pos.y }
    let raf = 0

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX
      pos.y = e.clientY
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`
      }
    }

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null
      if (!el || !el.closest) return
      const tagged = el.closest('[data-cursor]') as HTMLElement | null
      if (tagged) {
        const kind = tagged.dataset.cursor as CursorState
        setState(kind)
        setLabel(tagged.dataset.cursorLabel ?? '')
        return
      }
      if (el.closest('a, button, [role="button"]')) {
        setState('link')
        setLabel('')
        return
      }
      if (el.closest('p')) {
        setState('text')
        setLabel('')
        return
      }
      setState('default')
      setLabel('')
    }

    const loop = () => {
      ring.x += (pos.x - ring.x) * 0.15
      ring.y += (pos.y - ring.y) * 0.15
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`
      }
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('custom-cursor-active')
    }
  }, [])

  if (!enabled) return null

  const ringScale = state === 'media' ? 3.2 : state === 'link' ? 1.6 : 1
  const isMedia = state === 'media'
  const isText = state === 'text'

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[200]"
        style={{ opacity: state === 'link' || isMedia ? 0 : 1, transition: 'opacity 0.2s' }}
      >
        <div className="h-2 w-2 rounded-full bg-volt" />
      </div>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[199]"
      >
        <div
          className="flex items-center justify-center transition-all duration-200 ease-out"
          style={{
            width: isText ? 2 : 32,
            height: 32,
            transform: `scale(${isText ? 0.5 : ringScale})`,
            borderRadius: isText ? 1 : '50%',
            border: isMedia ? 'none' : '1px solid rgba(34, 211, 238, 0.5)',
            backgroundColor: isMedia ? '#22D3EE' : 'transparent',
            mixBlendMode: isMedia ? 'difference' : 'normal',
          }}
        >
          {isMedia && label ? (
            <span
              className="font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-bg"
              style={{ mixBlendMode: 'difference', color: '#0A0A0B' }}
            >
              {label}
            </span>
          ) : null}
        </div>
      </div>
    </>
  )
}
