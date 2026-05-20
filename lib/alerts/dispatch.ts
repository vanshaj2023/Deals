import TrackedProduct from '@/lib/models/tracked-product.model';
import User from '@/lib/models/user.model';
import { sendEmailAlert } from './email';
import type { Product } from '@/types';

const ALERT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export async function dispatchAlertsForProduct(product: Product, previousPrice: number) {
  const newPrice = product.currentPrice;
  if (newPrice >= previousPrice) return;

  const trackings = await TrackedProduct.find({
    productId: product._id,
    paused: false,
  });

  if (!trackings.length) return;

  await Promise.all(
    trackings.map(async (tracking) => {
      const now = Date.now();

      if (tracking.lastAlertAt && now - tracking.lastAlertAt.getTime() < ALERT_COOLDOWN_MS) {
        return;
      }

      const user = await User.findById(tracking.userId).lean() as {
        email: string;
        notificationPrefs?: {
          email?: { enabled?: boolean; address?: string | null };
          defaultThresholdPercent?: number;
        };
      } | null;

      if (!user) return;

      const prefs = user.notificationPrefs;
      const threshold = tracking.thresholdPercent ?? prefs?.defaultThresholdPercent ?? 5;
      const dropPercent = ((previousPrice - newPrice) / previousPrice) * 100;

      const targetMet = tracking.targetPrice !== null && newPrice <= tracking.targetPrice;
      const thresholdMet = dropPercent >= threshold;

      if (!targetMet && !thresholdMet) return;

      const emailAddress = prefs?.email?.address || user.email;
      const emailEnabled = prefs?.email?.enabled !== false;

      if (emailEnabled && emailAddress) {
        const notifType = targetMet ? 'TARGET_PRICE_MET' : 'THRESHOLD_MET';
        await sendEmailAlert(emailAddress, { title: product.title, url: product.url }, notifType);
      }

      await TrackedProduct.findByIdAndUpdate(tracking._id, { lastAlertAt: new Date() });
    })
  );
}
