'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'sonner';
import { Search, ArrowRight, Loader2, Zap, Bell, TrendingDown } from 'lucide-react';
import gsap from 'gsap';

const AddProductPage = () => {
  const router = useRouter();
  const { status } = useSession();
  const [url, setUrl] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const tipsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (heroRef.current)
      tl.fromTo(heroRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5 });
    if (formRef.current)
      tl.fromTo(formRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 }, '-=0.2');
    if (tipsRef.current)
      tl.fromTo(
        tipsRef.current.children,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.35 },
        '-=0.1'
      );
  }, []);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/products', {
        url: url.trim(),
        ...(targetPrice ? { targetPrice: Number(targetPrice) } : {}),
      });

      if (res.status === 202 || res.data?.data?.queued) {
        toast.success(
          "Added to scraping queue! We'll email you once it's ready and when the price hits your target.",
          { duration: 6000 }
        );
      } else {
        toast.success("Tracking started! We'll alert you when the price drops.");
      }
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error ?? 'Failed to add product'
        : 'Failed to add product';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-16">
      {/* Hero text */}
      <div ref={heroRef} className="text-center mb-10 will-anim">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
          style={{ background: 'var(--accent-light)' }}
        >
          <TrendingDown size={26} style={{ color: 'var(--accent)' }} />
        </div>
        <h1
          className="text-3xl font-bold font-spaceGrotesk mb-2"
          style={{ color: 'var(--text)' }}
        >
          Track a product price
        </h1>
        <p className="text-base" style={{ color: 'var(--muted)' }}>
          Paste any Amazon, Myntra or Flipkart link below. Set your target price and we handle the rest.
        </p>
      </div>

      {/* Form */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="w-full max-w-xl flex flex-col gap-4 will-anim"
      >
        {/* URL input — big, Google-search-style */}
        <div
          className="flex items-center gap-3 px-5 rounded-2xl border transition-all duration-200 focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-500/12 shadow-xs"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            height: 60,
          }}
        >
          <Search size={18} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste product URL here..."
            className="flex-1 bg-transparent border-none outline-none text-base font-medium"
            style={{ color: 'var(--text)', height: '100%' }}
          />
        </div>

        {/* Target price */}
        <div
          className="flex items-center gap-3 px-5 rounded-2xl border transition-all duration-200 focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-500/12 shadow-xs"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            height: 52,
          }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--muted)', flexShrink: 0 }}>
            Alert me when price drops to
          </span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="₹ optional"
            className="flex-1 bg-transparent border-none outline-none text-sm font-extrabold tracking-tight"
            style={{ color: 'var(--text)', minWidth: 0 }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="btn-filled w-full"
          style={{ height: 52, borderRadius: 16, fontSize: '0.9375rem' }}
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Scraping product...</>
          ) : (
            <> Start tracking <ArrowRight size={18} /></>
          )}
        </button>

        <p className="text-center text-xs font-semibold" style={{ color: 'var(--muted)' }}>
          No target? We&apos;ll default to 10% below the current price.
        </p>
      </form>

      {/* Tips */}
      <div ref={tipsRef} className="grid grid-cols-3 gap-3 mt-12 w-full max-w-xl will-anim">
        {[
          { icon: Zap, text: 'Price checked every few hours automatically' },
          { icon: Bell, text: 'Email alert the moment your target is hit' },
          { icon: TrendingDown, text: 'Full price history chart on every product' },
        ].map(({ icon: Icon, text }, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center p-4 rounded-2xl gap-2"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent-light)' }}
            >
              <Icon size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <p className="text-xs leading-snug" style={{ color: 'var(--muted)' }}>
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddProductPage;
