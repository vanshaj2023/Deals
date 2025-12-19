'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import wish from '../public/assets/icons/black-heart.svg'
import search from '../public/assets/icons/searchbar.png'
import trend from '../public/assets/icons/trending.png'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'

const Navbar = () => {
  const { data: session, status } = useSession()
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()
  const isSignedIn = status === 'authenticated'

  useEffect(() => {
    if (isSignedIn && session?.user) {
      setWelcomeMessage(`Welcome ${session.user.name}`)
      const timer = setTimeout(() => {
        setWelcomeMessage('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isSignedIn, session])

  const handleButtonClick = () => {
    if (!isSignedIn) {
      router.push('/login')
    } else {
      router.push('/deals-new')
    }
  }

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  return (
    <header className="w-full">
      <nav className="nav">
        <Link href="/" className="flex items-center gap-1">
          <Image
            src="/assets/icons/logo.svg"
            width={27}
            height={27}
            alt="logo"
          />
          <p className="nav-logo">
            Price<span className='text-primary'>IQ</span>
          </p>
        </Link>

        <div className="flex items-center gap-3">
          {welcomeMessage && (
            <div className="font-bold duration-500">
              {welcomeMessage}
            </div>
          )}
          <Link href={'/explore'} className='h-5 w-6'>
            <Image src={search} alt='search'/>
          </Link>
          <Link href={'/wishlist'}>
            <Image src={wish} alt='wish' />
          </Link>
          <Link href={'/trending'}>
            <Image src={trend} alt='trend'/>
          </Link>
          <button
            className="bg-black hover:bg-black-100 text-white font-bold py-2 px-4 rounded-full"
            onClick={handleButtonClick}
          >
            {isSignedIn ? 'Deals' : 'Login'}
          </button>
          
          {isSignedIn && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </div>
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="font-semibold">{session?.user?.name}</p>
                    <p className="text-sm text-gray-500">{session?.user?.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar;
