'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import wish from '../public/assets/icons/black-heart.svg'
import search from '../public/assets/icons/searchbar.png'
import trend from '../public/assets/icons/trending.png'
import { useState, useEffect } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'

const Navbar = () => {
  const { user, isSignedIn } = useUser()
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (isSignedIn && user) {
      setWelcomeMessage(`Welcome ${user.fullName}`)
      const timer = setTimeout(() => {
        setWelcomeMessage('')
      }, 5000) // Remove the welcome message after 5 seconds

      // Clear the timeout if the component unmounts
      return () => clearTimeout(timer)
    }
  }, [isSignedIn, user])

    const handleButtonClick = () => {
      if (!isSignedIn) {
        router.push('/sign-in')
      } else {
        router.push('/deals-new')
      }
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
            Price<span className='text-primary'>Wise</span>
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
          <UserButton />
        </div>
      </nav>
    </header>
  )
}

export default Navbar;
