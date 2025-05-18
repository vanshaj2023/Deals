import Modal from "@/components/Modal";
import PriceInfoCard from "@/components/PriceInfoCard";
import ProductCard from "@/components/ProductCard";
import ShareButton from "@/components/ShareButton";
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
  const product: Product = await getProductById(id);
  if (!product) redirect("/");

  const similarProducts = await getSimilarProducts(id);
  const recommendationRate = Math.floor(Math.random() * 10 + 85); // 85-94%

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Main Product Section */}
      <div className="flex gap-8 xl:flex-row flex-col">
        {/* Product Image */}
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

        {/* Product Info */}
        <div className="xl:w-1/2 w-full flex flex-col gap-6">
          {/* Title and Actions */}
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {product.title}
              </h1>
              <Link
                href={product.url}
                target="_blank"
                className="text-blue-600 hover:underline text-base"
              >
                Visit Product Page
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Image 
                  src="/assets/icons/red-heart.svg"
                  alt="Wishlist"
                  width={20}
                  height={20}
                />
                <span className="text-sm font-medium text-gray-700">
                  {formatNumber(product.reviewsCount || 1000)}+
                </span>
              </div>

              <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                <Image
                  src="/assets/icons/bookmark.svg"
                  alt="Bookmarks"
                  width={16}
                  height={16}
                />
                <span className="text-sm font-medium text-gray-700">
                  {formatNumber(100)}+
                </span>
              </div>

              <ShareButton/>
            </div>
          </div>

          {/* Price Section */}
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

            {/* Reviews */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Image
                  src="/assets/icons/star.svg"
                  alt="Rating"
                  width={16}
                  height={16}
                />
                <span className="text-sm font-medium text-gray-700">
                  {product.reviewsCount || "4.5"} ({formatNumber(product.reviewsCount || 1000)}+ reviews)
                </span>
              </div>
              <span className="text-sm text-green-600 font-medium">
                {recommendationRate}% of buyers recommend
              </span>
            </div>
          </div>

          {/* Price Info Cards */}
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

          {/* Modal for Price Tracking */}
          <Modal productId={id} />
        </div>
      </div>

      {/* Product Description */}
      <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Product Description
        </h2>
        <div className="prose max-w-none text-gray-700">
          {product?.description?.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        <Link
          href={product.url}
          target="_blank"
          className="mt-6 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Image
            src="/assets/icons/bag.svg"
            alt="Buy Now"
            width={20}
            height={20}
            className="mr-2"
          />
          Buy Now
        </Link>
      </div>

      {/* Similar Products */}
      {similarProducts && similarProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Similar Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;