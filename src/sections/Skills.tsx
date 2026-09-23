import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '@/lib/scroll'
import SectionEyebrow from '@/components/SectionEyebrow'
import WordMask from '@/sections/about/WordMask'
import SkillChip from '@/sections/skills/SkillChip'

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface SkillRow {
  title: string
  skills: { name: string; core?: boolean }[]
}

const ROWS: SkillRow[] = [
  {
    title: 'LANGUAGES',
    skills: [
      { name: 'Python', core: true },
      { name: 'Java' },
      { name: 'C++' },
      { name: 'C' },
      { name: 'TypeScript' },
      { name: 'JavaScript' },
      { name: 'SQL', core: true },
      { name: 'Bash' },
      { name: 'Rust' },
    ],
  },
  {
    title: 'ML / AI',
    skills: [
      { name: 'PyTorch', core: true },
      { name: 'TensorFlow' },
      { name: 'scikit-learn', core: true },
      { name: 'Pandas' },
      { name: 'NumPy' },
      { name: 'LangGraph', core: true },
      { name: 'LangChain' },
      { name: 'RAG' },
      { name: 'Multi-Agent Systems' },
      { name: 'Claude API' },
      { name: 'OpenAI API' },
      { name: 'GPT-4' },
      { name: 'Pinecone' },
      { name: 'Prompt Engineering' },
      { name: 'LLM Evaluation' },
    ],
  },
  {
    title: 'DATA',
    skills: [
      { name: 'Kafka', core: true },
      { name: 'PostgreSQL' },
      { name: 'MySQL' },
      { name: 'MongoDB' },
      { name: 'Airflow' },
      { name: 'ETL' },
      { name: 'Grafana' },
      { name: 'BigQuery' },
      { name: 'n8n' },
    ],
  },
  {
    title: 'WEB / CLOUD',
    skills: [
      { name: 'React' },
      { name: 'Next.js' },
      { name: 'FastAPI' },
      { name: 'Flask' },
      { name: 'REST APIs' },
      { name: 'Docker', core: true },
      { name: 'CI/CD' },
      { name: 'GitHub Actions' },
      { name: 'Git' },
      { name: 'AWS (S3, Lambda, EC2)', core: true },
      { name: 'Linux' },
    ],
  },
]

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null)
  const ghostRef = useRef<HTMLDivElement>(null)
  // Row whose header is hovered · all other rows dim to 40% opacity.
  const [hovered, setHovered] = useState<number | null>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(sectionRef)

      // Rows enter staggered: y-40 + fade 0.6s, stagger 0.12s (top 80%).
      gsap.fromTo(
        q('.skill-row'),
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          stagger: 0.12,
          scrollTrigger: { trigger: q('.skill-rows')[0], start: 'top 80%', once: true },
        },
      )

      // Chips cascade per row: opacity 0 -> 1, scale 0.9 -> 1, stagger 0.03s.
      gsap.fromTo(
        q('.skill-chip'),
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'expo.out',
          stagger: 0.03,
          scrollTrigger: { trigger: q('.skill-rows')[0], start: 'top 80%', once: true },
        },
      )

      // H2 word mask reveal.
      gsap.fromTo(
        q('.skills-h2 .wm-word'),
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.04,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
        },
      )

      // Ghost text parallax (0.9x scroll speed feel).
      if (ghostRef.current) {
        gsap.fromTo(
          ghostRef.current,
          { yPercent: 12 },
          {
            yPercent: -12,
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

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative mx-auto max-w-[1280px] overflow-hidden px-[clamp(20px,5vw,80px)] py-[clamp(96px,14vh,180px)]"
    >
      {/* Giant ghost text behind the rows */}
      <div
        ref={ghostRef}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[20vw] font-bold uppercase leading-none text-surface-2"
      >
        SKILLS
      </div>

      <div className="relative">
        <SectionEyebrow index="02" label="SKILLS" />

        <h2 className="skills-h2 mt-12 font-display text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink">
          <WordMask text="Tools I reach for." />
        </h2>

        <div className="skill-rows mt-16">
          {ROWS.map((row, i) => (
            <div
              key={row.title}
              className={`skill-row grid grid-cols-1 gap-6 border-t border-line py-10 transition-opacity duration-300 lg:grid-cols-12 ${
                hovered !== null && hovered !== i ? 'opacity-40' : 'opacity-100'
              }`}
            >
              {/* Row header · mono volt index + Space Grotesk title */}
              <div
                className="lg:col-span-3"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="font-mono text-xs font-medium tracking-[0.08em] text-volt">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 font-display text-[clamp(1.25rem,2.2vw,1.75rem)] font-medium tracking-[-0.01em] text-ink">
                  {row.title}
                </h3>
              </div>

              {/* Chip field */}
              <div className="flex flex-wrap items-start content-start gap-2.5 lg:col-span-9">
                {row.skills.map((s) => (
                  <SkillChip key={s.name} name={s.name} core={s.core} />
                ))}
              </div>
            </div>
          ))}
          <div className="border-t border-line" aria-hidden />
        </div>
      </div>
    </section>
  )
}
