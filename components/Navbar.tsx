'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import gsap from 'gsap'

const APP_ROUTES = ['/dashboard', '/add-product', '/settings', '/products']

const Navbar = () => {
  const { data: session, status } = useSession()
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const isSignedIn = status === 'authenticated'
  const navRef = useRef<HTMLElement>(null)

  const isAppRoute = APP_ROUTES.some((r) => pathname.startsWith(r))

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(navRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
    }
  }, [])

  if (isAppRoute) return null

  return (
    <header
      ref={navRef}
      className="w-full sticky top-0 z-50 transition-all duration-300"
      style={{
        background: 'rgba(248, 250, 252, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
      }}
    >
      <nav className="flex items-center justify-between px-6 md:px-16 h-16 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/assets/icons/logo.svg" width={26} height={26} alt="logo" className="transition-transform group-hover:rotate-12 duration-300" />
          <span className="font-bold text-lg font-spaceGrotesk tracking-tight" style={{ color: 'var(--text)' }}>
            Price<span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">IQ</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isSignedIn ? (
            <>
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-outlined !h-9 !px-4"
              >
                Dashboard
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm text-white font-bold ml-1 transition-all duration-300 hover:ring-4 hover:ring-indigo-100"
                  style={{ background: 'var(--accent-gradient)' }}
                >
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                    <div
                      className="absolute right-0 mt-2 w-52 z-50 rounded-2xl py-2 overflow-hidden shadow-xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        boxShadow: 'var(--shadow-3)',
                      }}
                    >
                      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(226, 232, 240, 0.5)' }}>
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                          {session?.user?.name}
                        </p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
                          {session?.user?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 font-semibold"
                        style={{ color: '#EF4444' }}
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/login')}
                className="btn-text !h-9"
                style={{ color: 'var(--text-secondary)', fontWeight: 600 }}
              >
                Sign in
              </button>
              <button
                onClick={() => router.push('/login')}
                className="btn-filled !h-9 !px-4"
              >
                Get started
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
