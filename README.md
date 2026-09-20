<div align="center">

# Param Jain · Portfolio

**[paramjain.vercel.app](https://paramjain.vercel.app/)**

A dark, motion-rich single-page portfolio for an AI/ML engineer ·
built around one idea: *systems that catch their own failures.*

</div>

---

## ✨ Highlights

- **Loader** · % counter with a scramble-decode name reveal and a twin-curtain exit
- **Interactive hero** · 2,200-particle Three.js constellation that reacts to the cursor
- **Velocity-reactive marquee** · speeds up and reverses with your scroll
- **Custom cursor + magnetic buttons** · morphing ring with contextual labels
- **Animated stat counters** · flicker-then-count metrics (10,000+ events/sec, 30K+ users…)
- **Pinned experience rail** · scroll-scrubbed timeline of roles
- **Live footer clock** · Boston time, always ticking
- Fully responsive · `prefers-reduced-motion` fallbacks throughout

## 🛠️ Stack

| Layer | Tech |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS · shadcn/ui |
| Animation | GSAP + ScrollTrigger · Framer Motion · Lenis smooth scroll |
| 3D | Three.js · React Three Fiber |
| Fonts | Space Grotesk · Inter · JetBrains Mono |
| Hosting | Vercel (auto-deploys from `main`) |

## 🚀 Local development

```bash
npm install
npm run dev      # dev server
npm run build    # production build → dist/
```

## 📁 Structure

```
src/
├── components/     # Navbar, Footer, CustomCursor, MagneticButton, ParticleField, Loader…
├── sections/       # About, Skills, Experience, Projects, Publications, Contact
├── pages/Home.tsx  # Single-page composition
└── lib/scroll.ts   # Lenis + ScrollTrigger singleton
```

---

<div align="center">
Built by <a href="https://github.com/paramjain13">Param Jain</a> · Boston, MA
</div>
