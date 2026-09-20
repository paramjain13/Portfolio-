import { useState } from 'react'
import Layout from '@/components/Layout'
import Loader from '@/components/Loader'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Marquee from '@/components/Marquee'
import Footer from '@/components/Footer'
import About from '@/sections/About'
import Skills from '@/sections/Skills'
import Experience from '@/sections/Experience'
import Projects from '@/sections/Projects'
import Publications from '@/sections/Publications'
import Contact from '@/sections/Contact'

export default function Home() {
  // `revealed` fires as the loader curtains begin to exit; hero/nav start then.
  const [revealed, setRevealed] = useState(false)

  return (
    <>
      <Loader onReveal={() => setRevealed(true)} onDone={() => {}} />
      <Layout>
        <Navbar revealed={revealed} />
        <main>
          <Hero revealed={revealed} />
          <Marquee />
          <About />
          <Skills />
          <Experience />
          <Projects />
          <Publications />
          <Contact />
        </main>
        <Footer />
      </Layout>
    </>
  )
}
