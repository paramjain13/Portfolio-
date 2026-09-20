import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Initialize the site-wide Lenis smooth scroll, synced to GSAP ScrollTrigger. */
export function initLenis(): Lenis {
  if (lenis) return lenis
  lenis = new Lenis({
    lerp: 0.09,
    wheelMultiplier: 1.0,
  })
  lenis.on('scroll', ScrollTrigger.update)
  const raf = (time: number) => {
    lenis?.raf(time * 1000)
  }
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function getLenis(): Lenis | null {
  return lenis
}

/** Smooth-scroll to an anchor target ("#about") or pixel offset. */
export function scrollToTarget(target: string | number) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 0.8, easing: (t) => 1 - Math.pow(1 - t, 3) })
  } else if (typeof target === 'string') {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  } else {
    window.scrollTo({ top: target, behavior: 'smooth' })
  }
}
