// import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState } from "react";

const ImageUpload: React.FC = () => {
  const [image, setImage] = useState<string | null>(null); // Strictly type as a string for compatibility.

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      console.log(file); // For debugging purposes.
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === "string") {
          setImage(reader.result); // Set the base64 image URL.
        }
      };
      reader.readAsDataURL(file); // Convert file to base64 URL.
    }
  };

  return (
    <div className="gap-5">
      <h2 className="text-lg font-bold mb-4">Upload Product Image</h2>
      <input
        type="file"
        id="imageupload"
        name="image"
        className="hidden"
        accept="image/*" // Ensures only images can be selected.
        onChange={handleFileChange}
      />
      <label htmlFor="imageupload">
        <div className="p-10 flex justify-center items-center border border-gray-300 rounded-lg cursor-pointer bg-slate-300 hover:bg-slate-400 transition-all">
          {image ? (
            // Render dynamic uploaded image:
            <Image
              src={image}
              alt="Uploaded Preview"
              width={300}
              height={300}
              className="object-contain h-[200px]"
              unoptimized // Use `unoptimized` for base64 data to bypass Next.js optimizations.
            />
          ) : (
            // Render fallback image:
            <Image
              src="/image.png" // Ensure this fallback image exists in the `/public` folder.
              alt="Fallback Image"
              width={70}
              height={70}
            />
          )}
        </div>
      </label>
    </div>
  );
};

export default ImageUpload;