import { db } from "@/config/db";
import { trending, wishlistsTable } from "@/config/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Parse JSON data from request body
    const data = await req.json();

    // Validate input data
    if (!data?.useremail || !data?.productId) {
      throw new Error("Both useremail and productId are required.");
    }

    console.log("Received Data:", data);

    // Add product to wishlist
    const result = await db
      .insert(wishlistsTable)
      .values({
        useremailId: data.useremail, // Use consistent field naming
        productId: data.productId,
      })
      .returning();

    console.log("Wishlist entry added:", result);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error adding product to wishlist:", error);

    return NextResponse.json({
      success: false,
      error: (error as Error).message || "An unknown error occurred while adding the product to the wishlist.",
    });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    console.log(req.url)
    const useremailId = searchParams.get("userId"); // Get user email from query parameters

    // Validate input
    console.log(useremailId)
    if (!useremailId) {
      throw new Error("User email is required to fetch wishlist data.");
    }

    console.log("Fetching wishlist for User Email:", useremailId);

    // Fetch wishlist items with product details
    const result = await db
      .select({
        id: wishlistsTable.id,
        productId: trending.id,
        name: trending.title,
        price: trending.price,
        description: trending.description,
        category: trending.category,
        link: trending.link,
        image: trending.image
      })
      .from(wishlistsTable)
      .innerJoin(trending, eq(wishlistsTable.productId, trending.id))
      .where(eq(wishlistsTable.useremailId, useremailId)); // Match user email

    console.log("Fetched Wishlist Data:", result);

    // getproduct(result.data.productId)

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching wishlist products:", error);

    return NextResponse.json({
      success: false,
      error: (error as Error).message || "An unknown error occurred while fetching the wishlist.",
    });
  }
}

// async function getproduct(id) {
//   const result= await db.select().from(trending)
// }
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const useremailId = searchParams.get("useremail");
    const productId = searchParams.get("productId");

    if (!useremailId || !productId) {
      return NextResponse.json(
        { success: false, error: "Both useremail and productId are required" },
        { status: 400 }
      );
    }

    const numericProductId = Number(productId);
    if (isNaN(numericProductId)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const [deletedItem] = await db
      .delete(wishlistsTable)
      .where(
        and(
          eq(wishlistsTable.useremailId, useremailId),
          eq(wishlistsTable.productId, numericProductId)
        )
      )
      .returning();

    if (!deletedItem) {
      return NextResponse.json(
        { success: false, error: "Item not found in wishlist" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: deletedItem },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}