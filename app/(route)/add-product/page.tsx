'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'sonner';

const AddProductPage = () => {
  const router = useRouter();
  const { status } = useSession();
  const [url, setUrl] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    try {
      await axios.post('/api/products', {
        url: url.trim(),
        ...(targetPrice ? { targetPrice: Number(targetPrice) } : {}),
      });
      toast.success('Product added! You\'ll get an email when it hits your target price.');
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
    <div className="max-w-lg mx-auto mt-16 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Track a product</h1>
      <p className="text-gray-500 text-sm mb-8">
        Paste an Amazon product URL. We'll scrape the current price and alert you when it drops.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            Product URL
          </label>
          <input
            id="url"
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.amazon.in/..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
          />
        </div>

        <div>
          <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Target price <span className="text-gray-400 font-normal">(optional — defaults to 10% below current)</span>
          </label>
          <input
            id="targetPrice"
            type="number"
            min={0}
            step="0.01"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="e.g. 1999"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Scraping product...' : 'Start tracking'}
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;
