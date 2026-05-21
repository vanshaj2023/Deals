'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(cardRef.current, { opacity: 0, y: 24, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out' });
    gsap.to(blob1Ref.current, { y: -18, x: 10, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to(blob2Ref.current, { y: 14, x: -8, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1 });
  }, []);

  const set = (k: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      router.push('/login?registered=true');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch {
      setError('Failed to sign up with Google.');
      setLoading(false);
    }
  };

  const inputStyle = { borderRadius: 10, background: '#FAFAFA' };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Blobs */}
      <div ref={blob1Ref} className="absolute pointer-events-none"
        style={{ top: -80, right: -60, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)' }} />
      <div ref={blob2Ref} className="absolute pointer-events-none"
        style={{ bottom: -60, left: -80, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)' }} />

      <div ref={cardRef} className="w-full max-w-[400px] relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-7 group">
          <Image src="/assets/icons/logo.svg" width={30} height={30} alt="logo" className="transition-transform group-hover:rotate-12 duration-300" />
          <span className="font-bold text-2xl font-spaceGrotesk tracking-tight" style={{ color: 'var(--text)' }}>
            Price<span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">IQ</span>
          </span>
        </Link>

        {/* Card */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: 24,
            boxShadow: 'var(--shadow-3)',
            padding: '2rem',
          }}
        >
          <h1 className="text-xl font-bold font-spaceGrotesk mb-1" style={{ color: 'var(--text)' }}>
            Create your account
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
            Free forever. No credit card needed.
          </p>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm mb-5" style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid #FECACA' }}>
              {error}
            </div>
          )}

          {/* Google */}
          <button
            onClick={handleGoogle} disabled={loading}
            style={{
              width: '100%', height: 46, borderRadius: 12,
              background: 'white', border: '1.5px solid #E8EAED',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              color: '#3C4043', fontSize: '0.9rem', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              fontFamily: 'inherit', transition: 'box-shadow 0.2s, border-color 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#D0D5DD'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#E8EAED'; }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: '#F0F0F0' }} />
            <span className="text-xs font-medium" style={{ color: '#B0B0B0' }}>or sign up with email</span>
            <div className="flex-1 h-px" style={{ background: '#F0F0F0' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full name</label>
              <input type="text" required value={formData.name} onChange={set('name')} placeholder="Vanshaj Kumar" className="field" style={inputStyle} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email address</label>
              <input type="email" required value={formData.email} onChange={set('email')} placeholder="you@example.com" className="field" style={inputStyle} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} required value={formData.password}
                  onChange={set('password')} placeholder="At least 6 characters"
                  className="field" style={{ ...inputStyle, paddingRight: '2.75rem' }}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirm password</label>
              <input type="password" required value={formData.confirmPassword} onChange={set('confirmPassword')} placeholder="••••••••" className="field" style={inputStyle} />
            </div>

            <button type="submit" disabled={loading} className="btn-filled w-full"
              style={{ height: 46, borderRadius: 12, fontSize: '0.9375rem', marginTop: 2 }}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-sm text-center mt-5" style={{ color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
