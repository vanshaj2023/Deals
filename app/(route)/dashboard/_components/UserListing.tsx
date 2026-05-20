'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'sonner';
import { formatNumber } from '@/lib/utils';
import type { TrackedProduct } from '@/types';

const UserListing = () => {
  const [trackings, setTrackings] = useState<TrackedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrackings = async () => {
    try {
      const res = await axios.get('/api/products');
      setTrackings(res.data.data);
    } catch {
      toast.error('Failed to load tracked products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrackings(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/products/${id}`);
      setTrackings((prev) => prev.filter((t) => t._id !== id));
      toast.success('Removed from tracking');
    } catch {
      toast.error('Failed to remove product');
    }
  };

  const handleTargetPriceUpdate = async (id: string, value: string) => {
    const price = Number(value);
    if (isNaN(price) || price <= 0) return;
    try {
      await axios.patch(`/api/products/${id}`, { targetPrice: price });
      setTrackings((prev) =>
        prev.map((t) => t._id === id ? { ...t, targetPrice: price } : t)
      );
    } catch {
      toast.error('Failed to update target price');
    }
  };

  const handlePauseToggle = async (id: string, paused: boolean) => {
    try {
      await axios.patch(`/api/products/${id}`, { paused: !paused });
      setTrackings((prev) =>
        prev.map((t) => t._id === id ? { ...t, paused: !paused } : t)
      );
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="mt-5">
      <h2 className="font-bold text-xl flex justify-between items-center">
        Tracked Products
        <Link href="/add-product">
          <button className="text-sm font-medium px-4 py-2 bg-black text-white rounded-full">
            + Track a product
          </button>
        </Link>
      </h2>

      {loading ? (
        <p className="mt-8 text-center text-gray-400 text-sm">Loading...</p>
      ) : trackings.length === 0 ? (
        <div className="mt-8 text-center text-gray-500">
          <p>No products tracked yet.</p>
          <p className="text-sm mt-1">Paste a product URL above to start tracking prices.</p>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-4">
          {trackings.map((tracking) => {
            const product = tracking.product;
            if (!product) return null;
            return (
              <div key={tracking._id} className="flex gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image src={product.image} alt={product.title} fill className="object-contain" />
                </div>

                <div className="flex-1 min-w-0">
                  <Link href={`/products/${product._id}`}>
                    <p className="font-medium text-gray-900 line-clamp-1 hover:underline">{product.title}</p>
                  </Link>
                  <p className="text-lg font-bold mt-1">
                    {product.currency} {formatNumber(product.currentPrice)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Lowest: {product.currency} {formatNumber(product.lowestPrice)}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <label className="text-xs text-gray-500">Target:</label>
                    <input
                      type="number"
                      defaultValue={tracking.targetPrice ?? ''}
                      onBlur={(e) => handleTargetPriceUpdate(tracking._id, e.target.value)}
                      className="w-24 text-sm border border-gray-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="Set price"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <button
                    onClick={() => handlePauseToggle(tracking._id, tracking.paused)}
                    className={`text-xs px-3 py-1 rounded-full border ${tracking.paused ? 'border-green-500 text-green-600' : 'border-gray-400 text-gray-500'}`}
                  >
                    {tracking.paused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={() => handleDelete(tracking._id)}
                    className="text-xs px-3 py-1 rounded-full border border-red-300 text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserListing;
