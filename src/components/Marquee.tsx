import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { getLenis, prefersReducedMotion } from '@/lib/scroll'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const ITEMS = [
  'AI/ML ENGINEER',
  'DATA ENGINEER',
  'M.S. CS @ NORTHEASTERN',
  'SYSTEMS THAT CATCH THEIR OWN FAILURES',
  'PYTHON · PYTORCH · LANGGRAPH',
]

function MarqueeSegment() {
  return (
    <div className="flex shrink-0 items-center">
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center whitespace-nowrap">
          <span className="font-display text-2xl font-medium uppercase tracking-[-0.01em] text-ink">
            {item}
          </span>
          <span className="mx-6 text-lg text-volt" aria-hidden>
            ✦
          </span>
        </span>
      ))}
    </div>
  )
}

/**
 * Infinite marquee strip. Base speed 60px/s; scroll velocity modulates speed
 * (up to 3x) and flips direction when scrolling up. Enters with a clip-path
 * wipe left->right at `top 90%`.
 */
export default function Marquee() {
  const rootRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const track = rootRef.current?.querySelector<HTMLElement>('.marquee-track')
      if (!track) return

      // Clip-path wipe entrance.
      gsap.fromTo(
        rootRef.current,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: { trigger: rootRef.current, start: 'top 90%', once: true },
        },
      )

      if (prefersReducedMotion()) return

      // Seamless x-loop: 3 segments, shift by one segment width at 60px/s.
      const segmentWidth = track.scrollWidth / 3
      const tween = gsap.to(track, {
        x: -segmentWidth,
        duration: segmentWidth / 60,
        ease: 'none',
        repeat: -1,
      })

      // Scroll velocity -> speed (max 3x) + direction flip when scrolling up.
      let target = 1
      const lenis = getLenis()
      const onScroll = (e: { velocity: number }) => {
        const v = e.velocity ?? 0
        const mag = Math.min(1 + Math.abs(v) * 0.15, 3)
        target = v < -0.5 ? -mag : mag
      }
      lenis?.on('scroll', onScroll)
      const smooth = () => {
        tween.timeScale(gsap.utils.interpolate(tween.timeScale(), target, 0.08))
        // Relax back to base speed.
        target = gsap.utils.interpolate(target, target < 0 ? -1 : 1, 0.05)
      }
      gsap.ticker.add(smooth)

      return () => {
        lenis?.off('scroll', onScroll)
        gsap.ticker.remove(smooth)
        tween.kill()
      }
    },
    { scope: rootRef },
  )

  return (
    <div className="relative z-10 -my-2 overflow-hidden py-4" aria-hidden>
      <div
        ref={rootRef}
        className="h-16 w-[104%] -ml-[2%] -rotate-[1.5deg] border-y border-line bg-surface"
      >
        <div className="marquee-track flex h-full w-max items-center">
          <MarqueeSegment />
          <MarqueeSegment />
          <MarqueeSegment />
        </div>
      </div>
    </div>
  )
}
