import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import User from "@/lib/models/user.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const formData = await req.formData();
    const data = JSON.parse(formData.get("data") as string);

    if (!data) {
      throw new Error("Data is required but not provided in the request.");
    }

    console.log("Received promoted product data:", data);

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

    return NextResponse.json({
      success: false,
      error: (error as Error).message || "An unknown error occurred.",
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const limit = searchParams.get("limit");

    console.log("Query params - email:", email, "limit:", limit);

    if (!email) {
      // Get all promoted products
      const result = await Product.find({ 
        productType: 'promoted',
        isPromoted: true 
      })
        .sort({ promotedAt: -1 })
        .limit(limit ? parseInt(limit, 10) : 100)
        .lean();

      const serializedResult = JSON.parse(JSON.stringify(result));

      console.log("Found", serializedResult.length, "promoted products");
      return NextResponse.json({ success: true, data: serializedResult });
    }

    const result = await Product.find({ 
      productType: 'promoted',
      isPromoted: true, 
      promotedBy: email 
    })
      .sort({ promotedAt: -1 })
      .lean();
  
    const serializedResult = JSON.parse(JSON.stringify(result));

    console.log("Found", serializedResult.length, "products for user:", email);
    return NextResponse.json({ success: true, data: serializedResult });
  } catch (error) {
    console.error("Error fetching trending products:", error);

    return NextResponse.json({
      success: false,
      error: (error as Error).message || "An unknown error occurred.",
    }, { status: 500 });
  }
}
