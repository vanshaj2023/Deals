import { db } from "@/config/db";
import { trending, wishlistsTable } from "@/config/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data?.useremail || !data?.productId) {
      return NextResponse.json(
        { success: false, error: "Both useremail and productId are required" },
        { status: 400 }
      );
    }

    const existingEntry = await db
      .select()
      .from(wishlistsTable)
      .where(
        and(
          eq(wishlistsTable.useremailId, data.useremail),
          eq(wishlistsTable.productId, data.productId)
        )
      );

    if (existingEntry.length > 0) {
      return NextResponse.json(
        { success: false, error: "Product already in wishlist" },
        { status: 409 }
      );
    }

    const [result] = await db
      .insert(wishlistsTable)
      .values({
        useremailId: data.useremail,
        productId: data.productId,
      })
      .returning();

    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const useremailId = searchParams.get("useremail");

    if (!useremailId) {
      return NextResponse.json(
        { success: false, error: "User email is required" },
        { status: 400 }
      );
    }

    const wishlistItems = await db
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
      .where(eq(wishlistsTable.useremailId, useremailId));

    return NextResponse.json(
      { success: true, data: wishlistItems },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

export async function GETCheck(req: Request) {
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

    const result = await db
      .select()
      .from(wishlistsTable)
      .where(
        and(
          eq(wishlistsTable.useremailId, useremailId),
          eq(wishlistsTable.productId, numericProductId)
        )
      );

    const isInWishlist = result.length > 0;

    return NextResponse.json(
      { 
        success: true, 
        isInWishlist,
        data: isInWishlist ? result[0] : null 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error checking wishlist:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}