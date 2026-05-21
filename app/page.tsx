'use client'

import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  TrendingDown, Bell, BarChart3, Zap, Shield, ArrowRight, Star,
  ChevronRight, CheckCircle2, Sparkles
} from 'lucide-react'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  { n: '01', title: 'Paste a product URL', desc: 'Copy any link from Amazon, Myntra, or Flipkart.' },
  { n: '02', title: 'Set your target price', desc: 'Tell us your price. We default to 10% below current.' },
  { n: '03', title: 'We watch it for you', desc: 'Our scraper checks prices every few hours automatically.' },
  { n: '04', title: 'Get the alert', desc: 'Email the moment your target price is hit. Done.' },
]

export default function Home() {
  const { status } = useSession()
  const router = useRouter()
  const isSignedIn = status === 'authenticated'

  const badgeRef = useRef<HTMLDivElement>(null)
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const mockupRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo(badgeRef.current,  { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45 })
      .fromTo(h1Ref.current,     { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.2')
      .fromTo(subRef.current,    { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
      .fromTo(ctaRef.current,    { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4 }, '-=0.25')
      .fromTo(mockupRef.current, { opacity: 0, x: 24, rotateY: -12 }, { opacity: 1, x: 0, rotateY: -6, duration: 0.8, ease: 'power2.out' }, '-=0.5')

    if (stepsRef.current) {
      gsap.fromTo(stepsRef.current.querySelectorAll('.step-card'), { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 0.45, stagger: 0.1,
        scrollTrigger: { trigger: stepsRef.current, start: 'top 82%' },
      })
    }
    if (featuresRef.current) {
      gsap.fromTo(featuresRef.current.querySelectorAll('.feat-card'), { opacity: 0, y: 24 }, {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.08,
        scrollTrigger: { trigger: featuresRef.current, start: 'top 82%' },
      })
    }

    return () => { ScrollTrigger.getAll().forEach((t) => t.kill()) }
  }, [])

  return (
    <div
      className="relative overflow-hidden"
      style={{ background: 'var(--bg)', minHeight: '100vh' }}
    >
      {/* Dot grid background */}
      <div className="dot-grid absolute inset-0 opacity-[0.35] pointer-events-none" />

      {/* Gradient orbs */}
      <div className="glowing-blob" style={{ top: '-8%', right: '8%', width: 560, height: 560, background: 'radial-gradient(circle, rgba(14,165,233,0.09) 0%, transparent 70%)', opacity: 1 }} />
      <div className="glowing-blob" style={{ bottom: '20%', left: '-8%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%)', opacity: 1 }} />
      <div className="glowing-blob" style={{ top: '40%', right: '-5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)', opacity: 1 }} />

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-14 items-center min-h-[92vh]">

        {/* Left: copy */}
        <div className="flex flex-col items-start">

          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-7"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid rgba(14,165,233,0.2)' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
            </span>
            Live price tracking across Amazon, Myntra, Flipkart
          </div>

          <h1
            ref={h1Ref}
            className="font-extrabold font-spaceGrotesk leading-[1.06] mb-5 tracking-tight will-anim"
            style={{ fontSize: 'clamp(2.6rem, 5.2vw, 4rem)', color: 'var(--text)' }}
          >
            Never miss a<br />
            <span
              className="relative bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-600 bg-clip-text text-transparent"
            >
              price drop
            </span>{' '}
            again.
          </h1>

          <p
            ref={subRef}
            className="text-lg leading-relaxed mb-8 max-w-md will-anim"
            style={{ color: 'var(--muted)', fontWeight: 420 }}
          >
            Track any product on Amazon, Myntra or Flipkart. Set your price target once and
            we&apos;ll email you the exact moment it drops. No app, no subscription, no noise.
          </p>

          <div ref={ctaRef} className="flex items-center gap-3 mb-10 will-anim flex-wrap">
            <button
              onClick={() => router.push(isSignedIn ? '/dashboard' : '/login')}
              className="btn-filled !h-12 !px-7 !text-[0.9375rem]"
            >
              {isSignedIn ? 'Go to dashboard' : 'Start tracking for free'}
              <ArrowRight size={17} />
            </button>
            {!isSignedIn && (
              <Link href="/register" className="btn-outlined !h-12 !px-6 !text-[0.9375rem]">
                Create account
              </Link>
            )}
          </div>

          {/* Trust proof */}
          <div className="flex flex-col gap-2">
            {[
              'No credit card required',
              'Free forever, zero spam',
              'Works on Amazon, Myntra, Flipkart',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: browser mockup */}
        <div
          className="relative hidden lg:block will-anim"
          style={{ perspective: '1200px' }}
        >
          <div
            ref={mockupRef}
            style={{ transform: 'rotateY(-6deg) rotateX(3deg)', transformStyle: 'preserve-3d' }}
          >
            {/* Glow behind the browser */}
            <div
              className="absolute -inset-6 rounded-3xl pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(14,165,233,0.12) 0%, transparent 70%)', filter: 'blur(20px)' }}
            />

            {/* Browser chrome */}
            <div
              className="relative rounded-2xl overflow-hidden border"
              style={{ background: 'white', borderColor: 'rgba(226,232,240,0.9)', boxShadow: 'var(--shadow-hero)' }}
            >
              {/* Browser toolbar */}
              <div
                className="flex items-center gap-3 px-4 h-10 border-b"
                style={{ background: '#F8FAFC', borderColor: '#E2E8F0' }}
              >
                <div className="flex gap-1.5 flex-shrink-0">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <div
                  className="flex-1 h-6 rounded-md flex items-center px-2.5 gap-1.5 border"
                  style={{ background: 'white', borderColor: '#E2E8F0' }}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#28C840' }} />
                  <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500 }}>priceiq.app/dashboard</span>
                </div>
              </div>

              {/* App UI mockup */}
              <div className="flex" style={{ height: 380, background: '#F8FAFC' }}>

                {/* Mini sidebar */}
                <div
                  className="flex flex-col p-2.5 gap-1 border-r flex-shrink-0"
                  style={{ width: 144, background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(226,232,240,0.8)' }}
                >
                  <div className="flex items-center gap-1.5 px-2 h-8 mb-2">
                    <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F0F9FF' }}>
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#0EA5E9' }} />
                    </div>
                    <div className="h-2 w-14 rounded-full" style={{ background: '#1E293B' }} />
                  </div>
                  {/* Active nav */}
                  <div className="h-8 rounded-lg flex items-center gap-1.5 px-2 border" style={{ background: '#F0F9FF', borderColor: 'rgba(14,165,233,0.15)' }}>
                    <div className="w-2.5 h-2.5 rounded flex-shrink-0" style={{ background: '#0EA5E9' }} />
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: '#BAE6FD' }} />
                  </div>
                  {[1,2].map((i) => (
                    <div key={i} className="h-8 rounded-lg flex items-center gap-1.5 px-2">
                      <div className="w-2.5 h-2.5 rounded flex-shrink-0" style={{ background: '#E2E8F0' }} />
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: '#E2E8F0' }} />
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Top bar */}
                  <div className="flex items-center justify-between px-3 h-12 border-b flex-shrink-0" style={{ background: 'rgba(255,255,255,0.8)', borderColor: 'rgba(226,232,240,0.7)' }}>
                    <div>
                      <div className="h-2 w-28 rounded-full mb-1.5" style={{ background: '#0F172A' }} />
                      <div className="h-1.5 w-20 rounded-full" style={{ background: '#CBD5E1' }} />
                    </div>
                    <div className="h-7 px-3 rounded-lg flex items-center gap-1.5" style={{ background: 'linear-gradient(135deg,#0EA5E9,#38BDF8)' }}>
                      <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.7)' }} />
                      <div className="h-1.5 w-10 rounded-full" style={{ background: 'rgba(255,255,255,0.8)' }} />
                    </div>
                  </div>

                  {/* Stats bar */}
                  <div className="flex items-center gap-2 px-3 h-9 border-b flex-shrink-0" style={{ borderColor: 'rgba(226,232,240,0.5)' }}>
                    <div className="h-5 px-2.5 rounded-lg flex items-center gap-1 border" style={{ background: '#F0F9FF', borderColor: 'rgba(14,165,233,0.15)' }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#0EA5E9' }} />
                      <div className="h-1.5 w-10 rounded-full" style={{ background: '#BAE6FD' }} />
                    </div>
                    <div className="h-5 px-2.5 rounded-lg flex items-center gap-1 border" style={{ background: '#ECFDF5', borderColor: 'rgba(16,185,129,0.15)' }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
                      <div className="h-1.5 w-12 rounded-full" style={{ background: '#A7F3D0' }} />
                    </div>
                  </div>

                  {/* Product cards */}
                  <div className="flex-1 p-3 grid grid-cols-3 gap-2 overflow-hidden">
                    {[
                      { emoji: '📱', disc: '18%', target: false },
                      { emoji: '👟', disc: '32%', target: true },
                      { emoji: '🎧', disc: '7%', target: false },
                    ].map((card, i) => (
                      <div key={i} className="bg-white rounded-xl border overflow-hidden flex flex-col" style={{ borderColor: card.target ? 'rgba(16,185,129,0.3)' : 'rgba(226,232,240,0.8)', boxShadow: card.target ? '0 0 0 1px rgba(16,185,129,0.12)' : 'none' }}>
                        <div className="flex items-center justify-center relative flex-1" style={{ minHeight: 72, background: '#F8FAFC' }}>
                          <span style={{ fontSize: 26 }}>{card.emoji}</span>
                          <div className="absolute top-1.5 left-1.5 px-1 py-0.5 rounded text-[7px] font-extrabold" style={{ background: '#FEF3C7', color: '#92400E' }}>-{card.disc}</div>
                          {card.target && <div className="absolute top-1.5 right-1.5 px-1 py-0.5 rounded text-[7px] font-extrabold" style={{ background: '#D1FAE5', color: '#065F46' }}>Target!</div>}
                        </div>
                        <div className="p-2">
                          <div className="h-1.5 w-full rounded-full mb-1" style={{ background: '#E2E8F0' }} />
                          <div className="h-1.5 w-2/3 rounded-full mb-2" style={{ background: '#E2E8F0' }} />
                          <div className="flex items-center justify-between">
                            <div className="h-2.5 w-10 rounded-full" style={{ background: '#1E293B' }} />
                            <div className="h-2.5 w-8 rounded-full" style={{ background: card.target ? '#D1FAE5' : '#F1F5F9' }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating: price alert */}
          <div
            className="absolute -bottom-5 -left-8 z-20 flex items-center gap-3 px-4 py-3 rounded-2xl border"
            style={{ background: 'white', borderColor: 'rgba(226,232,240,0.9)', boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ECFDF5' }}>
              <Bell size={16} style={{ color: '#10B981' }} />
            </div>
            <div>
              <p className="text-xs font-bold leading-none mb-0.5" style={{ color: 'var(--text)' }}>Price dropped to target!</p>
              <p style={{ fontSize: 10, color: 'var(--muted)' }}>OnePlus Nord CE4 · ₹17,499</p>
            </div>
            <div className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: '#ECFDF5', color: '#10B981' }}>Now</div>
          </div>

          {/* Floating: savings */}
          <div
            className="absolute -top-4 -right-6 z-20 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border"
            style={{ background: 'white', borderColor: 'rgba(226,232,240,0.9)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
          >
            <TrendingDown size={14} style={{ color: '#10B981' }} />
            <div>
              <p style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1 }}>Saved this month</p>
              <p className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>₹8,340</p>
            </div>
          </div>

          {/* Floating: live indicator */}
          <div
            className="absolute top-14 -left-5 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
            style={{ background: 'white', borderColor: 'rgba(226,232,240,0.9)', boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)' }}>Live tracking</span>
          </div>
        </div>
      </section>


      {/* ── How it works ── */}
      <section className="px-6 md:px-16 py-24 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <p className="section-label mb-3">
            <Zap size={12} /> How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold font-spaceGrotesk tracking-tight" style={{ color: 'var(--text)' }}>
            From URL to alert in 30 seconds
          </h2>
        </div>

        {/* Steps with connecting line */}
        <div ref={stepsRef} className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Connecting line — desktop only */}
          <div
            className="absolute hidden lg:block top-7 left-[12.5%] right-[12.5%] h-px pointer-events-none z-0"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.3) 20%, rgba(14,165,233,0.3) 80%, transparent)' }}
          />

          {STEPS.map(({ n, title, desc }) => (
            <div key={n} className="step-card relative z-10 flex flex-col gap-3 will-anim">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1 border"
                style={{ background: 'white', borderColor: 'rgba(14,165,233,0.15)', boxShadow: '0 4px 16px rgba(14,165,233,0.08)' }}
              >
                <span className="text-xl font-extrabold font-spaceGrotesk" style={{ color: 'var(--accent)' }}>{n}</span>
              </div>
              <p className="text-base font-bold" style={{ color: 'var(--text)' }}>{title}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features: Bento grid ── */}
      <section
        className="px-6 md:px-16 py-24 border-y relative z-10"
        style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)', borderColor: 'rgba(226,232,240,0.7)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">
              <Sparkles size={12} /> Features
            </p>
            <h2 className="text-3xl md:text-4xl font-bold font-spaceGrotesk tracking-tight" style={{ color: 'var(--text)' }}>
              Everything you need to buy smarter
            </h2>
          </div>

          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Big card 1: Multi-site tracking — spans 2 cols */}
            <div className="feat-card md:col-span-2 card p-7 will-anim relative overflow-hidden" style={{ background: 'white', minHeight: 200 }}>
              <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)' }} />
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 border" style={{ background: '#F0F9FF', borderColor: 'rgba(14,165,233,0.15)' }}>
                <TrendingDown size={20} style={{ color: '#0EA5E9' }} />
              </div>
              <p className="text-base font-bold mb-2" style={{ color: 'var(--text)' }}>Multi-site tracking</p>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--muted)' }}>
                Track prices across Amazon, Myntra and Flipkart from one place. One dashboard, all your watchlist.
              </p>
              <div className="flex gap-2 flex-wrap">
                {['Amazon', 'Myntra', 'Flipkart'].map((s) => (
                  <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold" style={{ background: '#F8FAFC', borderColor: 'rgba(226,232,240,0.9)', color: 'var(--text-secondary)' }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Small card: Instant alerts */}
            <div className="feat-card card p-6 will-anim relative overflow-hidden" style={{ background: 'white' }}>
              <div className="absolute -right-4 -top-4 w-28 h-28 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)' }} />
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 border" style={{ background: '#EFF6FF', borderColor: 'rgba(37,99,235,0.12)' }}>
                <Bell size={20} style={{ color: '#2563EB' }} />
              </div>
              <p className="text-base font-bold mb-2" style={{ color: 'var(--text)' }}>Instant price alerts</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                Set a target price and get an email the exact moment it&apos;s hit. Zero manual checking.
              </p>
            </div>

            {/* Small card: No spam */}
            <div className="feat-card card p-6 will-anim relative overflow-hidden" style={{ background: 'white' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 border" style={{ background: '#F5F3FF', borderColor: 'rgba(124,58,237,0.12)' }}>
                <Shield size={20} style={{ color: '#7C3AED' }} />
              </div>
              <p className="text-base font-bold mb-2" style={{ color: 'var(--text)' }}>No spam, ever</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                24-hour alert cooldown per product. You hear from us only when it matters.
              </p>
            </div>

            {/* Big card 2: Price history — spans 2 cols */}
            <div className="feat-card md:col-span-2 card p-7 will-anim relative overflow-hidden" style={{ background: 'white' }}>
              <div className="absolute -left-4 -bottom-4 w-36 h-36 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)' }} />
              <div className="flex gap-4 items-start">
                <div>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 border" style={{ background: '#ECFDF5', borderColor: 'rgba(16,185,129,0.15)' }}>
                    <BarChart3 size={20} style={{ color: '#10B981' }} />
                  </div>
                  <p className="text-base font-bold mb-2" style={{ color: 'var(--text)' }}>Full price history</p>
                  <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--muted)' }}>
                    See exactly how a price has moved over time before deciding to buy. Every data point, charted.
                  </p>
                </div>
                {/* Mini chart illustration */}
                <div className="hidden sm:block flex-shrink-0 ml-auto">
                  <svg width="130" height="64" viewBox="0 0 130 64" fill="none">
                    <path d="M0 56 L18 48 L36 52 L54 38 L72 28 L90 20 L108 10 L130 4" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M0 56 L18 48 L36 52 L54 38 L72 28 L90 20 L108 10 L130 4 L130 64 L0 64Z" fill="url(#chartGrad)" />
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Data point */}
                    <circle cx="90" cy="20" r="4" fill="#10B981" />
                    <circle cx="90" cy="20" r="7" fill="#10B981" opacity="0.2" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Small card: Zap */}
            <div className="feat-card card p-6 will-anim relative overflow-hidden" style={{ background: 'white' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 border" style={{ background: '#FFFBEB', borderColor: 'rgba(217,119,6,0.12)' }}>
                <Zap size={20} style={{ color: '#D97706' }} />
              </div>
              <p className="text-base font-bold mb-2" style={{ color: 'var(--text)' }}>Auto re-checks</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                Prices scraped every few hours automatically. Set it once, forget it.
              </p>
            </div>

            {/* Small card: AI */}
            <div className="feat-card card p-6 will-anim relative overflow-hidden" style={{ background: 'white' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 border" style={{ background: '#FEF2F2', borderColor: 'rgba(239,68,68,0.12)' }}>
                <Star size={20} style={{ color: '#EF4444' }} />
              </div>
              <p className="text-base font-bold mb-2" style={{ color: 'var(--text)' }}>AI product summaries</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                One-line AI summary of any product so you know what you&apos;re buying before clicking.
              </p>
            </div>

            {/* Wide card: CTA teaser */}
            <div
              className="feat-card md:col-span-1 card p-7 will-anim relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #F0F9FF 0%, #EFF6FF 100%)', border: '1px solid rgba(14,165,233,0.14)' }}
            >
              <p className="text-base font-extrabold mb-2 font-spaceGrotesk" style={{ color: 'var(--text)' }}>
                Ready to start?
              </p>
              <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>
                Free forever. Track your first product in under a minute.
              </p>
              <button
                onClick={() => router.push(isSignedIn ? '/dashboard' : '/login')}
                className="btn-filled !h-9 !px-5 !text-xs"
              >
                Get started <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-6 md:px-16 py-24 max-w-7xl mx-auto relative z-10">
        <div
          className="rounded-3xl px-10 py-16 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #0C2340 50%, #0F172A 100%)',
            boxShadow: '0 24px 80px rgba(14,165,233,0.15)',
          }}
        >
          {/* Orbs inside dark card */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)', transform: 'translate(-20%, 20%)' }} />

          <p className="section-label mb-4 relative z-10" style={{ color: '#38BDF8' }}>
            <Sparkles size={12} /> Start today
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold font-spaceGrotesk mb-4 tracking-tight relative z-10"
            style={{ color: 'white' }}
          >
            Ready to stop overpaying?
          </h2>
          <p className="text-lg mb-8 max-w-md mx-auto relative z-10" style={{ color: 'rgba(148,163,184,0.9)' }}>
            Add your first product in under a minute. It&apos;s free and always will be.
          </p>
          <button
            onClick={() => router.push(isSignedIn ? '/dashboard' : '/login')}
            className="btn-filled !h-12 !px-10 !text-[0.9375rem] relative z-10"
            style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)', boxShadow: '0 8px 32px rgba(14,165,233,0.35)' }}
          >
            {isSignedIn ? 'Go to dashboard' : 'Get started, it\'s free'}
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="border-t px-6 md:px-16 py-10 relative z-10"
        style={{ borderColor: 'var(--border)', background: 'rgba(255,255,255,0.6)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold font-spaceGrotesk text-lg" style={{ color: 'var(--text)' }}>
              Price<span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">IQ</span>
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
              Track smarter, buy better.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-semibold transition-colors hover:text-sky-600" style={{ color: 'var(--muted)' }}>
              Sign in
            </Link>
            <Link href="/register" className="text-sm font-semibold transition-colors hover:text-sky-600" style={{ color: 'var(--muted)' }}>
              Register
            </Link>
            <Link href="/add-product" className="text-sm font-semibold transition-colors hover:text-sky-600" style={{ color: 'var(--muted)' }}>
              Track a product
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
