import { db } from "@/config/db";
import { trending } from "@/config/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Parse the incoming formData from the request
    const formData = await req.formData();
    const data = JSON.parse(formData.get("data") as string);

    if (!data) {
      throw new Error("Data is required but not provided in the request.");
    }

    console.log("Received Data:", data);

    // Save product data in the database
    const result = await db
      .insert(trending)
      .values({
        title: data?.title,
        price: data?.price,
        description: data?.description,
        category: data?.category,
        link: data?.link,
        image: data?.imglink, // Assuming this is a pre-uploaded image URL
        about: data?.about,
        createdBy: data?.userEmail,
      })
      .returning();

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error occurred:", error);

    // Send error details in response
    return NextResponse.json({
      success: false,
      error: (error as Error).message || "An unknown error occurred.",
    });
  }
}



export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const limit = searchParams.get("limit");

    if (!email) {
      const result = await db
      .select()
      .from(trending)
      .orderBy(desc(trending.id))
      .limit(limit ? parseInt(limit, 10) : Number.MAX_SAFE_INTEGER)

    // console.log(result);

    // Return the query result
    return NextResponse.json({ success: true, data: result });
    }

    // Query the database for products created by the given email
    const result = await db
      .select()
      .from(trending)
      .where(eq(trending.createdBy, email))
      .orderBy(desc(trending.id));

    // console.log(result);

    // Return the query result
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching products:", error);

    // Return an error response
    return NextResponse.json({
      success: false,
      error: (error as Error).message || "An unknown error occurred.",
    });
  }
}
