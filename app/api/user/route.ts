import { connectToDB } from "@/lib/mongoose";
import User from "@/lib/models/user.model";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // console.log("User API called");
    await connectToDB();

    const user = await req.json();
    console.log("Received user data:", user);
    
    // Check if primaryEmailAddress exists
    const emailAddress = user?.primaryEmailAddress?.emailAddress || user?.email;
    if (!emailAddress) {
      console.error("No email address provided");
      return NextResponse.json({ error: "Invalid user data - email required" }, { status: 400 });
    }

    console.log("Checking for user:", emailAddress);
    // Check if user already exists
    let userData = await User.findOne({ email: emailAddress });
    
    // Insert new user if not exists
    if (!userData) {
      console.log("Creating new user in MongoDB:", emailAddress);
      userData = await User.create({
        name: user?.fullname || user?.name || emailAddress.split('@')[0],
        email: emailAddress,
        image: user?.imageUrl || user?.image,
        role: user?.role || 'user',
      });
      console.log("User created:", userData._id);
    } else {
      console.log("User already exists:", userData._id);
    }

    // Return user data
    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error in user route:", error);
    return NextResponse.json({ 
      error: "Failed to process user data",
      message: (error as Error).message 
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }

    const userData = await User.findOne({ email });
    
    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ 
      error: "Failed to fetch user data",
      message: (error as Error).message 
    }, { status: 500 });
  }
}
