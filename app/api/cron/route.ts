import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 10;
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Vercel Cron hits this on schedule. We verify the cron secret, then fire a
// GitHub repository_dispatch so the GH Actions matrix handles the actual
// scraping (IP rotation, no Vercel timeout pressure).
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const dispatched = await triggerGHDispatch();

  return NextResponse.json({
    message: dispatched ? 'GH Actions dispatch triggered' : 'GH dispatch skipped (not configured)',
    dispatched,
  });
}

async function triggerGHDispatch(): Promise<boolean> {
  const ghToken = process.env.GH_DISPATCH_TOKEN;
  const ghRepo = process.env.GH_REPO;
  if (!ghToken || !ghRepo) return false;

  try {
    const res = await fetch(`https://api.github.com/repos/${ghRepo}/dispatches`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${ghToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_type: 'scrape-queue' }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
