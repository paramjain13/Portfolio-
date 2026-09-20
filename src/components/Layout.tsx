import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { initLenis, getLenis } from '@/lib/scroll'
import CustomCursor from '@/components/CustomCursor'

/**
 * App shell: Lenis smooth scroll (synced with GSAP ScrollTrigger), film-grain
 * overlay, custom cursor, and the content slot. The Navbar is fixed (overlay
 * nav), so the content slot carries matching top padding; full-bleed sections
 * (hero) opt out with a negative top margin inside the page.
 */
export default function Layout({ children }: { children: ReactNode }) {
  useEffect(() => {
    initLenis()
    return () => {
      getLenis()?.destroy()
    }
  }, [])

  return (
    <div className="relative min-h-[100dvh] bg-bg text-ink">
      <div className="film-grain" aria-hidden />
      <CustomCursor />
      <div className="pt-16">{children}</div>
    </div>
  )
}
