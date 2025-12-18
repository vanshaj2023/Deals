import { connectToDB } from "@/lib/mongoose";
import Wishlist from "@/lib/models/wishlist.model";
import User from "@/lib/models/user.model";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const useremail = searchParams.get("useremail");
    const productId = searchParams.get("productId");

    // Validate input
    if (!useremail || !productId || productId === 'undefined') {
      return NextResponse.json({ 
        success: false,
        isInWishlist: false,
        error: "User email and valid product ID are required" 
      });
    }

    await connectToDB();

    // Find user
    const user = await User.findOne({ email: useremail });
    if (!user) {
      return NextResponse.json({ 
        success: true,
        isInWishlist: false 
      });
    }

    // Check if product is in wishlist
    const wishlistItem = await Wishlist.findOne({
      userId: user._id,
      productId: productId
    });

    return NextResponse.json({ 
      success: true,
      isInWishlist: !!wishlistItem 
    });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    
    return NextResponse.json({
      success: false,
      isInWishlist: false,
      error: (error as Error).message || "An unknown error occurred"
    });
  }
}
