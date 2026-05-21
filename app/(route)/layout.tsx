'use client';

import { ReactNode, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, PlusCircle, Settings, LogOut, TrendingDown } from 'lucide-react';
import gsap from 'gsap';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/add-product', label: 'Track product', icon: PlusCircle },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const sidebarRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sidebarRef.current || !mainRef.current) return;
    gsap.fromTo(sidebarRef.current, { x: -16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' });
    gsap.fromTo(mainRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.1, ease: 'power2.out' });
  }, []);

  return (
    <div className="flex min-h-screen relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Decorative glowing blobs for authenticated routes */}
      <div
        className="glowing-blob"
        style={{
          top: '10%',
          left: '20%',
          width: 350,
          height: 350,
          background: 'radial-gradient(circle, rgba(14,165,233,0.04) 0%, transparent 70%)',
        }}
      />
      <div
        className="glowing-blob"
        style={{
          bottom: '10%',
          right: '5%',
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(56,189,248,0.03) 0%, transparent 70%)',
        }}
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        style={{
          width: 240,
          flexShrink: 0,
          paddingTop: 20,
          paddingBottom: 20,
          background: 'white',
          borderRight: '1px solid rgba(226,232,240,0.9)',
          boxShadow: '1px 0 0 rgba(226,232,240,0.5)',
        }}
        className="flex flex-col relative z-20"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 px-5 mb-6 h-10 group">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
            style={{ background: 'var(--accent-light)', border: '1px solid rgba(14,165,233,0.15)' }}
          >
            <TrendingDown size={15} style={{ color: 'var(--accent)' }} />
          </div>
          <span className="font-bold text-[17px] font-spaceGrotesk tracking-tight" style={{ color: 'var(--text)' }}>
            Price<span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">IQ</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 flex-1 px-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== '/dashboard' && pathname.startsWith(href + '/'));
            return (
              <Link key={href} href={href} className={`nav-pill${active ? ' active' : ''}`}>
                <Icon size={18} className={active ? 'stroke-[2.5px]' : ''} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User account area */}
        <div className="px-3 mt-4 pt-4" style={{ borderTop: '1px solid rgba(226,232,240,0.7)' }}>
          {session?.user && (
            <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl mb-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-white font-bold flex-shrink-0"
                style={{ background: 'var(--accent-gradient)' }}
              >
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
                  {session.user.name}
                </p>
                <p className="text-[10px] truncate" style={{ color: 'var(--muted)' }}>
                  {session.user.email}
                </p>
              </div>
            </div>
          )}
          <button onClick={() => signOut({ callbackUrl: '/' })} className="nav-pill" style={{ color: '#EF4444' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto relative z-10"
        style={{ minHeight: '100vh', background: 'transparent' }}
      >
        {children}
      </main>
    </div>
  );
}
