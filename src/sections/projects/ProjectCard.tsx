import { motion } from 'framer-motion'

export interface ProjectCardProps {
  cover: string
  title: string
  tags: string[]
  description: string
  stat: string
  statLabel: string
  date: string
  repoUrl: string
}

/**
 * Standard project card · cover (3:2) → tag row → title → 2-line description →
 * bottom row with volt mono stat + GHOST repo link. Hover: lift −6px (FM spring
 * 260/20), border → volt, cover scales 1.05 with grayscale → color shift,
 * volt scan-line sweep, custom cursor expands to 3.2x with "REPO ↗" label.
 */
export default function ProjectCard({
  cover,
  title,
  tags,
  description,
  stat,
  statLabel,
  date,
  repoUrl,
}: ProjectCardProps) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="proj-grid-card group relative flex flex-col overflow-hidden rounded-lg border border-line bg-surface transition-colors duration-300 hover:border-volt/60"
    >
      {/* instrument corner ticks */}
      <span aria-hidden className="pointer-events-none absolute left-2 top-2 z-10 font-mono text-xs text-muted">+</span>
      <span aria-hidden className="pointer-events-none absolute right-2 top-2 z-10 font-mono text-xs text-muted">+</span>

      <a
        href={repoUrl}
        target="_blank"
        rel="noreferrer noopener"
        data-cursor="media"
        data-cursor-label="REPO ↗"
        aria-label={`${title} · GitHub repository`}
        className="relative block aspect-[3/2] overflow-hidden border-b border-line"
      >
        <img
          src={cover}
          alt={`${title} cover art`}
          loading="lazy"
          className="h-full w-full object-cover grayscale-[45%] transition-all duration-500 ease-out group-hover:scale-105 group-hover:grayscale-0"
        />
        {/* volt scan-line sweep on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/3 -translate-y-[150%] bg-gradient-to-b from-transparent via-volt/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-y-[350%]"
        />
      </a>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
            {tags.join(' · ')}
          </p>
          <p className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.08em] text-muted/70">
            {date}
          </p>
        </div>
        <h3 className="font-display text-xl font-semibold tracking-[-0.01em] text-ink">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
          <p className="font-mono text-xs uppercase tracking-[0.08em]">
            <span className="font-bold tabular-nums text-volt">{stat}</span>{' '}
            <span className="text-muted">{statLabel}</span>
          </p>
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer noopener"
            data-cursor="link"
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted transition-colors duration-200 hover:text-volt"
          >
            GITHUB <span className="text-volt">↗</span>
          </a>
        </div>
      </div>
    </motion.article>
  )
}
