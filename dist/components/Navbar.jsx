"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var nextjs_1 = require("@clerk/nextjs");
var image_1 = __importDefault(require("next/image"));
var link_1 = __importDefault(require("next/link"));
var Wishlist_1 = __importDefault(require("./Wishlist"));
var Search_1 = __importDefault(require("./Search"));
var navIcons = [
    { src: '/assets/icons/search.svg', alt: 'search' },
    { src: '/assets/icons/black-heart.svg', alt: 'heart' },
    // { src: '/assets/icons/user.svg', alt: 'user' },
];
var Navbar = function () {
    var _a = (0, nextjs_1.useUser)(), user = _a.user, isSignedIn = _a.isSignedIn;
    return (<header className="w-full">
      <nav className="nav">
        <link_1.default href="/" className="flex items-center gap-1">
          <image_1.default src="/assets/icons/logo.svg" width={27} height={27} alt="logo"/>

          <p className="nav-logo">
            Price<span className='text-primary'>Wise</span>
          </p>
        </link_1.default>

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
          <link_1.default href={'/search'}>
          <image_1.default key='search' src='/assets/icons/search.svg' alt='search' width={28} height={28} onClick={Search_1.default} className="object-contain cursor-pointer"/>
            </link_1.default>
            <link_1.default href={'/wishlist'}>
          <image_1.default key='heart' src='/assets/icons/black-heart.svg' alt='heart' width={28} height={28} onClick={Wishlist_1.default} className="object-contain cursor-pointer"/>
            </link_1.default>
          <link_1.default href={'/deals'}> 
          <button className="bg-black hover:bg-black-100 text-white font-bold py-2 px-4 rounded-full">
            {isSignedIn ?
            'Deals' :
            'Login'}
          </button>
          </link_1.default>
          <nextjs_1.UserButton />
        </div>
      </nav>
    </header>);
};
exports.default = Navbar;
