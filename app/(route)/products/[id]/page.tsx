import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getProductById, getSimilarProducts } from '@/lib/actions';
import { formatNumber } from '@/lib/utils';
import { Product } from '@/types';
import PriceChart from '@/components/PriceChart';
import { ExternalLink, Star, TrendingDown, TrendingUp, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';

type Props = { params: { id: string } };

export default async function ProductDetails({ params: { id } }: Props) {
  const product = await getProductById(id);
  if (!product) redirect('/dashboard');

  const similarProducts = await getSimilarProducts(id);

  const discount =
    product.originalPrice > product.currentPrice
      ? Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100)
      : 0;

  const isAtLowest = product.currentPrice <= product.lowestPrice;

  return (
    <div style={{ background: 'transparent', minHeight: '100vh' }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 px-8 h-16 border-b shadow-sm"
        style={{
          background: 'rgba(248, 250, 252, 0.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'rgba(226, 232, 240, 0.8)'
        }}
      >
        <Link
          href="/dashboard"
          className="icon-btn hover:bg-slate-100"
          style={{ color: 'var(--muted)' }}
        >
          <ArrowLeft size={18} />
        </Link>
        <p className="text-sm font-bold font-spaceGrotesk truncate flex-1" style={{ color: 'var(--text)' }}>
          {product.title}
        </p>
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outlined !h-9 !px-4"
        >
          <ShoppingCart size={14} />
          Buy now
        </a>
      </div>

      <div className="px-8 py-8 max-w-5xl relative z-10">
        {/* Product header */}
        <div className="flex gap-8 xl:flex-row flex-col mb-8">
          {/* Image */}
          <div
            className="xl:w-[320px] w-full flex-shrink-0 flex items-center justify-center rounded-3xl border shadow-sm transition-transform duration-300 hover:scale-[1.01]"
            style={{
              background: 'white',
              borderColor: 'rgba(226, 232, 240, 0.8)',
              minHeight: 280,
              padding: '2.5rem',
            }}
          >
            <div className="relative w-full max-w-[240px] aspect-square">
              <Image src={product.image} alt={product.title} fill className="object-contain" priority />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-extrabold font-spaceGrotesk leading-snug tracking-tight" style={{ color: 'var(--text)' }}>
                {product.title}
              </h1>

              <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                {product.stars > 0 && (
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/50 px-2.5 py-0.5 rounded-full">
                    {[1,2,3,4,5].map((s) => (
                      <Star
                        key={s}
                        size={11}
                        fill={s <= Math.round(product.stars) ? '#FBBC04' : 'none'}
                        stroke={s <= Math.round(product.stars) ? '#FBBC04' : '#DADCE0'}
                      />
                    ))}
                    <span className="text-[11px] font-bold text-amber-700 ml-1">
                      {product.stars.toFixed(1)} ({formatNumber(product.reviewsCount)})
                    </span>
                  </div>
                )}
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold hover:text-sky-600 transition-colors"
                  style={{ color: 'var(--muted)' }}
                >
                  <ExternalLink size={11} />
                  View on {product.source}
                </a>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 flex-wrap">
              <span className="text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
                {product.currency}{formatNumber(product.currentPrice)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-lg line-through mb-1.5 font-medium" style={{ color: 'var(--muted)' }}>
                    {product.currency}{formatNumber(product.originalPrice)}
                  </span>
                  <span
                    className="chip mb-1"
                    style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid rgba(251, 191, 36, 0.3)' }}
                  >
                    {discount}% off
                  </span>
                </>
              )}
              {isAtLowest && (
                <span
                  className="chip mb-1 shadow-xs"
                  style={{ background: 'var(--success-light)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                >
                  Lowest price ever
                </span>
              )}
            </div>

            {/* Price stats — 3 cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Lowest ever', value: `${product.currency}${formatNumber(product.lowestPrice)}`, icon: <TrendingDown size={15} style={{ color: '#10B981' }} />, bg: isAtLowest ? '#ECFDF5' : 'rgba(255,255,255,0.6)', border: isAtLowest ? 'rgba(16, 185, 129, 0.25)' : 'rgba(226, 232, 240, 0.8)' },
                { label: 'Average', value: `${product.currency}${formatNumber(product.averagePrice)}`, icon: <Minus size={15} style={{ color: 'var(--muted)' }} />, bg: 'rgba(255,255,255,0.6)', border: 'rgba(226, 232, 240, 0.8)' },
                { label: 'Highest', value: `${product.currency}${formatNumber(product.highestPrice)}`, icon: <TrendingUp size={15} style={{ color: '#EF4444' }} />, bg: 'rgba(255,255,255,0.6)', border: 'rgba(226, 232, 240, 0.8)' },
              ].map(({ label, value, icon, bg, border }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1.5 p-3.5 rounded-2xl border backdrop-blur-md"
                  style={{ background: bg, borderColor: border }}
                >
                  <div className="flex items-center gap-1.5">
                    {icon}
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{label}</span>
                  </div>
                  <span className="text-sm font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* AI summary */}
            {product.summary && (
              <div
                className="rounded-2xl p-5 text-sm leading-relaxed border shadow-xs"
                style={{
                  background: 'linear-gradient(135deg, #FFFDF5 0%, #FFFBEB 100%)',
                  borderColor: 'rgba(251, 191, 36, 0.25)',
                  color: 'var(--warning-text)'
                }}
              >
                <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1.5" style={{ color: '#B45309' }}>
                  AI Summary
                </p>
                <span className="font-medium">{product.summary}</span>
              </div>
            )}
          </div>
        </div>

        {/* Price history */}
        <div className="mb-10 card p-6">
          <h2 className="text-base font-extrabold font-spaceGrotesk tracking-tight mb-4" style={{ color: 'var(--text)' }}>
            Price movement chart
          </h2>
          <PriceChart history={product.priceHistory} currency={product.currency} />
        </div>

        {/* Description */}
        {product.description && (
          <div className="card p-6 mb-10">
            <h2 className="text-base font-extrabold font-spaceGrotesk tracking-tight mb-4" style={{ color: 'var(--text)' }}>
              About this product
            </h2>
            <div className="text-sm leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>
              {product.description.split('\n').filter(Boolean).map((para, i) => (
                <p key={i} className="mb-3.5 last:mb-0">{para}</p>
              ))}
            </div>
          </div>
        )}

        {/* Similar products */}
        {similarProducts && similarProducts.length > 0 && (
          <div>
            <h2 className="text-base font-extrabold font-spaceGrotesk tracking-tight mb-4" style={{ color: 'var(--text)' }}>
              Similar products you might watch
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {similarProducts.map((p: Product) => (
                <Link
                  key={p._id}
                  href={`/products/${p._id}`}
                  className="card flex flex-col overflow-hidden hover:translate-y-[-4px] hover:border-sky-200/60"
                >
                  <div
                    className="relative w-full"
                    style={{ height: 130, background: '#FFFFFF', borderBottom: '1px solid rgba(226, 232, 240, 0.6)' }}
                  >
                    <Image src={p.image} alt={p.title} fill className="object-contain p-3.5 transition-transform duration-300 hover:scale-105" />
                  </div>
                  <div className="p-4 flex flex-col gap-1.5">
                    <p className="text-xs font-semibold line-clamp-2 leading-snug" style={{ color: 'var(--text)' }}>
                      {p.title}
                    </p>
                    <p className="text-sm font-extrabold tracking-tight" style={{ color: 'var(--accent)' }}>
                      {p.currency}{formatNumber(p.currentPrice)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
