'use client'

import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { useSession } from 'next-auth/react'

const Home = () => {
  const { status } = useSession()
  const router = useRouter()
  const isSignedIn = status === 'authenticated'

  const textRef = useRef(null)
  const subTextRef = useRef(null)
  const featuresRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } })
    tl.fromTo(textRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: 0.5 })
      .fromTo(subTextRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 }, '-=0.5')
      .fromTo(featuresRef.current, { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 1 }, '-=0.5')
      .fromTo(ctaRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 }, '-=0.5')
  }, [])

  return (
    <>
      <section className="px-6 md:px-20 py-24">
        <div className="flex flex-col justify-center max-w-2xl">
          <p className="small-text" ref={subTextRef}>
            Smart Shopping Starts Here
          </p>
          <h1 className="head-text" ref={textRef}>
            Unleash the Power of
            <span className="text-primary"> PriceIQ</span>
          </h1>
          <p className="mt-6">
            Track prices across Amazon, Myntra, and Flipkart. Get alerted the moment your target price is hit.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-20 py-12" ref={featuresRef}>
        <h2 className="section-text">Our Features</h2>
        <ul className="list-disc pl-6 mt-4">
          <li>Multi-site price tracking</li>
          <li>Target price alerts via Email &amp; Telegram</li>
          <li>Full price history charts</li>
          <li>Free — powered by GitHub Actions</li>
        </ul>
      </section>

      <section className="px-6 md:px-20 py-12" ref={ctaRef}>
        <div className="flex flex-col items-start gap-4">
          <button
            className="bg-primary hover:bg-primary-100 text-white font-bold py-2 px-6 rounded-full"
            onClick={() => router.push(isSignedIn ? '/dashboard' : '/login')}
          >
            {isSignedIn ? 'Go to Dashboard' : 'Get Started'}
          </button>
        </div>
      </section>
    </>
  )
}

export default Home
