import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '@/lib/scroll'
import SectionEyebrow from '@/components/SectionEyebrow'
import WordMask from '@/sections/about/WordMask'
import RolePanel from '@/sections/experience/RolePanel'
import RailItem from '@/sections/experience/RailItem'
import type { Role } from '@/sections/experience/RolePanel'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const ROLES: Role[] = [
  {
    index: '01',
    title: 'AI Engineer',
    company: 'RevX · Bellevue, WA',
    rail: 'RevX',
    dates: 'AUG 2024 – AUG 2025',
    bullets: [
      [
        { t: 'Led ' },
        { t: '12+', v: true },
        { t: ' client AI automation projects end to end, scoping → deployment → training · ' },
        { t: '90%', v: true },
        { t: ' of clients stayed for follow-on work.' },
      ],
      [
        { t: 'Built a lead enrichment tool (Clay + Claude API) · research time down ' },
        { t: '−65%', v: true },
        { t: ', qualified lead conversion up ' },
        { t: '+28%', v: true },
        { t: ' across 6 accounts.' },
      ],
      [
        { t: 'Automated lead routing + CRM cleanup with ' },
        { t: '20+', v: true },
        { t: ' n8n workflows (HubSpot, Salesforce, LLM routing) · saved ' },
        { t: '400+ hrs/quarter', v: true },
        { t: ', CRM errors down ' },
        { t: '−40%', v: true },
        { t: '.' },
      ],
      [
        { t: 'Engineered a RAG assistant over client BigQuery data · answers in ' },
        { t: '<5 min', v: true },
        { t: ' instead of a 3-day analyst wait, used by ' },
        { t: '30+', v: true },
        { t: ' client users.' },
      ],
    ],
  },
  {
    index: '02',
    title: 'Software Engineer',
    company: 'DevQAExpert Solution Pvt. Ltd.',
    rail: 'DevQAExpert',
    dates: 'AUG 2023 – JUN 2024',
    bullets: [
      [
        { t: 'Built Python + scikit-learn failure-risk scoring over the regression corpus · defect prediction up ' },
        { t: '+42%', v: true },
        { t: ' across ' },
        { t: '15,000+', v: true },
        { t: ' scenarios per release.' },
      ],
      [
        { t: 'Automated CI/CD with Jenkins + GitHub Actions · manual release effort down ' },
        { t: '−60%', v: true },
        { t: '.' },
      ],
      [
        { t: 'Monitored 12 deployment cycles; traced ' },
        { t: '40+', v: true },
        { t: ' defects per release to root cause.' },
      ],
      [
        { t: 'Standardized release validation · code review turnaround down ' },
        { t: '−30%', v: true },
        { t: '.' },
      ],
    ],
  },
  {
    index: '03',
    title: 'Machine Learning Engineer',
    company: 'Genesis Technologies',
    rail: 'Genesis',
    dates: 'AUG 2022 – AUG 2023',
    bullets: [
      [
        { t: 'Identity-verification service (TensorFlow, scikit-learn) · accuracy ' },
        { t: '30% → 95%', v: true },
        { t: ' across ' },
        { t: '30K+', v: true },
        { t: ' monthly users.' },
      ],
      [
        { t: 'Engineered 15+ features from image/document quality signals (Pandas, NumPy, SQL).' },
      ],
      [
        { t: 'Deployed on AWS Lambda/S3/EC2 with Docker + Flask REST APIs · ' },
        { t: '97%', v: true },
        { t: ' uptime, ' },
        { t: '1,000+', v: true },
        { t: ' daily requests.' },
      ],
      [
        { t: 'Automated cross-validation · F1 ' },
        { t: '0.71 → 0.89', v: true },
        { t: '.' },
      ],
    ],
  },
  {
    index: '04',
    title: 'Data Engineering Intern',
    company: "Agrawal's 420 Namkeen, Sweets & Bakery",
    rail: "Agrawal's 420",
    dates: 'JAN 2022 – JUN 2022',
    bullets: [
      [
        { t: 'PostgreSQL + Python reporting pipelines · report runtime down ' },
        { t: '−45%', v: true },
        { t: '.' },
      ],
      [
        { t: 'Scheduled reporting replaced manual spreadsheets · saved ' },
        { t: '6 hrs/week', v: true },
        { t: '.' },
      ],
      [
        { t: 'SQL data-quality checks + job-status tracker · troubleshooting cut ' },
        { t: '2 hrs → 25 min', v: true },
        { t: '.' },
      ],
    ],
  },
]

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  useGSAP(
    () => {
      const reduced = prefersReducedMotion()
      const q = gsap.utils.selector(sectionRef)

      if (!reduced) {
        // Eyebrow hairline draw + H2 word reveal (top 75%, once).
        gsap.fromTo(
          q('.exp-eyebrow > div > span:last-child'),
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1,
            duration: 0.5,
            ease: 'expo.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
          },
        )
        gsap.fromTo(
          q('.exp-h2 .wm-word'),
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 0.9,
            ease: 'expo.out',
            stagger: 0.04,
            scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
          },
        )
      }

      const mm = gsap.matchMedia()

      mm.add(
        {
          isDesktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
          isMobile: '(max-width: 1023px) and (prefers-reduced-motion: no-preference)',
        },
        (context) => {
          const { isDesktop, isMobile } = context.conditions as {
            isDesktop: boolean
            isMobile: boolean
          }
          const panels = gsap.utils.toArray<HTMLElement>(q('.exp-panel'))

          if (isDesktop) {
            // ---- Pinned 250vh sequence (scrub 0.6) ----
            // Restack the panels absolutely into a fixed-height stage.
            const stageHeight = Math.max(400, Math.min(window.innerHeight * 0.48, 480))
            gsap.set(stageRef.current, { height: stageHeight })
            gsap.set(panels, { position: 'absolute', top: 0, left: 0, width: '100%', marginTop: 0 })
            gsap.set(panels.slice(1), { autoAlpha: 0, y: 60 })

            // Panel 01 bullets stagger in when the section first enters.
            gsap.fromTo(
              panels[0].querySelectorAll('.exp-bullet'),
              { y: 16, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.4,
                stagger: 0.08,
                ease: 'expo.out',
                scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
              },
            )

            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top top',
                end: () => `+=${Math.round(window.innerHeight * 3.4)}`,
                scrub: 0.6,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                  const idx = Math.min(
                    ROLES.length - 1,
                    Math.floor(self.progress * ROLES.length),
                  )
                  setActiveIdx((prev) => (prev === idx ? prev : idx))
                },
              },
            })

            // Rail volt fill grows top -> bottom with scroll progress.
            tl.fromTo(
              fillRef.current,
              { scaleY: 0 },
              { scaleY: 1, ease: 'none', duration: 3 },
              0,
            )

            // Transitions: outgoing y -60 + fade, incoming y +60 + fade.
            for (let i = 0; i < panels.length - 1; i++) {
              const at = i + 0.75
              tl.to(
                panels[i],
                { y: -60, autoAlpha: 0, duration: 0.5, ease: 'power2.inOut' },
                at,
              )
              tl.fromTo(
                panels[i + 1],
                { y: 60, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power2.inOut' },
                at,
              )
              tl.fromTo(
                panels[i + 1].querySelectorAll('.exp-bullet'),
                { y: 16, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.25, stagger: 0.08, ease: 'expo.out' },
                at + 0.15,
              )
            }
            // Panel 03 holds through t = 3.
          }

          if (isMobile) {
            // ---- Stacked-card fallback: each panel reveals y-48 fade ----
            panels.forEach((panel) => {
              gsap.fromTo(
                panel,
                { y: 48, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.7,
                  ease: 'expo.out',
                  scrollTrigger: { trigger: panel, start: 'top 80%', once: true },
                },
              )
            })
          }
        },
      )

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} id="experience" className="relative">
      <div className="mx-auto max-w-[1280px] px-[clamp(20px,5vw,80px)] py-[clamp(96px,14vh,180px)] lg:flex lg:min-h-[100dvh] lg:flex-col lg:justify-center lg:py-0">
        <div className="exp-eyebrow">
          <SectionEyebrow index="03" label="EXPERIENCE" />
        </div>

        <h2 className="exp-h2 mt-10 font-display text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink">
          <WordMask text="Where I've shipped." />
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left rail (col 1–3): progress track with mono indices */}
          <aside className="relative hidden lg:col-span-3 lg:block">
            {/* Track + volt fill */}
            <div aria-hidden className="absolute bottom-2 left-0 top-2 w-px bg-line" />
            <div
              ref={fillRef}
              aria-hidden
              className="absolute bottom-2 left-0 top-2 w-px origin-top bg-volt"
              style={{ transform: 'scaleY(0)' }}
            />
            <div className="pl-8">
              {ROLES.map((role, i) => (
                <RailItem
                  key={role.index}
                  index={role.index}
                  label={role.rail}
                  active={activeIdx === i}
                />
              ))}
            </div>
          </aside>

          {/* Right stage (col 4–12): one panel visible at a time */}
          <div ref={stageRef} className="relative lg:col-span-9">
            {ROLES.map((role) => (
              <RolePanel key={role.index} role={role} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
