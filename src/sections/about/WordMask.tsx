import { Fragment } from 'react'

interface WordMaskProps {
  text: string
  className?: string
}

/**
 * Word-level mask reveal helper. Each word sits in an overflow-hidden mask;
 * inner spans carry the `.wm-word` class so section GSAP timelines can
 * slide them up (yPercent 110 -> 0, stagger 0.04s). Scoped via useGSAP.
 * Spaces live outside the masks so they survive inline-block collapsing.
 */
export default function WordMask({ text, className = '' }: WordMaskProps) {
  const words = text.split(' ')
  return (
    <span className={className}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
            <span className="wm-word inline-block will-change-transform">{word}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  )
}
