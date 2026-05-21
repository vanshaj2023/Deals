import { connectToDB } from "@/lib/mongoose";
import User from "@/lib/models/user.model";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await connectToDB();

    const user = await req.json() as {
      primaryEmailAddress?: { emailAddress?: string };
      email?: string;
      fullname?: string;
      name?: string;
      imageUrl?: string;
      image?: string;
      role?: string;
    };

    const emailAddress = user?.primaryEmailAddress?.emailAddress || user?.email;
    if (!emailAddress) {
      return NextResponse.json({ error: 'Invalid user data - email required' }, { status: 400 });
    }

    let userData = await User.findOne({ email: emailAddress });

    if (!userData) {
      userData = await User.create({
        name: user?.fullname || user?.name || emailAddress.split('@')[0],
        email: emailAddress,
        image: user?.imageUrl || user?.image,
        role: user?.role || 'user',
      });
    }

    return NextResponse.json(userData);
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to process user data',
      message: (error as Error).message,
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    const userData = await User.findOne({ email });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userData);
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch user data',
      message: (error as Error).message,
    }, { status: 500 });
  }
}
