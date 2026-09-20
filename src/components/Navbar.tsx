import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AnimatePresence, motion } from 'framer-motion'
import { scrollToTarget, getLenis } from '@/lib/scroll'
import MagneticButton from '@/components/MagneticButton'

gsap.registerPlugin(ScrollTrigger)

const LINKS = [
  { label: 'ABOUT', href: '#about' },
  { label: 'SKILLS', href: '#skills' },
  { label: 'EXPERIENCE', href: '#experience' },
  { label: 'PROJECTS', href: '#projects' },
  { label: 'WRITING', href: '#writing' },
  { label: 'CONTACT', href: '#contact' },
]

interface NavbarProps {
  /** True once the loader curtains begin to exit · nav slides down 0.2s later. */
  revealed: boolean
}

export default function Navbar({ revealed }: NavbarProps) {
  const [active, setActive] = useState<string>('')
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [introDone, setIntroDone] = useState(false)
  const lastY = useRef(0)

  // Mark intro slide complete so hide-on-scroll isn't transition-delayed.
  useEffect(() => {
    if (!revealed) return
    const t = window.setTimeout(() => setIntroDone(true), 800)
    return () => window.clearTimeout(t)
  }, [revealed])

  // Hide on scroll down > 120px, reveal on scroll up; hairline after 40px.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 40)
      if (y > 120 && y > lastY.current + 4) setHidden(true)
      else if (y < lastY.current - 4) setHidden(false)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Active section tracking via ScrollTrigger.
  useEffect(() => {
    const ids = ['hero', 'about', 'skills', 'experience', 'projects', 'writing', 'contact']
    const triggers = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)
      .map((el) =>
        ScrollTrigger.create({
          trigger: el,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => {
            if (self.isActive) setActive(`#${el.id}`)
          },
        }),
      )
    return () => triggers.forEach((t) => t.kill())
  }, [])

  // Lock scroll while the mobile menu is open.
  useEffect(() => {
    const lenis = getLenis()
    if (menuOpen) {
      lenis?.stop()
      document.body.style.overflow = 'hidden'
    } else {
      lenis?.start()
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const go = (href: string) => {
    setMenuOpen(false)
    scrollToTarget(href)
  }

  const hiddenNow = !revealed || (hidden && !menuOpen)

  return (
    <>
      <header
        className={`site-nav fixed top-0 left-0 right-0 z-50 h-16 border-b bg-bg/70 backdrop-blur-md ${
          hiddenNow ? '-translate-y-full' : 'translate-y-0'
        } ${scrolled ? 'border-line' : 'border-transparent'}`}
        style={{
          transitionProperty: 'transform',
          transitionDuration: revealed && !introDone ? '500ms' : '300ms',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          transitionDelay: revealed && !introDone ? '200ms' : '0ms',
        }}
      >
        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-[clamp(20px,5vw,80px)]">
          <button
            onClick={() => scrollToTarget(0)}
            className="font-mono text-sm font-bold tracking-[0.08em] text-ink"
            data-cursor="link"
            aria-label="Back to top"
          >
            PJ<span className="caret-blink text-volt">_</span>
          </button>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => {
                  e.preventDefault()
                  go(l.href)
                }}
                data-cursor="link"
                className={`group relative font-mono text-[11px] font-medium uppercase tracking-[0.08em] transition-colors duration-200 ${
                  active === l.href ? 'text-volt' : 'text-muted hover:text-volt'
                }`}
              >
                <span
                  className={`mr-1 inline-block h-1 w-1 rounded-full bg-volt align-middle transition-opacity ${
                    active === l.href ? 'opacity-100' : 'opacity-0'
                  }`}
                  aria-hidden
                />
                {l.label}
                <span
                  className="absolute -bottom-1 left-0 h-[4px] w-0 bg-volt transition-all duration-300 ease-out group-hover:w-full"
                  aria-hidden
                />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <MagneticButton
              variant="ghost"
              href="#contact"
              onClick={() => go('#contact')}
              className="hidden !rounded-full !border-volt !px-4 !py-2 !text-[10px] !text-volt hover:!bg-volt hover:!text-bg md:inline-flex"
            >
              RESUME <span className="text-volt group-hover:text-bg">↗</span>
            </MagneticButton>
            <button
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <span className="h-px w-6 bg-ink" />
              <span className="h-px w-6 bg-ink" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-bg md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex h-16 items-center justify-between px-[clamp(20px,5vw,80px)]">
              <span className="font-mono text-sm font-bold tracking-[0.08em] text-ink">
                PJ<span className="text-volt">_</span>
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="font-mono text-2xl text-ink"
              >
                ×
              </button>
            </div>
            <nav className="flex flex-1 flex-col justify-center gap-2 px-[clamp(20px,5vw,80px)]" aria-label="Mobile">
              {LINKS.map((l, i) => (
                <motion.button
                  key={l.href}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 24, opacity: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => go(l.href)}
                  className="group flex items-baseline gap-4 text-left"
                >
                  <span className="font-mono text-xs text-volt">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-display text-4xl font-semibold uppercase tracking-[-0.03em] text-ink transition-colors group-hover:text-volt">
                    {l.label}
                  </span>
                </motion.button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
