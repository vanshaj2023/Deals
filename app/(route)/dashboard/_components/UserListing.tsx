"use client";

import Link from "next/link";

const UserListing = () => {
  return (
    <div className="mt-5">
      <h2 className="font-bold text-xl flex justify-between items-center">
        Tracked Products
        <Link href="/add-product">
          <button className="text-sm font-medium px-4 py-2 bg-black text-white rounded-full">
            + Track a product
          </button>
        </Link>
      </h2>
      <div className="mt-8 text-center text-gray-500">
        <p>No products tracked yet.</p>
        <p className="text-sm mt-1">Paste a product URL above to start tracking prices.</p>
      </div>
    </div>
  );
};

export default UserListing;
