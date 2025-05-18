"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChartLine, PenBox, Trash2, MoreVertical } from "lucide-react";

interface ProductEditOptionProps {
  children?: React.ReactNode;
  onEdit?: () => void;
  onAnalyze?: () => void;
  onDelete?: () => void;
}

const ProductEditOption: React.FC<ProductEditOptionProps> = ({
  children,
  onEdit,
  onAnalyze,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleOptionClick = (handler?: () => void) => {
    handler?.();
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
        // aria-label="More options"
        // aria-haspopup="true"
        // aria-expanded={isOpen || false} /// string format for accessibility tools
      >
        {children || <MoreVertical className="w-5 h-5 text-gray-600" />}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className=" right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 border border-gray-200 animate-fadeIn"
        >
          <ul className="py-1">
            <li
              onClick={() => handleOptionClick(onEdit)}
              className="flex items-center gap-3 hover:bg-gray-50 px-4 py-2 text-sm text-gray-700 cursor-pointer"
            >
              <PenBox className="w-4 h-4" />
              <span>Edit Product</span>
            </li>
            <li
              onClick={() => handleOptionClick(onAnalyze)}
              className="flex items-center gap-3 hover:bg-gray-50 px-4 py-2 text-sm text-green-600 cursor-pointer"
            >
              <ChartLine className="w-4 h-4" />
              <span className="text-green-600">View Analytics</span>
            </li>
            <li
              onClick={() => handleOptionClick(onDelete)}
              className="flex items-center gap-3 hover:bg-gray-50 px-4 py-2 text-sm text-red-600 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Product</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductEditOption;
