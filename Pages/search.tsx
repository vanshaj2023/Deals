// import React from 'react';
// import { getAllProducts } from '@/lib/actions';
// import Search from '@/components/Search';
// import { Product } from '@/types'; // Ensure you have this import

// export const getStaticProps = async () => {
//     const products: Product[] = (await getAllProducts()) || []; // Explicitly type products and ensure it's an array
//     return { props: { products } };
// };

// interface SearchProps {
//     products: Product[]; // Define the props interface
// }

// const SearchPage: React.FC<SearchProps> = ({ products }) => {
//     return (
//         <div className="container mx-auto p-4">
//             <h1 className="text-2xl font-bold mb-4">Welcome to Our Store</h1>
//             <Search products={products} />
//         </div>
//     );
// };

// export default SearchPage;
 import React from 'react'
 
 const search = () => {
   return (
     <div>
       search
     </div>
   )
 }
 
 export default search;
 