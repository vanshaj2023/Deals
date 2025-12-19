import { connectToDB } from "@/lib/mongoose";
import Wishlist from "@/lib/models/wishlist.model";
import Product from "@/lib/models/product.model";
import User from "@/lib/models/user.model";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    console.log("📥 Wishlist POST called");
    await connectToDB();

    // Parse JSON data from request body
    const data = await req.json();

    // Validate input data
    if (!data?.useremail || !data?.productId) {
      console.error("❌ Missing required fields");
      throw new Error("Both useremail and productId are required.");
    }

    console.log("Received wishlist data:", data);

    // Find or create user
    let user = await User.findOne({ email: data.useremail });
    if (!user) {
      user = await User.create({
        email: data.useremail,
        name: data.useremail.split('@')[0],
        role: 'user'
      });
    }

    // Check if product exists
    const product = await Product.findById(data.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({
      userId: user._id,
      productId: data.productId
    });

    if (existing) {
      return NextResponse.json({ 
        success: true, 
        message: "Product already in wishlist",
        result: existing 
      });
    }

    // Add product to wishlist
    const result = await Wishlist.create({
      userId: user._id,
      userEmail: data.useremail,
      productId: data.productId,
    });

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
    // console.log("Wishlist GET called");
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const useremailId = searchParams.get("userId");

    // Validate input
    console.log("User email:", useremailId);
    if (!useremailId) {
      console.error("No user email provided");
      throw new Error("User email is required to fetch wishlist data.");
    }

    console.log("Fetching wishlist for:", useremailId);

    // Find user
    const user = await User.findOne({ email: useremailId });
    if (!user) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Fetch wishlist 
    const wishlistItems = await Wishlist.find({ 
      $or: [
        { userId: user._id },
        { userEmail: useremailId }
      ]
    }).populate('productId');

    const result = wishlistItems.map((item: any) => ({
      id: item._id,
      productId: item.productId._id,
      name: item.productId.title,
      price: item.productId.currentPrice,
      description: item.productId.description,
      category: item.productId.category,
      link: item.productId.link || item.productId.url,
      image: item.productId.image,
    }));

    console.log("Fetched Wishlist Data:", result);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching wishlist products:", error);

    return NextResponse.json({
      success: false,
      error: (error as Error).message || "An unknown error occurred while fetching the wishlist.",
    });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const useremailId = searchParams.get("useremail");
    const productId = searchParams.get("productId");

    if (!useremailId || !productId) {
      return NextResponse.json(
        { success: false, error: "Both useremail and productId are required" },
        { status: 400 }
      );
    }

    // Validate if productId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: useremailId });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Delete the wishlist item
    const deletedItem = await Wishlist.findOneAndDelete({
      $or: [
        { userId: user._id, productId: productId },
        { userEmail: useremailId, productId: productId }
      ]
    });

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