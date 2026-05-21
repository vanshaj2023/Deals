import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/mongoose';
import User from '@/lib/models/user.model';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDB();
    const user = await User.findById(session.user.id).select('notificationPrefs').lean() as {
      notificationPrefs?: object;
    } | null;

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json(user.notificationPrefs ?? {});
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as {
    email?: { enabled?: boolean; address?: string | null };
    telegram?: { enabled?: boolean; chatId?: string | null };
    defaultThresholdPercent?: number;
  };

  const update: Record<string, unknown> = {};

  if (body.email !== undefined) {
    if (typeof body.email.enabled === 'boolean') {
      update['notificationPrefs.email.enabled'] = body.email.enabled;
    }
    if ('address' in body.email) {
      update['notificationPrefs.email.address'] = body.email.address ?? null;
    }
  }

  if (body.telegram !== undefined) {
    if (typeof body.telegram.enabled === 'boolean') {
      update['notificationPrefs.telegram.enabled'] = body.telegram.enabled;
    }
    if ('chatId' in body.telegram) {
      update['notificationPrefs.telegram.chatId'] = body.telegram.chatId ?? null;
    }
  }

  if (typeof body.defaultThresholdPercent === 'number') {
    update['notificationPrefs.defaultThresholdPercent'] = Math.min(
      100,
      Math.max(1, body.defaultThresholdPercent)
    );
  }

  try {
    await connectToDB();
    await User.findByIdAndUpdate(session.user.id, { $set: update });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
