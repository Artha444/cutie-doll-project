"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Sparkles,
  SearchX,
} from "lucide-react";
import { PRODUCTS, Product, type CartItem } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

export default function FavoritesPage() {
  const router = useRouter();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cart, setCart] = useState<CartItem[]>([]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const favIds: string[] = JSON.parse(
        localStorage.getItem("simoengil_favorites") || "[]"
      );

      if (favIds.length === 0) {
        setFavoriteProducts([]);
        setLoading(false);
        return;
      }

      // Fetch dynamic products from Supabase
      const { data: dbProducts } = await supabase
        .from("products")
        .select("*");

      const allMerged: Product[] = [...PRODUCTS];

      if (dbProducts && dbProducts.length > 0) {
        dbProducts.forEach((dbItem: any) => {
          const exists = allMerged.some((p) => p.id === String(dbItem.id));
          if (!exists) {
            allMerged.push({
              id: String(dbItem.id),
              name: dbItem.name,
              price: Number(dbItem.price),
              category: dbItem.category,
              image: dbItem.image,
              description: dbItem.description,
              rating: Number(dbItem.rating || 5.0),
              reviewsCount: Number(dbItem.reviews_count || 0),
              shopeeLink: dbItem.shopee_link || "",
              shopeePrice: dbItem.shopee_price,
              shopeeAvailable: dbItem.specifications?.shopeeAvailable ?? true,
              specifications: dbItem.specifications || {},
            });
          }
        });
      }

      const filtered = allMerged.filter((p) => favIds.includes(p.id));
      setFavoriteProducts(filtered);
    } catch (e) {
      console.error("Failed to load favorites:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();

    // Cart loading
    const savedCart = localStorage.getItem("simoengil_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {}
    }

    const handleFavUpdate = () => loadFavorites();
    window.addEventListener("favorites_updated", handleFavUpdate);

    return () => {
      window.removeEventListener("favorites_updated", handleFavUpdate);
    };
  }, []);

  const handleClearAll = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua produk dari daftar favorit?")) {
      localStorage.setItem("simoengil_favorites", JSON.stringify([]));
      setFavoriteProducts([]);
      window.dispatchEvent(new Event("favorites_updated"));
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F3] text-[#2C2C2C] font-sans pt-24 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[15%] -left-[10%] w-[35vw] h-[35vw] rounded-full bg-[#FFE4EC]/40 blur-3xl" />
        <div className="absolute top-[50%] -right-[10%] w-[30vw] h-[30vw] rounded-full bg-[#FFB6C8]/20 blur-3xl" />
      </div>

      <main className="max-w-7xl mx-auto relative z-10">
        {/* Top Header & Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#FF8FB1] hover:text-[#FF8FB1]/80 transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dashed border-[#FCE6CB] pb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFE4EC] text-[#FF8FB1] text-xs font-black rounded-full border border-[#FFB6C8]/40">
                  <Heart className="w-3.5 h-3.5 fill-[#FF8FB1]" />
                  Favorit Saya
                </span>
                <span className="text-xs font-bold text-[#7A6A5E] bg-[#FFF5F0] px-2.5 py-1 rounded-full border border-[#FCE6CB]">
                  {favoriteProducts.length} Boneka
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-[#4A3B32] tracking-tight font-heading">
                Koleksi Yang Anda Sukai 💖
              </h1>
            </div>

            {favoriteProducts.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-4 py-2.5 rounded-xl transition-all self-start sm:self-auto cursor-pointer active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                Kosongkan Favorit
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center p-8">
            <div className="w-10 h-10 border-4 border-[#FFB6C8]/30 border-t-[#FF8FB1] rounded-full animate-spin mb-3" />
            <p className="text-sm font-bold text-[#7A6A5E] animate-pulse">
              Memuat koleksi favorit Anda...
            </p>
          </div>
        ) : favoriteProducts.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-8 sm:p-14 max-w-lg mx-auto text-center shadow-lg border border-[#FFB6C8]/20 my-12 space-y-6">
            <div className="w-24 h-24 rounded-full bg-[#FFF5F0] flex items-center justify-center border border-[#FFB6C8]/30 mx-auto text-4xl animate-float">
              <SearchX className="w-12 h-12 text-[#FF8FB1]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#4A3B32] font-heading">
                Belum Ada Boneka Favorit
              </h2>
              <p className="text-sm text-[#7A6A5E] mt-2 leading-relaxed font-medium">
                Anda belum menyukai boneka apapun. Klik ikon hati pada produk pilihan Anda untuk menyimpannya di sini!
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 w-full py-4 bg-[#FF8FB1] hover:bg-[#FF8FB1]/90 text-white rounded-2xl font-extrabold text-sm transition-all shadow-md active:scale-[0.98] text-center cursor-pointer"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              Jelajahi Semua Produk
            </Link>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
            {favoriteProducts.map((p, idx) => (
              <div key={p.id} className="flex flex-col h-full">
                <ProductCard
                  product={p}
                  index={idx}
                  cartItemCount={cart
                    .filter((c) => c.id === p.id)
                    .reduce((sum, c) => sum + c.quantity, 0)}
                  onDetailClick={(prod) => router.push(`/product/${prod.id}`)}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
