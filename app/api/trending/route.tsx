import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import User from "@/lib/models/user.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // console.log("Trending API POST called");
    await connectToDB();
    const formData = await req.formData();
    const data = JSON.parse(formData.get("data") as string);

    if (!data) {
      throw new Error("Data is required but not provided in the request.");
    }

    console.log("Received promoted product data:", data);

    // Verify user exists or create one
    let user = await User.findOne({ email: data?.userEmail });
    if (!user) {
      console.log("✨ Creating new promoter user:", data?.userEmail);
      user = await User.create({
        email: data?.userEmail,
        name: data?.userEmail?.split('@')[0] || 'Promoter',
        role: 'promoter'
      });
    } else {
      console.log("user exists:", user._id);
    }

    const productData = {
      title: data?.title || "Untitled Product",
      currentPrice: Number(data?.price) || 0,
      originalPrice: Number(data?.price) || 0,
      description: data?.description || "",
      category: data?.category || "Others",
      link: data?.link || data?.url || '#',
      url: data?.link || data?.url || `https://promoted-${Date.now()}.example.com`,
      image: data?.imglink || "https://via.placeholder.com/300",
      about: data?.about || "",
      currency: '$',
      productType: 'promoted', // Mark as promoted product type
      isPromoted: true,
      promotedBy: data?.userEmail,
      promotedAt: new Date(),
      discountRate: 0,
      priceHistory: [{ price: Number(data?.price) || 0, date: new Date() }],
      lowestPrice: Number(data?.price) || 0,
      highestPrice: Number(data?.price) || 0,
      averagePrice: Number(data?.price) || 0,
      isOutOfStock: false,
      reviewsCount: 0,
    };

    console.log("Creating promoted product:", productData.title);
    const result = await Product.create(productData);
    console.log("product created:", result._id);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error in trending POST:", error);

    // Send error details in response
    return NextResponse.json({
      success: false,
      error: (error as Error).message || "An unknown error occurred.",
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // console.log("Trending API GET called");
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const limit = searchParams.get("limit");

    console.log("Query params - email:", email, "limit:", limit);

    if (!email) {
      // Get all promoted products
      const result = await Product.find({ isPromoted: true })
        .sort({ promotedAt: -1 })
        .limit(limit ? parseInt(limit, 10) : 100);

      console.log("Found", result.length, "promoted products");
      return NextResponse.json({ success: true, data: result });
    }

    // Query the database for promoted products created by the given email
    const result = await Product.find({ 
      isPromoted: true, 
      promotedBy: email 
    }).sort({ promotedAt: -1 });

    console.log("Found", result.length, "products for user:", email);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching trending products:", error);

    // Return an error response
    return NextResponse.json({
      success: false,
      error: (error as Error).message || "An unknown error occurred.",
    }, { status: 500 });
  }
}
