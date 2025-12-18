import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { limit, offset, searchText } = await req.json();

    try {
        await connectToDB();
        const query = searchText 
            ? { title: { $regex: searchText, $options: 'i' } }
            : {};
        const result = await Product.find(query)
            .sort({ 
                isPromoted: -1,    
                productType: 1,       
                promotedAt: -1,       
                createdAt: -1
            })
            .limit(Number(limit))
            .skip(offset);
            
        const transformedProducts = result.map(product => ({
            id: product._id.toString(),
            _id: product._id,
            title: product.title,
            price: product.currentPrice,
            currentPrice: product.currentPrice,
            originalPrice: product.originalPrice,
            category: product.category,
            image: product.image,
            link: product.link || product.url,
            url: product.url,
            description: product.description,
            currency: product.currency,
            productType: product.productType,
            isPromoted: product.isPromoted,
            discountRate: product.discountRate,
            isOutOfStock: product.isOutOfStock,
            createdAt: product.createdAt
        }));

        return NextResponse.json({
            success: true,
            data: transformedProducts
        });
    } catch (error) {
        console.error("Error fetching products:", error);

        return NextResponse.json({
            success: false,
            error: (error as Error).message || "An unknown error occurred."
        });
    }
}
