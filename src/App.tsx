import { motion } from "framer-motion"

const rise = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export default function App() {
  return (
    <main className="min-h-dvh bg-ground text-ink flex flex-col justify-center px-6 sm:px-10 lg:px-20 py-20">
      <div className="w-full max-w-5xl mx-auto">

        <motion.p
          custom={0} initial="hidden" animate="show" variants={rise}
          className="font-mono text-xs sm:text-sm text-muted tracking-wider mb-8 flex items-center gap-3"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-hot animate-pulse" />
          [00:00] node=intake status=running
        </motion.p>

        <motion.h1
          custom={1} initial="hidden" animate="show" variants={rise}
          className="font-display font-extrabold leading-[0.9] tracking-[-0.03em] text-[clamp(3rem,11vw,7.5rem)]"
        >
          PARAM<br />JAIN
        </motion.h1>

        <motion.p
          custom={2} initial="hidden" animate="show" variants={rise}
          className="mt-8 text-lg sm:text-xl leading-relaxed text-ink/85 max-w-2xl"
        >
          I build LLM agents that plan, execute, and correct themselves — and the
          evaluation harnesses that prove whether they actually work.
        </motion.p>

        <motion.div
          custom={3} initial="hidden" animate="show" variants={rise}
          className="mt-12 pt-6 border-t border-line font-mono text-xs sm:text-sm text-muted flex flex-wrap gap-x-8 gap-y-3"
        >
          <span>
            BIRD-SQL Mini-Dev <span className="text-verified">64.4% EX</span>
          </span>
          <span>
            <span className="text-verified">1.0</span> LLM calls/query
          </span>
          <span>MS CS · Northeastern · Dec 2027</span>
        </motion.div>

      </div>
    </main>
  )
}
