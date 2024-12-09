import Product from "../../lib/models/product.model";
import { connectToDB } from "../../lib/mongoose";

export default async function handler(req, res) {
  await connectToDB();

  try {
    const deals = await Product.find({ discountRate: { $gt: 0 } });
    res.status(200).json(deals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
}
