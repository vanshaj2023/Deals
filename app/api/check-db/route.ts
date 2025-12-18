import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import User from "@/lib/models/user.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Checking database status...");
    await connectToDB();

    const totalProducts = await Product.countDocuments();
    const promotedProducts = await Product.countDocuments({ isPromoted: true });
    const regularProducts = await Product.countDocuments({ isPromoted: false });
    const totalUsers = await User.countDocuments();

    const samplePromoted = await Product.find({ isPromoted: true }).limit(3);
    
    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        promotedProducts,
        regularProducts,
        totalUsers
      },
      sampleProducts: samplePromoted.map(p => ({
        id: p._id,
        title: p.title,
        price: p.currentPrice,
        isPromoted: p.isPromoted,
        promotedBy: p.promotedBy
      })),
      message: promotedProducts > 0 
        ? `Found ${promotedProducts} promoted products!` 
        : "No promoted products found. Please seed the database."
    });
  } catch (error) {
    console.error("❌ Error checking database:", error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
