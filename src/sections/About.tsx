import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '@/lib/scroll'
import SectionEyebrow from '@/components/SectionEyebrow'
import WordMask from '@/sections/about/WordMask'
import StatCounter from '@/sections/about/StatCounter'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const CHIPS = ['BOSTON, MA', 'F-1 · CPT AUTHORIZED', 'EX-DevQAExpert', 'EX-Genesis']

const EDUCATION = [
  {
    degree: 'M.S. COMPUTER SCIENCE',
    school: 'Northeastern University, Boston',
    date: 'Expected Dec 2027',
  },
  {
    degree: 'B.TECH COMPUTER SCIENCE',
    school: 'Medi-Caps University, Indore',
    date: '',
  },
]

const STATS = [
  { value: 10000, suffix: '+', label: 'EVENTS / SEC PROCESSED' },
  { value: 30, suffix: 'K+', label: 'MONTHLY USERS SERVED' },
  { value: 97, suffix: '%', label: 'SERVICE UPTIME' },
  { value: 64.4, decimals: 1, suffix: '%', label: 'BIRD-SQL EXECUTION ACCURACY' },
  { value: 42, prefix: '+', suffix: '%', label: 'DEFECT PREDICTION LIFT' },
  { value: 86.5, decimals: 1, suffix: '%', label: 'PUBLISHED MODEL ACCURACY' },
]

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const portraitRef = useRef<HTMLDivElement>(null)
  const portraitImgRef = useRef<HTMLDivElement>(null)
  const scanRef = useRef<HTMLDivElement>(null)

  // Section entry reveals · trigger top 75%, once.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(sectionRef)

      // Eyebrow hairline draws left -> right (0.5s).
      gsap.fromTo(
        q('.about-eyebrow > div > span:last-child'),
        { scaleX: 0, transformOrigin: 'left center' },
        {
          scaleX: 1,
          duration: 0.5,
          ease: 'expo.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
        },
      )

      // H2 words slide up in mask (stagger 0.04s).
      gsap.fromTo(
        q('.about-h2 .wm-word'),
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.04,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
        },
      )

      // Body paragraphs y-32 fade, stagger 0.12s.
      gsap.fromTo(
        q('.about-body'),
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'expo.out',
          stagger: 0.12,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
        },
      )

      // Portrait card: clip-path inset reveal bottom -> top (0.9s).
      gsap.fromTo(
        portraitRef.current,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
        },
      )

      // Education cards stagger 0.1s.
      gsap.fromTo(
        q('.about-edu'),
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
        },
      )

      // Detail chips cascade in.
      gsap.fromTo(
        q('.about-chip'),
        { y: 12, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'expo.out',
          stagger: 0.06,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
        },
      )

      // Portrait parallax: image translateY ±24px scrubbed across the section.
      if (portraitImgRef.current) {
        gsap.fromTo(
          portraitImgRef.current,
          { y: -24 },
          {
            y: 24,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      }
    },
    { scope: sectionRef },
  )

  // Volt scan-line sweep top -> bottom (0.8s) on portrait hover.
  const sweepScan = () => {
    const scan = scanRef.current
    const frame = portraitRef.current
    if (!scan || !frame || prefersReducedMotion()) return
    gsap.killTweensOf(scan)
    gsap.fromTo(
      scan,
      { y: 0, opacity: 1 },
      { y: frame.clientHeight, opacity: 1, duration: 0.8, ease: 'power1.inOut' },
    )
  }

  return (
    <section
      ref={sectionRef}
      id="about"
      className="mx-auto max-w-[1280px] px-[clamp(20px,5vw,80px)] py-[clamp(96px,14vh,180px)]"
    >
      <div className="about-eyebrow">
        <SectionEyebrow index="01" label="ABOUT" />
      </div>

      <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Left (col 1–5): portrait + education stack */}
        <div className="lg:col-span-5">
          <div
            ref={portraitRef}
            className="group relative rounded-lg border border-line bg-surface"
            data-cursor="media"
            data-cursor-label="FIG.01"
            onMouseEnter={sweepScan}
          >
            {/* Mono corner ticks (2 corners, muted) */}
            <span
              aria-hidden
              className="pointer-events-none absolute -left-2 -top-3 z-10 font-mono text-sm text-muted"
            >
              +
            </span>
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-3 -right-2 z-10 font-mono text-sm text-muted"
            >
              +
            </span>

            <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
              {/* Parallax wrapper: GSAP owns this transform; the img keeps
                  its CSS hover scale (1.10 base covers the ±24px drift). */}
              <div ref={portraitImgRef} className="absolute inset-0 will-change-transform">
                <img
                  src="/portrait-abstract.png"
                  alt="Cyan neural-network constellation forming an abstract profile on black"
                  className="h-full w-full scale-110 object-cover transition-transform duration-500 ease-out group-hover:scale-[1.14]"
                  loading="lazy"
                />
              </div>
              {/* Cyan scan-line (hover sweep) */}
              <div
                ref={scanRef}
                aria-hidden
                className="pointer-events-none absolute left-0 top-0 h-[2px] w-full bg-volt opacity-0 shadow-[0_0_12px_#22D3EE]"
              />
            </div>

            <div className="border-t border-line px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                FIG.01 · PARAM JAIN, B.TECH → M.S. CS
              </p>
            </div>
          </div>

          {/* Education stack */}
          <div className="mt-6 space-y-4">
            {EDUCATION.map((ed) => (
              <div
                key={ed.degree}
                className="about-edu rounded-lg border border-line border-l-2 border-l-volt bg-surface p-4"
              >
                <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-ink">
                  {ed.degree}
                </p>
                <p className="mt-1.5 font-sans text-sm text-muted">{ed.school}</p>
                {ed.date && (
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                    {ed.date}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right (col 6–12): headline, body, chips, stat grid */}
        <div className="lg:col-span-7">
          <h2 className="about-h2 font-display text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink">
            <WordMask text="Measurable over demo-able." />
          </h2>

          <p className="about-body mt-8 max-w-[620px] font-sans text-base leading-[1.65] text-muted md:text-lg">
            I&apos;m Param Jain · an AI/ML engineer pursuing my M.S. in Computer Science at
            Northeastern University. I&apos;ve shipped failure-risk scoring across 15,000+ test
            scenarios, taken an identity-verification model from 30% to 95% accuracy for 30K+
            monthly users, and built a self-correcting NL2SQL agent that verifies its own queries
            before running them.
          </p>
          <p className="about-body mt-5 max-w-[620px] font-sans text-base leading-[1.65] text-muted md:text-lg">
            My through-line: systems that catch their own failures. Whether it&apos;s a 3-sigma
            anomaly detector watching 10,000 events/sec of fleet telemetry or an AST-level SQL
            verifier traversing foreign-key graphs, I&apos;d rather build the guardrail than write
            the apology.
          </p>

          {/* Detail chips */}
          <div className="mt-8 flex flex-wrap gap-3">
            {CHIPS.map((chip) => (
              <span
                key={chip}
                className="about-chip rounded-full border border-line px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-volt hover:text-ink"
              >
                {chip}
              </span>
            ))}
          </div>

          {/* Stat counter grid · 2 rows × 3 cols (1-col mobile) */}
          <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-3">
            {STATS.map((s, i) => (
              <StatCounter
                key={s.label}
                value={s.value}
                decimals={s.decimals ?? 0}
                prefix={s.prefix ?? ''}
                suffix={s.suffix ?? ''}
                label={s.label}
                delay={i * 0.15}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
