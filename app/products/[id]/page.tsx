import PriceInfoCard from "@/components/PriceInfoCard";
import { getProductById, getSimilarProducts } from "@/lib/actions";
import { formatNumber } from "@/lib/utils";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

type Props = {
  params: { id: string };
};

const ProductDetails = async ({ params: { id } }: Props) => {
  const product = await getProductById(id);
  if (!product) redirect("/");

  const similarProducts = await getSimilarProducts(id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex gap-8 xl:flex-row flex-col">
        <div className="xl:w-1/2 w-full bg-white p-6 rounded-lg shadow-md">
          <div className="aspect-square relative overflow-hidden rounded-lg">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-contain hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>
        </div>

        <div className="xl:w-1/2 w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
            <Link
              href={product.url}
              target="_blank"
              className="text-blue-600 hover:underline text-base"
            >
              Visit Product Page
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-gray-900">
                {product.currency} {formatNumber(product.currentPrice)}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  {product.currency} {formatNumber(product.originalPrice)}
                </span>
              )}
              {product.originalPrice && (
                <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  {Math.round(
                    ((product.originalPrice - product.currentPrice) /
                      product.originalPrice) * 100
                  )}% OFF
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 mt-2">
              <Image src="/assets/icons/star.svg" alt="Rating" width={16} height={16} />
              <span className="text-sm font-medium text-gray-700">
                {product.stars} ({formatNumber(product.reviewsCount)}+ reviews)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <PriceInfoCard
              title="Current Price"
              iconSrc="/assets/icons/price-tag.svg"
              value={`${product.currency} ${formatNumber(product.currentPrice)}`}
            />
            <PriceInfoCard
              title="Average Price"
              iconSrc="/assets/icons/chart.svg"
              value={`${product.currency} ${formatNumber(product.averagePrice)}`}
            />
            <PriceInfoCard
              title="Highest Price"
              iconSrc="/assets/icons/arrow-up.svg"
              value={`${product.currency} ${formatNumber(product.highestPrice)}`}
            />
            <PriceInfoCard
              title="Lowest Price"
              iconSrc="/assets/icons/arrow-down.svg"
              value={`${product.currency} ${formatNumber(product.lowestPrice)}`}
            />
          </div>

          {/* Phase 1: track button will be wired to TrackedProduct */}
          <Link
            href={product.url}
            target="_blank"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Buy Now
          </Link>
        </div>
      </div>

      <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
        <div className="prose max-w-none text-gray-700">
          {product?.description?.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>
      </div>

      {similarProducts && similarProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2>
          <div className="flex flex-col gap-4">
            {similarProducts.map((p: Product) => (
              <Link key={p._id} href={`/products/${p._id}`} className="flex gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image src={p.image} alt={p.title} fill className="object-contain" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 line-clamp-2">{p.title}</p>
                  <p className="text-gray-600 mt-1">{p.currency} {formatNumber(p.currentPrice)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
