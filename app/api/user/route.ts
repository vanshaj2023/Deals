import { db } from "@/config/db";
import { usersTable } from "@/config/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await req.json();
  
  // Check if primaryEmailAddress exists
  const emailAddress = user?.primaryEmailAddress?.emailAddress;
  if (!emailAddress) {
    return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
  }

  // Check if user already exists
  const userData = await db.select().from(usersTable).where(eq(usersTable.email, emailAddress));
  
  // Insert new user if not exists
  if (userData.length <= 0) {
    const newUser = await db.insert(usersTable).values({
      name: user?.fullname,
      email: emailAddress,
    }).returning();

    return NextResponse.json(newUser[0]);
  }

  // Return existing user data
  return NextResponse.json(userData[0]);
}
