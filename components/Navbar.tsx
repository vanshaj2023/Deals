'use client'
import { UserButton, useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

const Navbar = () => {
  const {user, isSignedIn}=useUser();
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

        <div className="flex items-center gap-5">
          <Link href={'/deals'}> 
          <button className="bg-black hover:bg-black-100 text-white font-bold py-2 px-4 rounded-full" >
            {isSignedIn?
            'Deals':
            'Login'
          }
          </button>
          </Link>
          <UserButton/>
        </div>
      </nav>
    </header>
  )
}

export default Navbar