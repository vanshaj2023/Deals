"use strict";
// import React from 'react';
// import { getAllProducts } from '@/lib/actions';
// import Search from '@/components/Search';
// import { Product } from '@/types'; // Ensure you have this import
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
var react_1 = __importDefault(require("react"));
var search = function () {
    return (<div>
       search
     </div>);
};
exports.default = search;
