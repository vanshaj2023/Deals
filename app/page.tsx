'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { gsap } from 'gsap'
import HeroCarousel from '@/components/HeroCarousel'
import { useSession } from 'next-auth/react'

const Home = () => {
  const { status } = useSession()
  const router = useRouter()
  const isSignedIn = status === 'authenticated'

  const textRef = useRef(null)
  const imageRef = useRef(null)
  const subTextRef = useRef(null)
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } })

    tl.fromTo(
      textRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, delay: 0.5 }
    )
      .fromTo(
        imageRef.current,
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 1 },
        '-=0.5'
      )
      .fromTo(
        subTextRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1 },
        '-=0.5'
      )
      .fromTo(
        heroRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1 },
        '-=0.5'
      )
      .fromTo(
        featuresRef.current,
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 1 },
        '-=0.5'
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1 },
        '-=0.5'
      )
  }, [])

  const handleButtonClick = () => {
    if (!isSignedIn) {
      router.push('/login')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <>
      <section className="px-6 md:px-20 py-24">
        <div className="flex max-xl:flex-col gap-16">
          <div className="flex flex-col justify-center">
            <p className="small-text" ref={subTextRef}>
              Smart Shopping Starts Here:
              <Image
                src="/assets/icons/arrow-right.svg"
                alt="arrow-right"
                width={16}
                height={16}
                ref={imageRef}
              />
            </p>

            <h1 className="head-text" ref={textRef}>
              Unleash the Power of
              <span className="text-primary"> PriceIQ</span>
            </h1>

            <p className="mt-6" ref={subTextRef}>
              Powerful, self-serve product and growth analytics to help you convert, engage, and retain more.
            </p>
          </div>

          <div ref={heroRef}>
            <HeroCarousel />
          </div>
        </div>
      </section>

      <section className="features-section px-6 md:px-20 py-12" ref={featuresRef}>
        <h2 className="section-text">Our Features</h2>
        <ul className="list-disc pl-6 mt-4">
          <li>Advanced Analytics</li>
          <li>Real-time Data Tracking</li>
          <li>User-Friendly Interface</li>
          <li>Customizable Reports</li>
        </ul>
      </section>

      <section className="cta-section px-6 md:px-20 py-12" ref={ctaRef}>
        <div className="flex flex-col items-center">
          <h2 className="section-text text-center">Get Started with PriceIQ Today!</h2>
          <button
            className="bg-primary hover:bg-primary-100 text-white font-bold py-2 px-4 rounded-full mt-6"
            onClick={handleButtonClick}
          >
            {isSignedIn ? 'Go to Deals' : 'Sign In'}
          </button>
          <button className="bg-primary hover:bg-primary-100 text-white font-bold py-2 px-4 rounded-full mt-6" onClick={() => router.push('/trending')}>
            See Trending Products
          </button>
        </div>
      </section>
    </>
  )
}

export default Home
