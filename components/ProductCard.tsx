"use client";
import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { Heart, Star } from 'lucide-react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import gsap from 'gsap';

interface Props {
  product: Product;
  showWishlist?: boolean;
}

const ProductCard = ({ product, showWishlist = false }: Props) => {
  const { data: session } = useSession();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const discountPercentage = product.originalPrice && product.currentPrice
    ? Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100)
    : product.discountRate || 0;

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6,
          ease: 'power2.out',
          delay: Math.random() * 0.2 // Stagger effect
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!imageRef.current || !cardRef.current) return;

    const handleMouseEnter = () => {
      gsap.to(imageRef.current, {
        scale: 1.05,
        duration: 0.4,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(imageRef.current, {
        scale: 1,
        duration: 0.4,
        ease: 'power2.out'
      });
    };

    const card = cardRef.current;
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!session?.user?.email || !showWishlist) return;

      try {
        const response = await axios.get(
          `/api/wishlist/check?useremail=${session.user.email}&productId=${product._id}`
        );
        setIsWishlisted(response.data.isInWishlist);
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [session?.user?.email, product._id, showWishlist]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user?.email) {
      alert("Please log in to manage your wishlist.");
      return;
    }

    try {
      setAddingToWishlist(true);

      if (isWishlisted) {
        const response = await axios.delete(
          `/api/wishlist?useremail=${session.user.email}&productId=${product._id}`
        );
        if (response.data.success) {
          setIsWishlisted(false);
        }
      } else {
        const response = await axios.post("/api/wishlist", {
          useremail: session.user.email,
          productId: product._id,
        });
        if (response.data.success) {
          setIsWishlisted(true);
        }
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    } finally {
      setAddingToWishlist(false);
    }
  };

  return (
    <Link 
      ref={cardRef}
      href={`/products/${product._id}`} 
      className="group block bg-white border border-gray-200 hover:shadow-md transition-shadow duration-200"
      aria-label={`View ${product.title}`}
    >
      {/* Product Image */}
      <div ref={imageRef} className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        {product.image ? (
          <Image 
            src={product.image}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No Image
          </div>
        )}

        {/* Wishlist Button */}
        {showWishlist && (
          <button
            onClick={toggleWishlist}
            disabled={addingToWishlist}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            {addingToWishlist ? (
              <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Heart 
                className={`w-4 h-4 ${
                  isWishlisted 
                    ? 'fill-pink-500 text-pink-500' 
                    : 'text-gray-400'
                }`} 
              />
            )}
          </button>
        )}

        {/* Out of Stock Overlay */}
        {product.isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="bg-gray-900 text-white px-3 py-1 text-sm font-medium">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3">
        {/* Title */}
        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
          {product.title}
        </h3>

        {/* Category */}
        {product.category && (
          <p className="text-xs text-gray-500 mb-2">{product.category}</p>
        )}

        {/* Price Section */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-bold text-gray-900">
            {product.currency}{product.currentPrice ? product.currentPrice.toFixed(0) : '0'}
          </span>
          {product.originalPrice && product.originalPrice > product.currentPrice && (
            <>
              <span className="text-xs text-gray-400 line-through">
                {product.currency}{product.originalPrice.toFixed(0)}
              </span>
              {discountPercentage > 0 && (
                <span className="text-xs font-medium text-orange-500">
                  ({discountPercentage}% OFF)
                </span>
              )}
            </>
          )}
        </div>

        {/* Rating */}
        {product.stars && product.stars > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5 bg-green-600 text-white px-1.5 py-0.5 rounded text-xs">
              <span className="font-medium">{product.stars.toFixed(1)}</span>
              <Star className="w-2.5 h-2.5 fill-white" />
            </div>
            {product.reviewsCount > 0 && (
              <span className="text-xs text-gray-500">
                ({product.reviewsCount.toLocaleString()})
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;