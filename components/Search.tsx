// import React, { useState } from 'react';
// import { Product } from '@/types';
// import ProductCard from './ProductCard';

// interface Props {
//   products: Product[];
// }

// const Search: React.FC<Props> = ({ products }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

//   const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const term = event.target.value;
//     setSearchTerm(term);

//     if (term.length > 0) {
//       const filtered = products.filter((product) =>
//         product.title.toLowerCase().includes(term.toLowerCase())
//       );
//       setFilteredProducts(filtered);
//     } else {
//       setFilteredProducts([]);
//     }
//   };

//   return (
//     <div className="search-bar mb-6">
//       <input
//         type="text"
//         value={searchTerm}
//         onChange={handleSearch}
//         placeholder="Search products..."
//         className="input w-full p-2 border rounded"
//       />
//       <div className="search-results mt-4">
//         {filteredProducts.map((product) => (
//           <ProductCard key={product._id} product={product} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Search;

import React from 'react'

const Search = () => {
  return (
    <div>
      search
    </div>
  )
}

export default Search
