'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'sonner';
import { Mail, Send, Check, Loader2, SlidersHorizontal } from 'lucide-react';
import gsap from 'gsap';

interface NotifPrefs {
  email: { enabled: boolean; address: string | null };
  telegram: { enabled: boolean; chatId: string | null };
  defaultThresholdPercent: number;
}

const TELEGRAM_BOT = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? 'YourPriceIQBot';

const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <button
    onClick={onToggle}
    className="toggle"
    style={{ background: on ? 'var(--accent)' : '#DADCE0' }}
  >
    <span className="toggle-dot" style={{ left: on ? 19 : 3 }} />
  </button>
);

export default function SettingsPage() {
  const { data: session } = useSession();
  const [prefs, setPrefs] = useState<NotifPrefs>({
    email: { enabled: true, address: null },
    telegram: { enabled: false, chatId: null },
    defaultThresholdPercent: 5,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    axios
      .get('/api/user/prefs')
      .then((r) => setPrefs((prev) => ({
        email: { ...prev.email, ...(r.data?.email ?? {}) },
        telegram: { ...prev.telegram, ...(r.data?.telegram ?? {}) },
        defaultThresholdPercent: r.data?.defaultThresholdPercent ?? prev.defaultThresholdPercent,
      })))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  useEffect(() => {
    if (!loading && contentRef.current) {
      gsap.fromTo(
        contentRef.current.children,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, stagger: 0.07, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, [loading]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch('/api/user/prefs', prefs);
      setSaved(true);
      toast.success('Settings saved');
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
          <div>
            <div className="skeleton h-5 w-40 rounded-full mb-2" />
            <div className="skeleton h-3.5 w-64 rounded-full" />
          </div>
        </div>
        <div className="px-8 py-6 max-w-2xl flex flex-col gap-4">
          {[160, 200, 140].map((h, i) => (
            <div key={i} className="skeleton rounded-2xl" style={{ height: h }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
      >
        <div>
          <h1 className="text-xl font-bold font-spaceGrotesk" style={{ color: 'var(--text)' }}>
            Notification settings
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
            Choose how and where you get alerted when a price drops
          </p>
        </div>
      </div>

    <div className="px-8 py-6 max-w-2xl">

      <div ref={contentRef} className="flex flex-col gap-4">
        {/* Email */}
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--accent-light)' }}
            >
              <Mail size={18} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                Email alerts
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                {prefs.email.enabled
                  ? `Alerts go to ${prefs.email.address ?? session?.user?.email}`
                  : 'Email alerts are turned off'}
              </p>
            </div>
            <Toggle
              on={prefs.email.enabled}
              onToggle={() =>
                setPrefs((p) => ({ ...p, email: { ...p.email, enabled: !p.email.enabled } }))
              }
            />
          </div>

          {prefs.email.enabled && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                Send alerts to a different email
              </label>
              <input
                type="email"
                value={prefs.email.address ?? ''}
                onChange={(e) =>
                  setPrefs((p) => ({
                    ...p,
                    email: { ...p.email, address: e.target.value || null },
                  }))
                }
                placeholder={session?.user?.email ?? 'you@example.com'}
                className="field"
                style={{ borderRadius: 12 }}
              />
              <p className="text-xs mt-1.5" style={{ color: 'var(--muted)' }}>
                Leave empty to use your account email
              </p>
            </div>
          )}
        </div>

        {/* Telegram */}
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#EFF6FF' }}
            >
              <Send size={18} style={{ color: '#2563EB' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                Telegram alerts
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                {prefs.telegram.chatId
                  ? 'Bot connected and ready'
                  : prefs.telegram.enabled
                  ? 'Connect your Telegram below'
                  : 'Get price drop DMs on Telegram'}
              </p>
            </div>
            <Toggle
              on={prefs.telegram.enabled}
              onToggle={() =>
                setPrefs((p) => ({
                  ...p,
                  telegram: { ...p.telegram, enabled: !p.telegram.enabled },
                }))
              }
            />
          </div>

          {prefs.telegram.enabled && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              {prefs.telegram.chatId ? (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'var(--success-light)', color: 'var(--success)' }}
                >
                  <Check size={15} />
                  Connected — your chat ID is {prefs.telegram.chatId}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <a
                    href={`https://t.me/${TELEGRAM_BOT}?start=${session?.user?.id ?? ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outlined w-fit !h-9 !px-4 hover:!bg-blue-50/50 hover:!border-blue-500/50 transition-colors"
                    style={{ color: '#2563EB', borderColor: 'rgba(37, 99, 235, 0.25)' }}
                  >
                    <Send size={13} />
                    Open PriceIQ bot on Telegram
                  </a>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    Tap Start in the bot. Your account will be linked automatically.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Default threshold */}
        <div className="card p-5">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#F0FDF4' }}
            >
              <SlidersHorizontal size={18} style={{ color: '#16A34A' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                Default alert threshold
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                Alert when price drops by this % — used when you haven't set a target price
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={50}
              value={prefs.defaultThresholdPercent}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, defaultThresholdPercent: Number(e.target.value) }))
              }
              className="flex-1 cursor-pointer"
              style={{ accentColor: 'var(--accent)' }}
            />
            <div
              className="w-14 text-center py-1.5 rounded-xl text-sm font-bold"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
            >
              {prefs.defaultThresholdPercent}%
            </div>
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving} className="btn-filled" style={{ height: 48, borderRadius: 14 }}>
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /> Saving...</>
          ) : saved ? (
            <><Check size={16} /> Saved</>
          ) : (
            'Save changes'
          )}
        </button>
      </div>
    </div>
    </div>
  );
}
