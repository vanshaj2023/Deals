import { db } from "@/config/db";
import { trending } from "@/config/db/schema";
import { desc, like } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { limit, offset,searchText } = await req.json();

    try {
        const result = await db
            .select()
            .from(trending)
            .where(like(trending.title, '%' + searchText + '%'))
            .orderBy(desc(trending.id))
            .limit(Number(limit)) // Ensure `limit` is correctly parsed as a number
            .offset(offset); // Use provided offset for pagination

        return NextResponse.json({
            success: true,
            data: result // Match the structure expected by the frontend
        });
    } catch (error) {
        console.error("Error fetching products:", error);

        return NextResponse.json({
            success: false,
            error: (error as Error).message || "An unknown error occurred."
        });
    }
}
