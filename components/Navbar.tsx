'use client'
import { UserButton, useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import Wishlist from './Wishlist'
import Search from './Search'

const navIcons = [
  { src: '/assets/icons/search.svg', alt: 'search' },
  { src: '/assets/icons/black-heart.svg', alt: 'heart' },
  // { src: '/assets/icons/user.svg', alt: 'user' },
]

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
          {/* {navIcons.map((icon) => (
            <Image
              key={icon.alt}
              src={icon.src}
              alt={icon.alt}
              width={28}
              height={28}
              className="object-contain"
            />
          ))} */}
          <Link href={'/search'}>
          <Image
              key='search'
              src='/assets/icons/search.svg'
              alt='search'
              width={28}
              height={28}
              onClick={Search}
              className="object-contain cursor-pointer"
            />
            </Link>
            <Link href={'/wishlist'}>
          <Image
              key='heart'
              src= '/assets/icons/black-heart.svg'
              alt= 'heart'
              width={28}
              height={28}
              onClick={Wishlist}
              className="object-contain cursor-pointer"
            />
            </Link>
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