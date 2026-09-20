interface SectionEyebrowProps {
  index: string
  label: string
  className?: string
}

/** Mono eyebrow that opens every section: `// 01 · ABOUT` in volt on a muted rule line. */
export default function SectionEyebrow({ index, label, className = '' }: SectionEyebrowProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="whitespace-nowrap font-mono text-xs font-medium uppercase tracking-[0.08em] text-volt">
        {'// '}
        {index} · {label}
      </span>
      <span className="h-px flex-1 bg-line" aria-hidden />
    </div>
  )
}
