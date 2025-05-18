import Product from "@/lib/models/product.model";
import { connectToDB } from "@/lib/mongoose";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDB();

    const deals = await Product.find(
      { discountRate: { $gt: 0 } },
      { 
        title: 1,
        currentPrice: 1,
        discountRate: 1,
        image: 1,
        createdAt: 1,
        _id: 1
      }
    ).sort({ discountRate: -1, createdAt: -1 });

    const formattedDeals = deals.map(deal => ({
      _id: deal._id.toString(),
      title: deal.title,
      currentPrice: deal.currentPrice,
      discountRate: deal.discountRate,
      image: deal.image,
      createdAt: deal.createdAt.toISOString()
    }));
    console.log('Deals fetched successfully:', formattedDeals);

    res.status(200).json(formattedDeals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
}