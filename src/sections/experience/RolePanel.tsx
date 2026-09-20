export interface BulletPart {
  t: string
  /** True = key metric, rendered in volt mono. */
  v?: boolean
}

export interface Role {
  index: string
  title: string
  company: string
  /** Short mono label for the progress rail. */
  rail: string
  dates: string
  bullets: BulletPart[][]
}

interface RolePanelProps {
  role: Role
}

/**
 * One experience panel · surface card with mono volt date range, Space
 * Grotesk role title, muted company, and bullet metrics led by volt `▸`.
 * Panels render as static stacked cards by default; the desktop pinned
 * context repositions them absolutely into the stage via GSAP.
 */
export default function RolePanel({ role }: RolePanelProps) {
  return (
    <article className="exp-panel mt-8 rounded-lg border border-line bg-surface p-6 first:mt-0 md:p-8">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-volt">
        {role.dates}
      </p>
      <h3 className="mt-3 font-display text-[clamp(1.25rem,2.2vw,1.75rem)] font-semibold tracking-[-0.01em] text-ink">
        {role.title}
      </h3>
      <p className="mt-1 font-sans text-sm text-muted">{role.company}</p>

      <ul className="mt-6 space-y-3.5">
        {role.bullets.map((parts, i) => (
          <li key={i} className="exp-bullet flex gap-3 font-sans text-[15px] leading-[1.65] text-muted">
            <span aria-hidden className="mt-[1px] shrink-0 text-volt">
              ▸
            </span>
            <span>
              {parts.map((p, j) =>
                p.v ? (
                  <span key={j} className="font-mono text-[0.92em] text-volt">
                    {p.t}
                  </span>
                ) : (
                  <span key={j}>{p.t}</span>
                ),
              )}
            </span>
          </li>
        ))}
      </ul>
    </article>
  )
}
