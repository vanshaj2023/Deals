'use client';

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
  type TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { PriceHistoryItem } from '@/types';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

interface PriceChartProps {
  history: PriceHistoryItem[];
  currency?: string;
}

export default function PriceChart({ history, currency = '₹' }: PriceChartProps) {
  if (!history?.length) {
    return (
      <div
        className="flex items-center justify-center rounded-xl h-44 border text-sm"
        style={{ background: '#F9FAFB', borderColor: 'var(--border)', color: 'var(--muted)' }}
      >
        No price history yet
      </div>
    );
  }

  const labels = history.map((h) =>
    new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  );

  const prices = history.map((h) => h.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const latest = prices[prices.length - 1];
  const isUp = latest > prices[0];

  const lineColor = isUp ? '#EF4444' : '#16A34A';
  const fillColor = isUp ? 'rgba(239,68,68,0.06)' : 'rgba(22,163,74,0.06)';

  const data = {
    labels,
    datasets: [{
      label: 'Price',
      data: prices,
      borderColor: lineColor,
      borderWidth: 2,
      fill: true,
      backgroundColor: fillColor,
      pointRadius: 3,
      pointBackgroundColor: lineColor,
      pointBorderColor: 'white',
      pointBorderWidth: 1.5,
      pointHoverRadius: 5,
      tension: 0.4,
    }],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'white',
        borderColor: 'rgba(16,24,40,0.10)',
        borderWidth: 1,
        titleColor: '#667085',
        bodyColor: '#101828',
        padding: 10,
        boxShadow: '0 4px 12px rgba(16,24,40,0.10)',
        callbacks: {
          label: (ctx: TooltipItem<'line'>) =>
            ` ${currency}${(ctx.parsed.y ?? 0).toLocaleString('en-IN')}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#98A2B3', font: { size: 11 } },
      },
      y: {
        min: Math.floor(minPrice * 0.97),
        max: Math.ceil(maxPrice * 1.03),
        grid: { color: '#F2F4F7' },
        border: { display: false },
        ticks: {
          color: '#98A2B3',
          font: { size: 11 },
          maxTicksLimit: 5,
          callback: (val: number | string) =>
            `${currency}${Number(val).toLocaleString('en-IN')}` as string,
        },
      },
    },
  };

  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <Line data={data} options={options} />
    </div>
  );
}
