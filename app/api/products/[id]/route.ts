import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/mongoose';
import TrackedProduct from '@/lib/models/tracked-product.model';

type Params = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { targetPrice, thresholdPercent, paused } = await req.json() as {
    targetPrice?: number;
    thresholdPercent?: number;
    paused?: boolean;
  };

  try {
    await connectToDB();

    const tracking = await TrackedProduct.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { ...(targetPrice !== undefined && { targetPrice }),
        ...(thresholdPercent !== undefined && { thresholdPercent }),
        ...(paused !== undefined && { paused }) },
      { new: true }
    );

    if (!tracking) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ data: tracking });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDB();

    const tracking = await TrackedProduct.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!tracking) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ data: { deleted: true } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
