'use client';

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { PriceHistoryItem } from '@/types';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler);

interface SparklineProps {
  history: PriceHistoryItem[];
}

export default function Sparkline({ history }: SparklineProps) {
  if (!history?.length) return null;

  const last = history[history.length - 1].price;
  const first = history[0].price;
  const isUp = last > first;

  const color = isUp ? '#EF4444' : '#16A34A';
  const fill = isUp ? 'rgba(239,68,68,0.08)' : 'rgba(22,163,74,0.08)';

  const data = {
    labels: history.map(() => ''),
    datasets: [{
      data: history.map((h) => h.price),
      borderColor: color,
      borderWidth: 1.5,
      fill: true,
      backgroundColor: fill,
      pointRadius: 0,
      tension: 0.4,
    }],
  };

  const options = {
    responsive: false,
    animation: { duration: 0 } as const,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false } },
  };

  return <Line data={data} options={options} width={88} height={40} />;
}
