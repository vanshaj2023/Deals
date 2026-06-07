'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'sonner';
import { formatNumber } from '@/lib/utils';
import type { TrackedProduct } from '@/types';
import Sparkline from '@/components/Sparkline';
import {
  Plus, Trash2, ExternalLink, Bell, BellOff,
  TrendingDown, Star, Clock, Loader2, Zap,
} from 'lucide-react';
import gsap from 'gsap';

const MAX_ACTIVE_TRACKING = 2;

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden border bg-white" style={{ borderColor: 'rgba(226,232,240,0.9)' }}>
    <div className="skeleton h-40 w-full" style={{ borderRadius: 0 }} />
    <div className="p-4 flex flex-col gap-2">
      <div className="skeleton h-3.5 w-3/4 rounded-full" />
      <div className="skeleton h-3 w-1/2 rounded-full" />
      <div className="skeleton h-5 w-1/3 rounded-full mt-1" />
    </div>
  </div>
);

const PendingCard = ({ tracking, onDelete }: { tracking: TrackedProduct; onDelete: () => void }) => (
  <div
    className="flex flex-col rounded-2xl overflow-hidden border bg-white will-anim"
    style={{ borderColor: 'rgba(14,165,233,0.2)', boxShadow: '0 0 0 1px rgba(14,165,233,0.08), 0 4px 16px rgba(14,165,233,0.06)' }}
  >
    {/* Animated scan area */}
    <div
      className="relative flex flex-col items-center justify-center gap-3"
      style={{ height: 160, background: 'linear-gradient(135deg, #F0F9FF 0%, #EFF6FF 100%)', borderBottom: '1px solid rgba(14,165,233,0.12)' }}
    >
      <div className="relative">
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />
        <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(14,165,233,0.1)' }} />
      </div>
      <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>Scraping in progress…</span>
      {/* Scanning line animation */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
        <div
          className="h-full"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
            animation: 'scan 2s ease-in-out infinite',
            width: '40%',
          }}
        />
      </div>
    </div>

    <div className="flex flex-col flex-1 p-4 gap-3" style={{ borderTop: '1px solid rgba(226,232,240,0.7)' }}>
      <div>
        <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text)' }}>
          {tracking.pendingUrl
            ? (() => { try { return new URL(tracking.pendingUrl).hostname.replace('www.', ''); } catch { return tracking.pendingUrl; } })()
            : 'Product URL'}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Clock size={11} style={{ color: 'var(--muted)' }} />
          <span className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>In queue · Added {new Date(tracking.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div
        className="rounded-xl px-3 py-2.5 border"
        style={{ background: 'var(--accent-light)', borderColor: 'rgba(14,165,233,0.15)' }}
      >
        <p className="text-[9px] font-extrabold uppercase tracking-widest mb-0.5" style={{ color: 'var(--accent)' }}>Status</p>
        <p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
          Waiting for scrape to complete
        </p>
        {tracking.targetPrice && (
          <p className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>
            Will alert at ₹{formatNumber(tracking.targetPrice)}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>
          You&apos;ll get an email when ready
        </span>
        <button
          onClick={onDelete}
          className="icon-btn danger"
          title="Remove from queue"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  </div>
);

const UserListing = () => {
  const [trackings, setTrackings] = useState<TrackedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  const fetchTrackings = () =>
    axios
      .get('/api/products')
      .then((r) => setTrackings(r.data.data))
      .catch(() => toast.error('Failed to load tracked products'))
      .finally(() => setLoading(false));

  useEffect(() => {
    fetchTrackings();
  }, []);

  // Poll every 8 seconds while any pending trackings exist
  useEffect(() => {
    const hasPending = trackings.some((t) => t.status === 'pending');
    if (!hasPending) return;
    const id = setInterval(fetchTrackings, 8000);
    return () => clearInterval(id);
  }, [trackings]);

  useEffect(() => {
    if (!loading && trackings.length && gridRef.current) {
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 20, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.06, ease: 'power3.out' }
      );
    }
  }, [loading, trackings.length]);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/products/${id}`);
      setTrackings((p) => p.filter((t) => t._id !== id));
      toast.success('Removed');
    } catch { toast.error('Failed to remove'); }
  };

  const handleTargetUpdate = async (id: string, value: string) => {
    const price = Number(value);
    if (isNaN(price) || price <= 0) return;
    try {
      await axios.patch(`/api/products/${id}`, { targetPrice: price });
      setTrackings((p) => p.map((t) => t._id === id ? { ...t, targetPrice: price } : t));
    } catch { toast.error('Failed to update'); }
  };

  const handleToggleTracking = async (id: string, currentlyPaused: boolean) => {
    const nextPaused = !currentlyPaused;
    try {
      await axios.patch(`/api/products/${id}`, { paused: nextPaused });
      setTrackings((p) => p.map((t) => t._id === id ? { ...t, paused: nextPaused } : t));
      toast.success(nextPaused ? 'Active tracking off' : 'Active tracking on');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; code?: string } } };
      const msg = e.response?.data?.error ?? 'Failed to update';
      toast.error(msg);
    }
  };

  /* ── Header bar ── */
  const active  = trackings.filter((t) => t.status === 'active');
  const pending = trackings.filter((t) => t.status === 'pending');
  const atTarget = active.filter(
    (t) => t.product && t.targetPrice != null && t.product.currentPrice <= t.targetPrice
  ).length;
  const activeTrackingCount = trackings.filter((t) => !t.paused).length;
  const atLimit = activeTrackingCount >= MAX_ACTIVE_TRACKING;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
      >
        <div>
          <h1 className="text-xl font-bold font-spaceGrotesk" style={{ color: 'var(--text)' }}>
            My tracked products
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
            {loading ? 'Loading...' : `${trackings.length} product${trackings.length !== 1 ? 's' : ''} being monitored`}
          </p>
        </div>

        <Link href="/add-product" className="btn-filled">
          <Plus size={16} />
          Track a product
        </Link>
      </div>

      {/* Stats summary bar */}
      {!loading && trackings.length > 0 && (
        <div className="flex items-center gap-2.5 px-8 py-3 border-b flex-wrap" style={{ borderColor: 'var(--border)', background: 'rgba(255,255,255,0.5)' }}>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border" style={{ background: 'var(--accent-light)', borderColor: 'rgba(14,165,233,0.15)' }}>
            <TrendingDown size={12} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{active.length} active</span>
          </div>
          {pending.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border" style={{ background: '#F0F9FF', borderColor: 'rgba(14,165,233,0.2)' }}>
              <Loader2 size={11} className="animate-spin" style={{ color: 'var(--accent)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{pending.length} in queue</span>
            </div>
          )}
          {atTarget > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border" style={{ background: 'var(--success-light)', borderColor: 'rgba(16,185,129,0.2)' }}>
              <Star size={11} fill="var(--success)" stroke="none" />
              <span className="text-xs font-bold" style={{ color: 'var(--success)' }}>{atTarget} at target</span>
            </div>
          )}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border"
            style={{
              background: atLimit ? 'var(--warning-bg)' : '#FEF3C7',
              borderColor: atLimit ? 'rgba(180,83,9,0.25)' : 'rgba(245,158,11,0.2)',
            }}
          >
            <Zap size={12} style={{ color: atLimit ? 'var(--warning-text)' : '#92400E' }} />
            <span className="text-xs font-bold" style={{ color: atLimit ? 'var(--warning-text)' : '#92400E' }}>
              {activeTrackingCount}/{MAX_ACTIVE_TRACKING} active tracking
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-8 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : trackings.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
              style={{ background: 'var(--accent-light)' }}
            >
              <TrendingDown size={32} style={{ color: 'var(--accent)' }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
              No products tracked yet
            </h2>
            <p className="text-base mb-6 max-w-xs" style={{ color: 'var(--muted)' }}>
              Start tracking a product and we&apos;ll alert you the moment the price drops to your target.
            </p>
            <Link href="/add-product" className="btn-filled">
              <Plus size={16} />
              Track your first product
            </Link>
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {trackings.map((tracking) => {
              // Render pending card for items still in the scrape queue
              if (tracking.status === 'pending') {
                return (
                  <PendingCard
                    key={tracking._id}
                    tracking={tracking}
                    onDelete={() => handleDelete(String(tracking._id))}
                  />
                );
              }

              const p = tracking.product;
              if (!p) return null;

              const isAtTarget =
                tracking.targetPrice != null && p.currentPrice <= tracking.targetPrice;
              const discount =
                p.originalPrice > p.currentPrice
                  ? Math.round(((p.originalPrice - p.currentPrice) / p.originalPrice) * 100)
                  : 0;
              const savings =
                tracking.targetPrice != null
                  ? p.currentPrice - tracking.targetPrice
                  : null;

              return (
                <div
                  key={tracking._id}
                  className="will-anim flex flex-col rounded-2xl overflow-hidden border bg-white transition-all duration-250"
                  style={{
                    borderColor: isAtTarget
                      ? 'rgba(16,185,129,0.3)'
                      : !tracking.paused
                        ? 'rgba(245,158,11,0.35)'
                        : 'rgba(226,232,240,0.9)',
                    boxShadow: isAtTarget
                      ? '0 0 0 1px rgba(16,185,129,0.1), 0 4px 16px rgba(16,185,129,0.06)'
                      : !tracking.paused
                        ? '0 0 0 1px rgba(245,158,11,0.12), 0 4px 16px rgba(245,158,11,0.06)'
                        : 'var(--shadow-1)',
                  }}
                >
                  {/* Product image */}
                  <Link href={`/products/${p._id}`} className="block group relative overflow-hidden">
                    <div
                      className="relative w-full"
                      style={{ height: 160, background: '#FAFBFC' }}
                    >
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        className="object-contain p-4 transition-transform duration-400 group-hover:scale-[1.06]"
                      />
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                        {discount > 0 && (
                          <span className="chip" style={{ background: '#FEF3C7', color: '#92400E' }}>
                            -{discount}%
                          </span>
                        )}
                        {!tracking.paused && (
                          <span className="chip flex items-center gap-1" style={{ background: '#FEF3C7', color: '#92400E' }}>
                            <Zap size={9} fill="#92400E" stroke="none" />
                            Tracking
                          </span>
                        )}
                      </div>

                      {isAtTarget && (
                        <span
                          className="chip absolute top-2.5 right-2.5"
                          style={{ background: '#D1FAE5', color: '#065F46' }}
                        >
                          At target
                        </span>
                      )}

                      {p.isOutOfStock && (
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{ background: 'rgba(248,250,252,0.88)', backdropFilter: 'blur(4px)' }}
                        >
                          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                            Out of stock
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Card body */}
                  <div className="flex flex-col flex-1 p-4 gap-3.5" style={{ borderTop: '1px solid rgba(226,232,240,0.7)' }}>

                    {/* Title + rating */}
                    <div>
                      <Link href={`/products/${p._id}`}>
                        <p
                          className="text-[13px] font-semibold line-clamp-2 leading-snug hover:text-sky-600 transition-colors"
                          style={{ color: 'var(--text)' }}
                        >
                          {p.title}
                        </p>
                      </Link>
                      {p.stars > 0 && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <Star size={10} fill="#FBBC04" stroke="none" />
                          <span className="text-[11px] font-semibold" style={{ color: 'var(--muted)' }}>
                            {p.stars.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Price + sparkline */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[17px] font-extrabold tracking-tight leading-none mb-1" style={{ color: 'var(--text)' }}>
                          {p.currency}{formatNumber(p.currentPrice)}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {discount > 0 && (
                            <span className="text-[11px] font-bold" style={{ color: 'var(--success)' }}>
                              -{discount}% off
                            </span>
                          )}
                          <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                            Low: {p.currency}{formatNumber(p.lowestPrice)}
                          </span>
                        </div>
                      </div>
                      {p.priceHistory?.length > 1 && (
                        <div className="rounded-lg overflow-hidden p-1" style={{ background: '#F8FAFC', border: '1px solid rgba(226,232,240,0.8)' }}>
                          <Sparkline history={p.priceHistory} />
                        </div>
                      )}
                    </div>

                    {/* Target price input */}
                    <div
                      className="rounded-xl px-3 py-2.5 border transition-all duration-200 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/10"
                      style={{ background: 'var(--surface-2)', borderColor: 'rgba(226,232,240,0.9)' }}
                    >
                      <p className="text-[9px] font-extrabold uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>
                        Target price
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold" style={{ color: 'var(--muted)' }}>{p.currency}</span>
                        <input
                          type="number"
                          defaultValue={tracking.targetPrice ?? ''}
                          onBlur={(e) => handleTargetUpdate(tracking._id, e.target.value)}
                          placeholder="Set target"
                          className="flex-1 bg-transparent border-none outline-none text-sm font-bold"
                          style={{ color: 'var(--text)' }}
                        />
                      </div>
                      {savings != null && savings > 0 && (
                        <p className="text-[10px] font-semibold mt-1" style={{ color: 'var(--success)' }}>
                          Save {p.currency}{formatNumber(savings)} from now
                        </p>
                      )}
                    </div>

                    {/* Action row */}
                    <div className="flex items-center justify-between pt-0.5 mt-auto">
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold transition-colors hover:text-sky-600"
                        style={{ color: 'var(--muted)' }}
                      >
                        <ExternalLink size={11} />
                        View on {p.source ?? 'store'}
                      </a>

                      <div className="flex items-center gap-0.5">
                        {(() => {
                          const disabled = tracking.paused && atLimit;
                          const title = tracking.paused
                            ? (atLimit
                                ? `Limit reached (${MAX_ACTIVE_TRACKING} max). Disable another product first.`
                                : 'Enable active tracking (price refresh every 12h)')
                            : 'Disable active tracking';
                          return (
                            <button
                              onClick={() => !disabled && handleToggleTracking(tracking._id, tracking.paused)}
                              className="icon-btn"
                              title={title}
                              disabled={disabled}
                              style={{
                                color: tracking.paused ? 'var(--muted)' : '#D97706',
                                opacity: disabled ? 0.4 : 1,
                                cursor: disabled ? 'not-allowed' : 'pointer',
                              }}
                            >
                              {tracking.paused ? <BellOff size={14} /> : <Bell size={14} fill="#D97706" />}
                            </button>
                          );
                        })()}
                        <button
                          onClick={() => handleDelete(tracking._id)}
                          className="icon-btn danger"
                          title="Stop tracking"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListing;
