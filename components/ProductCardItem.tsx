"use client";
import React, { useState, useEffect } from "react";
import { MoreVertical, PenBox, Trash2, ChartLine, Heart, ExternalLink } from "lucide-react";
import Image from "next/image";
// import wish from "../public/assets/icons/black-heart.svg";
import axios from "axios";

interface ProductCardItemProps {
  product: {
    id: string;
    title: string;
    price: number;
    category?: string;
    image?: string;
    link?: string;
  };
  useremail: string;
  editable?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onAnalyze?: () => void;
}

const ProductCardItem: React.FC<ProductCardItemProps> = ({
  product,
  useremail,
  editable = false,
  onEdit,
  onDelete,
  onAnalyze
}) => {
  const { id: productId, title, price, category, image, link } = product;
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!useremail) return;

      try {
        const response = await axios.get(`/api/wishlist/check?useremail=${useremail}&productId=${productId}`);
        setIsWishlisted(response.data.isInWishlist);
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [useremail, productId]);

  const toggleWishlist = async () => {
    if (!useremail) {
      alert("Please log in to manage your wishlist.");
      return;
    }

    try {
      setAddingToWishlist(true);

      if (isWishlisted) {
        const response = await axios.delete(`/api/wishlist?useremail=${useremail}&productId=${productId}`);
        if (response.data.success) {
          setIsWishlisted(false);
        }
      } else {
        const response = await axios.post("/api/wishlist", {
          useremail,
          productId,
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
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
      {/* Product Image with Wishlist Button */}
      <div className="relative w-full h-48 group">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}

        {/* Wishlist Button (Top Right) */}
        <button
          onClick={toggleWishlist}
          disabled={addingToWishlist}
          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm bg-white/70 hover:bg-white transition-all ${addingToWishlist ? "cursor-not-allowed" : ""
            }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {addingToWishlist ? (
            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          ) : isWishlisted ? (
            <Heart className="w-5 h-5 fill-red-500 text-red-500" />
          ) : (
            <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
          )}
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{title}</h3>
          {editable && (
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 mb-3">{category}</p>

        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">₹{price}</span>

          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm"
            >
              <span>View</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-xs text-gray-400">No link available</span>
          )}
        </div>
      </div>

      {/* Edit Options Dropdown */}
      {showOptions && (
        <div className="absolute right-2 top-12 bg-white rounded-md shadow-lg z-10 border border-gray-200 w-48">
          <button
            className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 text-left"
            onClick={() => {
              onEdit?.();
              setShowOptions(false);
            }}
          >
            <PenBox className="w-4 h-4 text-gray-600" />
            <span className="text-sm">Edit Product</span>
          </button>
          <button
            className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 text-left"
            onClick={() => {
              onAnalyze?.();
              setShowOptions(false);
            }}
          >
            <ChartLine className="w-4 h-4 text-green-600" />
            <span className="text-sm">View Analytics</span>
          </button>
          <button
            className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 text-left text-red-600"
            onClick={() => {
              onDelete?.();
              setShowOptions(false);
            }}
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Delete Product</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCardItem;