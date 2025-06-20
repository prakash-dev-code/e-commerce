"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useProduct, useUpdateProduct, useCreateProduct } from "@/lib/hooks";
import { toast } from "react-hot-toast";
import { Product } from "@/types/product";
import Image from "next/image";

type ProductFormProps = {
  initialData?: Product;
  mode: "add" | "edit";
};

type ImageType = {
  url: string;
  altText: string;
  file: File;
};

const CATEGORY_OPTIONS = [
  "electronics",
  "clothing",
  "books",
  "computer",
  "games_and_videos",
  "mobile_and_tablet",
  "home",
  "watches",
  "other",
];

const defaultValues = {
  name: "",
  description: "",
  price: "",
  discountedPrice: "",
  category: "",
  stock: "",
  images: [] as ImageType[],
};

const ProductForm: React.FC<ProductFormProps> = ({ initialData, mode }) => {
  const [formData, setFormData] = useState({ ...defaultValues });
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const updateProduct = useUpdateProduct();
  const createProduct = useCreateProduct();

  useEffect(() => {
    if (initialData) {
      const cleanData = {
        ...initialData,
        price: initialData.price.toString(),
        discountedPrice: initialData.discountedPrice.toString(),
        stock: initialData.stock.toString(),
        images: initialData.images || [],
      };
      //@ts-ignore
      setFormData({ ...defaultValues, ...cleanData });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const imageUrl = URL.createObjectURL(file);

      const newImage: ImageType = {
        url: imageUrl,
        altText: file.name,
        file: file, // store actual File
      };

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImage],
      }));
    }
  };

  const removeImageField = (index: number) => {
    const updated = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("discountedPrice", formData.discountedPrice);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("stock", formData.stock);

    formData.images.forEach((img, index) => {
      formDataToSend.append("images", img.file); // <-- important
      formDataToSend.append(`altText${index}`, img.altText);
    });

    if (mode === "edit") {
      updateProduct.mutate(
        { id, data: formDataToSend },
        {
          onSuccess: () => {
            toast.success("Product updated!");
            router.push("/dashboard/products");
          },
          onError: () => {
            toast.error("Update failed.");
          },
        }
      );
    } else {
      createProduct.mutate(formDataToSend, {
        onSuccess: () => {
          toast.success("Product created!");
          router.push("/dashboard/products");
        },
        onError: () => {
          toast.error("Creation failed.");
        },
      });
    }
  };

  const loading =
    mode === "edit" ? updateProduct.isLoading : createProduct.isLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-white">
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Product Name"
        className="bg-transparent py-2 px-4 border rounded text-lg w-full"
      />

      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        className="bg-transparent py-2 px-4 border rounded text-lg w-full"
      />

      <input
        name="price"
        type="number"
        value={formData.price}
        onChange={handleChange}
        min="0"
        placeholder="Price"
        className="bg-transparent py-2 px-4 border rounded text-lg w-full"
      />

      <input
        name="discountedPrice"
        type="number"
        value={formData.discountedPrice}
        onChange={handleChange}
        min="0"
        placeholder="Discounted Price"
        className="bg-transparent py-2 px-4 border rounded text-lg w-full"
      />

      <select
        name="category"
        value={formData.category}
        onChange={handleChange}
        className="bg-transparent py-2 px-4 border rounded text-lg w-full"
      >
        <option value="" className="">
          Select Category
        </option>
        {CATEGORY_OPTIONS.map((cat) => (
          <option key={cat} value={cat} className="bg-transparent">
            {cat.replace(/_/g, " ")}
          </option>
        ))}
      </select>

      <input
        name="stock"
        type="number"
        value={formData.stock}
        onChange={handleChange}
        min="0"
        placeholder="Stock"
        className="bg-transparent py-2 px-4 border rounded text-lg w-full"
      />

      {/* Image upload section */}
      <div>
        <h4 className="text-lg font-semibold mb-2">Images</h4>
        {formData.images.map((img, index) => (
          <div key={index} className="flex gap-2 mb-2 items-center">
            <Image
              src={img.url}
              alt={img.altText}
              className="w-16 h-16 object-cover rounded"
              width={64}
              height={64}
            />
            <span className="text-sm">{img.altText}</span>
            <button
              type="button"
              onClick={() => removeImageField(index)}
              className="btn btn-error btn-sm"
            >
              ✕
            </button>
          </div>
        ))}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mt-2"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-green-light text-[#000] rounded py-2"
        disabled={loading}
      >
        {loading
          ? "Saving..."
          : mode === "edit"
          ? "Update Product"
          : "Add Product"}
      </button>
    </form>
  );
};

export default ProductForm;
