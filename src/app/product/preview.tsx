import React from "react";

interface ProductPreviewProps {
  image: string;
  name: string;
  price: number;
  description?: string;
  stock?: number;
}

const ProductPreview: React.FC<ProductPreviewProps> = ({
  image,
  name,
  price,
  description,
  stock,
}) => (
  <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center max-w-md w-full">
    <img
      src={image}
      alt={name}
      className="w-48 h-48 object-cover rounded mb-6"
    />
    <h2 className="text-2xl font-bold mb-2 text-gray-800">{name}</h2>
    <p className="text-lg text-green-600 font-semibold mb-2">
      {new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(price)}
    </p>
    {typeof stock === "number" && (
      <p className="text-xs text-gray-500 mb-2">Stok: {stock}</p>
    )}
    <p className="text-gray-600 text-center">
      {description || "Deskripsi produk tidak tersedia."}
    </p>
  </div>
);

export default ProductPreview;