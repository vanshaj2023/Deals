"use client"
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const Page = () => {
    const categoryOptions = [
        "Electronics",
        "Clothing",
        "Furniture",
        "Home Appliances",
        "Books",
        "Others",
    ];
    const [formData, setFormData] = useState<{ [key: string]: string | File }>({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const { user } = useUser();
    useEffect(() => {
        setFormData({
            userEmail: user?.primaryEmailAddress?.emailAddress || ""
        })
    }, [user]);

    const handleInputChange = (name: string, value: string | File) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        console.log(formData);
    }

    const onAddProductBtnClick = async () => {
        console.log(formData);
        setLoading(true);
        const formDataObj = new FormData();
        formDataObj.append('image', formData.image);
        formDataObj.append('data', JSON.stringify(formData));

        const result = await axios.post('/api/trending', formDataObj, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        setLoading(false);

        if(result){
            toast.success("Product added successfully");
            router.push('/dashboard');
        }
    }

    return (
        <div className="mt-5 p-6 bg-gray-100 rounded-lg shadow-lg max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800">Add New Product</h2>
            <p className="text-gray-600">
                Start adding product details for trending products
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <div className="space-y-5 mt-5">
                    {/* Image Upload Component - Replace with your custom implementation */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <label htmlFor="product-image" className="block mb-2">Image Upload Area</label>
                        <input 
                            id="product-image"
                            type="file" 
                            onChange={(e) => e.target.files && handleInputChange('image', e.target.files[0])}
                            className="mt-2"
                            aria-label="Upload product image"
                            accept="image/*"
                        />
                    </div>

                    <div>
                        <h4 className="font-medium text-gray-700 mb-1">Image Link</h4>
                        <input
                            type="text"
                            name="imglink"
                            placeholder="Image link"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-5">
                    {/* Product Title */}
                    <div>
                        <h4 className="font-medium text-gray-700 mb-1">Product Title</h4>
                        <input
                            name="title"
                            placeholder="Ex. iPhone Pro Max"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                        />
                    </div>

                    <div>
                        <h4 className="font-medium text-gray-700 mb-1">Product Link</h4>
                        <input
                            type="text"
                            name="link"
                            placeholder="Product link"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <h4 className="font-medium text-gray-700 mb-1">Price</h4>
                        <input
                            type="number"
                            name="price"
                            placeholder="$999"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <h4 className="font-medium text-gray-700 mb-1">Category</h4>
                        <select 
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            aria-label="Product category"
                        >
                            <option value="">Select a category</option>
                            {categoryOptions.map((item, index) => (
                                <option key={index} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <h4 className="font-medium text-gray-700 mb-1">Description</h4>
                        <textarea
                            name="description"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Product description"
                            rows={4}
                            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <h4 className="font-medium text-gray-700 mb-1">About Product (Optional)</h4>
                        <textarea
                            name="about"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="About your product"
                            rows={4}
                            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                        />
                    </div>
                    
                    <button 
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                        onClick={onAddProductBtnClick} 
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <Loader2Icon className="animate-spin mr-2" />
                                Processing...
                            </span>
                        ) : "Add Product"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Page;