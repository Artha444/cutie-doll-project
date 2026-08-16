"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Share2,
  MessageSquare,
  ShoppingBag,
  ShoppingCart,
  Star,
  CheckCircle,
  Sparkles,
  Smile,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Layers,
  Ruler,
  Scissors,
  Droplet,
  ShieldCheck,
  User,
  Truck,
  Shield,
  RotateCcw,
  Package,
  HeartHandshake,
  SearchX,
} from "lucide-react";
import { PRODUCTS, Product, type CartItem } from "@/data/products";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";
import { WishlistDrawer } from "@/components/WishlistDrawer";
import { SiteFooter } from "@/components/SiteFooter";
import { GSAPInitializer } from "@/components/GSAPInitializer";
import AuthModal from "@/components/AuthModal";
import { ProductCard } from "@/components/ProductCard";
import { useSiteSettings } from "@/context/SiteSettingsContext";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  // Unwrap Next.js 15 params promise
  const { id } = use(params);
  const router = useRouter();
  const { settings } = useSiteSettings();

  // States
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authRedirectUrl, setAuthRedirectUrl] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [allProducts, setAllProducts] = useState<Product[]>(PRODUCTS);
  const [whatsappSent, setWhatsappSent] = useState<boolean>(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'desc' | 'shipping' | 'features' | 'reviews'>('specs');
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      try {
        const favs = JSON.parse(localStorage.getItem('simoengil_favorites') || '[]');
        setIsWishlisted(favs.includes(product.id));
      } catch(e) {}
    }
  }, [product?.id]);

  const toggleWishlist = () => {
    if (!product) return;
    try {
      const favs = JSON.parse(localStorage.getItem('simoengil_favorites') || '[]');
      if (isWishlisted) {
        const newFavs = favs.filter((favId: string) => favId !== product.id);
        localStorage.setItem('simoengil_favorites', JSON.stringify(newFavs));
        setIsWishlisted(false);
      } else {
        favs.push(product.id);
        localStorage.setItem('simoengil_favorites', JSON.stringify(favs));
        setIsWishlisted(true);
      }
      window.dispatchEvent(new Event('favorites_updated'));
    } catch(e) {}
  };


  // Load product from Supabase & All Products & Check Admin Session & Wishlist
  useEffect(() => {
    // 1. Cart from localStorage
    const loadCart = () => {
      const savedCart = localStorage.getItem("simoengil_cart");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to load cart", e);
        }
      }
    };
    loadCart();

    window.addEventListener("cart_updated", loadCart);

    // Force scroll to top on mount
    window.scrollTo(0, 0);

    // 2. Fetch specific product
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          const specs = data.specifications || {};
          const mappedProduct: Product = {
            id: String(data.id),
            name: data.name,
            price: Number(data.price),
            category: data.category,
            image: data.image,

            description: data.description,
            rating: Number(data.rating || 5.0),
            reviewsCount: Number(data.reviews_count || 0),
            shopeeLink: data.shopee_link || "",
            shopeePrice: specs.shopeePrice || data.shopeePrice || undefined,
            shopeeAvailable:
              specs.shopeeAvailable !== undefined
                ? specs.shopeeAvailable
                : true,
            images: specs.images || data.images || [],
            specifications: {
              material: specs.material || "100% Premium Dacron & Kain Rasfur",
              size: specs.size || "Standard",
              washing: specs.washing || "Bisa dicuci mesin",
              safeForKids:
                specs.safeForKids !== undefined ? specs.safeForKids : true,
              shopeePrice: specs.shopeePrice || undefined,
              shopeeAvailable:
                specs.shopeeAvailable !== undefined
                  ? specs.shopeeAvailable
                  : true,
              images: specs.images || [],
              features: specs.features || [],
              soldCount: specs.soldCount || 0,
              testimonials: specs.testimonials || [],
              types:
                specs.types ||
                (data.variants
                  ? Array.from(
                      new Set(
                        data.variants.map((v: any) => v.type).filter(Boolean),
                      ),
                    ).map((t) => ({ name: t as string, extraPrice: 0 }))
                  : undefined),
              sizes:
                specs.sizes ||
                (data.variants
                  ? Array.from(
                      new Set(
                        data.variants.map((v: any) => v.size).filter(Boolean),
                      ),
                    ).map((s) => ({ name: s as string, extraPrice: 0 }))
                  : undefined),
            },
            variants: (data.variants || []).map((v: any) => ({
              ...v,
              shopeeAvailable:
                v.shopeeAvailable !== undefined ? v.shopeeAvailable : true,
              tokopediaAvailable:
                v.tokopediaAvailable !== undefined
                  ? v.tokopediaAvailable
                  : true,
              lazadaAvailable:
                v.lazadaAvailable !== undefined ? v.lazadaAvailable : true,
              tiktokAvailable:
                v.tiktokAvailable !== undefined ? v.tiktokAvailable : true,
            })),
          };
          setProduct(mappedProduct);
          setActiveImage(mappedProduct.image);
        } else {
          const localMockStr = localStorage.getItem("simoengil_mock_products");
          if (localMockStr) {
            const localMock = JSON.parse(localMockStr);
            const localProd = localMock.find((p: any) => p.id === id);
            if (localProd) {
              setProduct(localProd);
              setActiveImage(localProd.image);
              return;
            }
          }
          const localProd = PRODUCTS.find((p) => p.id === id);
          if (localProd) {
            setProduct(localProd);
            setActiveImage(localProd.image);
          }
        }
      } catch (err) {
        console.warn(
          "Failed to fetch product from Supabase, falling back to local list:",
          err,
        );
        const localMockStr = localStorage.getItem("simoengil_mock_products");
        if (localMockStr) {
          const localMock = JSON.parse(localMockStr);
          const localProd = localMock.find((p: any) => p.id === id);
          if (localProd) {
            setProduct(localProd);
            setActiveImage(localProd.image);
            return;
          }
        }
        const localProd = PRODUCTS.find((p) => p.id === id);
        if (localProd) {
          setProduct(localProd);
          setActiveImage(localProd.image);
        }
      } finally {
        setLoading(false);
      }
    };

    // 3. Fetch all products (for Wishlist Drawer details)
    const fetchAllProducts = async () => {
      try {
        const { data, error } = await supabase.from("products").select("*");
        if (error) throw error;
        if (data && data.length > 0) {
          const mappedData = data.map((item: any) => {
            const specs = item.specifications || {};
            return {
              id: String(item.id),
              name: item.name,
              price: Number(item.price),
              category: item.category,
              image: item.image,

              description: item.description,
              rating: Number(item.rating || 5.0),
              reviewsCount: Number(item.reviews_count || 0),
              shopeeLink: item.shopee_link || "",
              shopeePrice: specs.shopeePrice || item.shopeePrice || undefined,
              shopeeAvailable:
                specs.shopeeAvailable !== undefined
                  ? specs.shopeeAvailable
                  : true,
              specifications: {
                material: specs.material || "100% Premium Dacron & Kain Rasfur",
                size: specs.size || "Standard",
                washing: specs.washing || "Bisa dicuci mesin",
                safeForKids:
                  specs.safeForKids !== undefined ? specs.safeForKids : true,
                shopeePrice: specs.shopeePrice || undefined,
                shopeeAvailable:
                  specs.shopeeAvailable !== undefined
                    ? specs.shopeeAvailable
                    : true,
                images: specs.images || [],
                features: specs.features || [],
                soldCount: specs.soldCount || 0,
                testimonials: specs.testimonials || [],
                types:
                  specs.types ||
                  (item.variants
                    ? Array.from(
                        new Set(
                          item.variants.map((v: any) => v.type).filter(Boolean),
                        ),
                      ).map((t) => ({ name: t as string, extraPrice: 0 }))
                    : undefined),
                sizes:
                  specs.sizes ||
                  (item.variants
                    ? Array.from(
                        new Set(
                          item.variants.map((v: any) => v.size).filter(Boolean),
                        ),
                      ).map((s) => ({ name: s as string, extraPrice: 0 }))
                    : undefined),
              },
              variants: (item.variants || []).map((v: any) => ({
                ...v,
                shopeeAvailable:
                  v.shopeeAvailable !== undefined ? v.shopeeAvailable : true,
              })),
            };
          });
          setAllProducts(mappedData);
        } else {
          const localMockStr = localStorage.getItem("simoengil_mock_products");
          if (localMockStr) {
            setAllProducts(JSON.parse(localMockStr));
          } else {
            setAllProducts(PRODUCTS);
          }
        }
      } catch (err) {
        console.warn(
          "Failed to fetch all products, using local fallback:",
          err,
        );
        const localMockStr = localStorage.getItem("simoengil_mock_products");
        if (localMockStr) {
          setAllProducts(JSON.parse(localMockStr));
        } else {
          setAllProducts(PRODUCTS);
        }
      }
    };

    // 4. Check admin session
    const checkAdminSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsAdmin(session?.user?.user_metadata?.role === "admin");
        setUser(session?.user ?? null);
      } catch (err) {
        console.warn("Could not retrieve auth session:", err);
      }
    };

    checkAdminSession();
    fetchProduct();
    fetchAllProducts();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(session?.user?.user_metadata?.role === "admin");
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("cart_updated", loadCart);
    };
  }, [id]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F3] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Soft Background Decor */}
        <div className="absolute top-[20%] left-[10%] w-64 h-64 rounded-full bg-[#FFE4EC]/50 blur-3xl animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-56 h-56 rounded-full bg-[#FFB6C8]/30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Animated Icon Container */}
          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute w-24 h-24 bg-[#FFB6C8]/40 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            
            <div className="relative w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full shadow-[0_10px_40px_-10px_rgba(255,143,177,0.5)] border-2 border-[#FFE4EC] flex items-center justify-center animate-bounce">
              <Heart className="w-8 h-8 text-[#FF8FB1] fill-[#FFB6C8] animate-pulse" />
              
              {/* Cute Floating Accessories */}
              <div className="absolute -top-2 -right-3 w-7 h-7 bg-white rounded-full border border-[#FCE6CB] flex items-center justify-center shadow-sm">
                <Scissors className="w-3.5 h-3.5 text-[#D48C70]" />
              </div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white rounded-full border border-[#FCE6CB] flex items-center justify-center shadow-sm">
                <Sparkles className="w-3 h-3 text-[#E8B37D]" />
              </div>
            </div>
          </div>
          
          {/* Text Container */}
          <div className="flex flex-col items-center space-y-2">
            <h3 className="text-[#4A3B32] font-black text-xl tracking-tight">
              Mempersiapkan Kelembutan
            </h3>
            
            <div className="flex items-center gap-1.5 text-sm font-medium text-[#7A6A5E]">
              Menjahit dengan penuh cinta
              <span className="flex gap-1 ml-1">
                <span className="w-1.5 h-1.5 bg-[#FF8FB1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-[#FFB6C8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-[#FF8FB1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback if product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-[#FFF8F3] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-lg border border-[#FFB6C8]/10 space-y-6">
          <div className="w-24 h-24 rounded-full bg-[#FFF5F0] flex items-center justify-center border border-[#FFB6C8]/25 mx-auto animate-float">
            <SearchX className="w-10 h-10 text-[#FFB6C8]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#2C2C2C] font-heading">
              Teman Peluk Tidak Ditemukan
            </h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Maaf, boneka yang Anda cari mungkin sudah diadopsi oleh orang lain
              atau sedang istirahat di gudang kami.
            </p>
          </div>
          <Link
            href="/"
            className="block w-full py-4 bg-[#FF8FB1] hover:bg-[#FF8FB1]/90 text-white rounded-2xl font-extrabold text-sm transition-all shadow-md text-center"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // Derived states
  const productTypes = product.specifications?.types || [];
  const productSizes = product.specifications?.sizes || [];
  const uniqueTypes = productTypes.map((t) => t.name);
  const uniqueSizes = productSizes.map((s) => s.name);

  const hasTypes = uniqueTypes.length > 0;
  const hasSizes = uniqueSizes.length > 0;

  const selectedTypeObj = productTypes.find((t) => t.name === selectedType);
  const selectedSizeObj = productSizes.find((s) => s.name === selectedSize);

  const typeExtraPrice = selectedTypeObj?.extraPrice || 0;
  const sizeExtraPrice = selectedSizeObj?.extraPrice || 0;
  const currentPrice = product.price + typeExtraPrice + sizeExtraPrice;

  const isTypeSelected = !hasTypes || selectedType !== null;
  const isSizeSelected = !hasSizes || selectedSize !== null;
  const isPurchaseDisabled = !isTypeSelected || !isSizeSelected;

  const maxTypeExtra =
    productTypes.length > 0
      ? Math.max(...productTypes.map((t) => t.extraPrice || 0))
      : 0;
  const maxSizeExtra =
    productSizes.length > 0
      ? Math.max(...productSizes.map((s) => s.extraPrice || 0))
      : 0;

  const minPrice = product.price;
  const maxPrice = product.price + maxTypeExtra + maxSizeExtra;

  // Shopee availability logic (simplified for now to product level)
  const isShopeeAvailable =
    product.specifications?.shopeeAvailable !== false &&
    product.shopeeAvailable !== false;

  // Gallery images list (Main product photo + additional images)
  const galleryImages = [
    product.image,
    ...(product.specifications?.images || product.images || []),
  ].filter(Boolean);

  // Format IDR Price
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getMarketplacePrice = (platform: "shopee") => {
    let platPrices: number[] = [];
    if (platform === "shopee" && isShopeeAvailable) {
      if (product.specifications?.shopeePrice) {
        platPrices.push(product.specifications.shopeePrice);
      } else if (product.shopeePrice) {
        platPrices.push(product.shopeePrice);
      } else {
        platPrices.push(currentPrice);
      }
    }
    const validPlatPrices = Array.from(
      new Set(platPrices.filter((p) => typeof p === "number" && !isNaN(p))),
    );
    if (validPlatPrices.length === 0) return "";
    const minPlatPrice = Math.min(...validPlatPrices);
    return formatIDR(minPlatPrice);
  };

  // WhatsApp link generator
  const getWhatsAppLink = (productName: string, sizeName: string | null) => {
    const sizeText = sizeName ? ` ukuran ${sizeName}` : "";
    const text = `Halo Min, saya tertarik dengan Boneka ${productName}${sizeText} yang ada di website Simoengil.`;
    return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  // Sync cart to localStorage
  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    const updated = cart.map((item) => {
      if (item.cartItemId === cartItemId) {
        const newQ = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQ };
      }
      return item;
    });
    setCart(updated);
    localStorage.setItem("simoengil_cart", JSON.stringify(updated));
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    const updated = cart.filter((item) => item.cartItemId !== cartItemId);
    setCart(updated);
    localStorage.setItem("simoengil_cart", JSON.stringify(updated));
  };

  const handleAddToCart = () => {
    if (isPurchaseDisabled) return;

    const existingItemIndex = cart.findIndex(
      (item) =>
        item.id === product.id &&
        item.selectedVariantType === (selectedType || undefined) &&
        item.selectedVariantSize === (selectedSize || undefined)
    );

    let updated;
    if (existingItemIndex >= 0) {
      updated = [...cart];
      updated[existingItemIndex] = {
        ...updated[existingItemIndex],
        quantity: updated[existingItemIndex].quantity + quantity,
      };
    } else {
      const cartItemId = `${product.id}-${selectedType || "default"}-${selectedSize || "default"}-${Date.now()}`;
      const newItem: CartItem = {
        ...product,
        cartItemId,
        selectedVariantType: selectedType || undefined,
        selectedVariantSize: selectedSize || undefined,
        quantity: quantity,
        selectedPrice: currentPrice ?? 0,
      };
      updated = [...cart, newItem];
    }

    setCart(updated);
    localStorage.setItem("simoengil_cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cart_updated"));

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#FF8FB1", "#D48C70"],
    });

    setIsWishlistOpen(true);
  };

  const handleBuyNow = () => {
    if (isPurchaseDisabled) return;

    const cartItemId = `${product.id}-${selectedType || "default"}-${selectedSize || "default"}-${Date.now()}`;
    const newItem: CartItem = {
      ...product,
      cartItemId,
      selectedVariantType: selectedType || undefined,
      selectedVariantSize: selectedSize || undefined,
      quantity: quantity,
      selectedPrice: currentPrice ?? 0,
    };

    const updated = [
      ...cart.filter(
        (item) =>
          !(
            item.id === product.id &&
            item.selectedVariantType === (selectedType || undefined) &&
            item.selectedVariantSize === (selectedSize || undefined)
          )
      ),
      newItem,
    ];

    setCart(updated);
    localStorage.setItem("simoengil_cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cart_updated"));

    let checkoutUrl = `/checkout?product_id=${product.id}`;
    if (selectedType) checkoutUrl += `&type=${selectedType}`;
    if (selectedSize) checkoutUrl += `&variant=${selectedSize}`;

    if (!user) {
      setAuthRedirectUrl(checkoutUrl);
      setIsAuthModalOpen(true);
      return;
    }

    router.push(checkoutUrl);
  };

  const handleWishlistDetailClick = (p: Product) => {
    setIsWishlistOpen(false);
    router.push(`/product/${p.id}`);
  };

  const handleMarketplaceClick = (
    platform: "shopee" | "tokopedia" | "lazada" | "tiktok",
    url: string,
  ) => {
    let colors = ["#ff4d2f", "#ff8e2f", "#fff"];
    if (platform === "tokopedia") colors = ["#03ac0e", "#3cd070", "#fff"];
    if (platform === "lazada") colors = ["#0f136d", "#ff007f", "#00d2ff"];
    if (platform === "tiktok") colors = ["#000000", "#00f2fe", "#fe0979"];

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.7 },
      colors: colors,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative min-h-screen flex flex-col selection:bg-pink-100 selection:text-pink-600 bg-transparent font-sans text-[#2C2C2C]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] -left-[10%] w-[35vw] h-[35vw] rounded-full bg-[#FFE4EC]/40 blur-3xl" />
        <div className="absolute top-[40%] -right-[10%] w-[30vw] h-[30vw] rounded-full bg-[#FFB6C8]/20 blur-3xl" />
        <div className="absolute bottom-[20%] left-[5%] w-[25vw] h-[25vw] rounded-full bg-[#E8B37D]/15 blur-3xl" />
      </div>

      {/* SPACING FOR NAVBAR */}
      <div className="pt-24 sm:pt-32"></div>

      <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-0 flex-1 pb-0">

        {/* GSAP Text Animating Wrapper */}
        <GSAPInitializer />

        {/* Warm Breadcrumb */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-bold text-[#B08A6D] mb-4 max-w-[1400px] mx-auto">
          <Link href="/" className="hover:text-[#D48C70] transition-colors cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB1]">Beranda</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-[#D48C70] transition-colors cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB1]">Katalog</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#4A3B32] truncate max-w-[320px]">{product.name}</span>
        </div>

        {/* 2-COLUMN PRODUCT DETAILS LAYOUT */}
        <div className="mb-0 lg:mb-16 -mx-4 sm:-mx-6 lg:mx-0 bg-transparent pb-28 lg:pb-0">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-0 lg:gap-12 max-w-[1400px] mx-auto">
            
            {/* 1. LEFT COLUMN (GALLERY) - Order 1 */}
            <div className="lg:col-span-7 xl:col-span-8 order-1 lg:order-1 mb-0 lg:mb-0 relative z-0 gsap-reveal" data-effect="fade-up">
              
              {/* Product Gallery — "sewn fabric" frame */}
              <div className="relative flex flex-col-reverse md:flex-row gap-4 lg:gap-5 bg-[#FFFDF9] lg:bg-[#FFF8F3] p-4 sm:p-6 pb-2 lg:pb-5 rounded-none lg:rounded-[2rem] border-0 lg:border-2 lg:border-dashed lg:border-[#E8B37D]/50 lg:shadow-[0_20px_60px_-30px_rgba(212,140,112,0.35)]">
                
                {/* Fabric care-label tag (signature) */}
                <div className="absolute -top-4 left-5 lg:left-10 z-30 rotate-[-7deg] hidden sm:block">
                  <div className="relative bg-white border border-[#FCE6CB] rounded-md shadow-[0_8px_20px_-8px_rgba(74,59,50,0.35)] px-4 py-2">
                    <div className="absolute top-1/2 -left-[7px] w-3 h-3 -translate-y-1/2 rounded-full border-2 border-[#E8B37D] bg-[#FFF5F0]" />
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#D48C70] leading-none">Simoengil</p>
                    <p className="text-[11px] font-black text-[#4A3B32] leading-tight mt-1">100% Jahit Tangan</p>
                  </div>
                </div>

                {/* Thumbnails (Vertical on desktop) */}
                <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto w-full md:w-20 lg:w-24 shrink-0 pb-2 md:pb-0 scrollbar-hide">
                  {galleryImages.map((imgSrc, index) => {
                    const isActive = activeImage === imgSrc || (index === 0 && !activeImage);
                    return (
                      <button
                        key={index}
                        onClick={() => setActiveImage(imgSrc)}
                        className={`relative w-16 h-16 md:w-full md:aspect-square rounded-xl overflow-hidden bg-white border-2 transition-all duration-300 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB1] ${
                          isActive
                            ? "border-[#FF8FB1] shadow-md shadow-[#FF8FB1]/20 scale-[1.02]"
                            : "border-[#FCE6CB] hover:border-[#D48C70]"
                        }`}
                      >
                        <img
                          src={imgSrc}
                          referrerPolicy="no-referrer"
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-contain p-1.5"
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Main Image — warm "fabric swatch" stage */}
                <div className="flex-1 relative w-full aspect-square sm:aspect-[4/3] md:aspect-auto md:h-[500px] lg:h-[600px] rounded-2xl lg:rounded-3xl overflow-hidden flex items-center justify-center group bg-gradient-to-br from-[#FFF5F0] via-[#FFE4EC] to-[#FFD1DE] border border-[#FFB6C8]/30">
                  {/* Soft radial glow */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square rounded-full bg-white/60 blur-3xl" />
                  </div>
                  {/* Decorative stitch dots */}
                  <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-[#E8B37D]/40" />
                  <div className="absolute top-3 left-6 w-2 h-2 rounded-full bg-[#E8B37D]/40" />
                  <div className="absolute top-3 left-9 w-2 h-2 rounded-full bg-[#E8B37D]/40" />
                  <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-[#E8B37D]/40" />
                  <div className="absolute bottom-3 right-6 w-2 h-2 rounded-full bg-[#E8B37D]/40" />
                  <div className="absolute bottom-3 right-9 w-2 h-2 rounded-full bg-[#E8B37D]/40" />

                  {/* Back Button */}
                  <Link
                    href="/products"
                    className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-[#FFB6C8]/40 text-[#D48C70] hover:text-white hover:bg-[#FF8FB1] hover:border-[#FF8FB1] transition-all shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB1]"
                    title="Kembali"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Link>

                  <img
                    src={activeImage || product.image}
                    referrerPolicy="no-referrer"
                    alt={product.name}
                    className="relative z-10 w-full h-full object-contain p-4 md:p-8 transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                  />
                </div>
              </div>
            </div>

            {/* 3. BOTTOM TABS & DETAILS - Order 3 on mobile, Left column row 2 on desktop */}
            <div className="lg:col-span-7 xl:col-span-8 order-3 lg:order-3 mt-2 lg:mt-0 border-t border-[#FCE6CB]/50 lg:border-0 gsap-reveal" data-effect="fade-up">
              <div className="bg-white rounded-none lg:rounded-[2rem] border-0 lg:border-2 lg:border-dashed lg:border-[#E8B37D]/40 p-5 sm:p-8 shadow-none lg:shadow-[0_20px_60px_-35px_rgba(212,140,112,0.4)] pt-4 lg:pt-8">
                {/* Tab Headers Bar */}
                <div className="flex items-center gap-6 sm:gap-10 border-b border-[#FCE6CB] overflow-x-auto scrollbar-none mb-6">
                  {[
                    { id: 'desc', label: 'Deskripsi' },
                    { id: 'specs', label: 'Spesifikasi' },
                    { id: 'reviews', label: `Ulasan (${product.reviewsCount || 320})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`pb-3 text-sm sm:text-base font-bold transition-all relative whitespace-nowrap cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB1] ${
                        activeTab === tab.id || (activeTab === 'features' && tab.id === 'specs') || (activeTab === 'shipping' && tab.id === 'desc')
                          ? "text-[#4A3B32]"
                          : "text-[#7A6A5E] hover:text-[#D48C70]"
                      }`}
                    >
                      {tab.label}
                      {(activeTab === tab.id || (activeTab === 'features' && tab.id === 'specs') || (activeTab === 'shipping' && tab.id === 'desc')) && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF8FB1] to-[#FFB6C8] rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Contents */}
                <div className="text-sm text-[#5A4F49] leading-relaxed font-medium min-h-[300px]">
                  {/* Descriptions Tab */}
                  {(activeTab === 'desc' || activeTab === 'shipping') && (
                    <div className="space-y-6">
                      <div 
                        className="prose prose-sm prose-slate max-w-none prose-p:leading-loose prose-p:text-[#5A4F49] prose-strong:text-[#4A3B32] prose-headings:text-[#2A1F1A]"
                        dangerouslySetInnerHTML={{ __html: product.description.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} 
                      />

                      {/* Features grid */}
                      {product.specifications.features && product.specifications.features.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 gsap-stagger-grid">
                          {product.specifications.features.map((feat, idx) => {
                            let IconComponent = <CheckCircle className="w-5 h-5 text-[#FF8FB1]" />;
                            if (feat.icon === "🪡") IconComponent = <Scissors className="w-5 h-5 text-[#FF8FB1]" />;
                            if (feat.icon === "✨") IconComponent = <Sparkles className="w-5 h-5 text-[#FFB6C8]" />;
                            if (feat.icon === "🎁") IconComponent = <Package className="w-5 h-5 text-[#D48C70]" />;
                            if (feat.icon === "🇮🇩") IconComponent = <HeartHandshake className="w-5 h-5 text-[#E8B37D]" />;
                            
                            return (
                            <div key={idx} className="flex items-start gap-3.5 p-4 bg-[#FFF5F0] rounded-2xl border border-[#FCE6CB]/70 hover:border-[#D48C70]/40 hover:shadow-md hover:shadow-[#D48C70]/10 transition-all duration-300">
                              <div className="w-11 h-11 shrink-0 rounded-xl bg-white border border-[#FFB6C8]/40 flex items-center justify-center shadow-sm">
                                {IconComponent}
                              </div>
                              <div>
                                <p className="font-bold text-[#2A1F1A] text-sm">{feat.title}</p>
                                <p className="text-xs text-[#7A6A5E] leading-relaxed mt-1">{feat.description}</p>
                              </div>
                            </div>
                            );
                          })}
                        </div>
                      )}
                      
                      <div className="bg-[#FDF1D6] p-5 rounded-2xl border-2 border-dashed border-[#E8B37D]/50 space-y-2 mt-8">
                        <h4 className="font-bold text-[#2A1F1A] flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#F15A24]" /> Handmade with Love</h4>
                        <p className="text-xs text-[#7A6A5E] leading-relaxed">Simoengil Official Store adalah produsen boneka flanel buatan tangan terpercaya sejak 2020 dengan lebih dari 1,000+ produk diadopsi. Setiap jahitan dibuat dengan penuh kasih sayang.</p>
                      </div>
                    </div>
                  )}

                  {/* Specs Tab */}
                  {(activeTab === 'specs' || activeTab === 'features') && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-4 bg-[#FFF5F0] rounded-2xl border border-[#FCE6CB]/70 flex items-start gap-3">
                          <div className="w-9 h-9 shrink-0 rounded-xl bg-[#FFE4EC] border border-[#FFB6C8]/40 flex items-center justify-center">
                            <Layers className="w-4 h-4 text-[#FF8FB1]" />
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-[#D48C70] uppercase tracking-wider block mb-0.5">Material</span>
                            <span className="font-bold text-[#2A1F1A] text-sm leading-snug">{product.specifications.material || "100% Premium Felt"}</span>
                          </div>
                        </div>
                        <div className="p-4 bg-[#FFF5F0] rounded-2xl border border-[#FCE6CB]/70 flex items-start gap-3">
                          <div className="w-9 h-9 shrink-0 rounded-xl bg-[#FFE4EC] border border-[#FFB6C8]/40 flex items-center justify-center">
                            <Ruler className="w-4 h-4 text-[#FF8FB1]" />
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-[#D48C70] uppercase tracking-wider block mb-0.5">Ukuran</span>
                            <span className="font-bold text-[#2A1F1A] text-sm leading-snug">{product.specifications.size || "Standard"}</span>
                          </div>
                        </div>
                        <div className="p-4 bg-[#FFF5F0] rounded-2xl border border-[#FCE6CB]/70 flex items-start gap-3">
                          <div className="w-9 h-9 shrink-0 rounded-xl bg-[#FFE4EC] border border-[#FFB6C8]/40 flex items-center justify-center">
                            <Scissors className="w-4 h-4 text-[#FF8FB1]" />
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-[#D48C70] uppercase tracking-wider block mb-0.5">Pembuatan</span>
                            <span className="font-bold text-[#2A1F1A] text-sm leading-snug">100% Jahit Tangan</span>
                          </div>
                        </div>
                        <div className="p-4 bg-[#FFF5F0] rounded-2xl border border-[#FCE6CB]/70 flex items-start gap-3">
                          <div className="w-9 h-9 shrink-0 rounded-xl bg-[#FFE4EC] border border-[#FFB6C8]/40 flex items-center justify-center">
                            <Droplet className="w-4 h-4 text-[#FF8FB1]" />
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-[#D48C70] uppercase tracking-wider block mb-0.5">Perawatan</span>
                            <span className="font-bold text-[#2A1F1A] text-sm leading-snug">{product.specifications.washing || "Bersihkan secara kering"}</span>
                          </div>
                        </div>
                        <div className="p-4 bg-[#FFF5F0] rounded-2xl border border-[#FCE6CB]/70 flex items-start gap-3">
                          <div className="w-9 h-9 shrink-0 rounded-xl bg-[#FFE4EC] border border-[#FFB6C8]/40 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4 text-[#FF8FB1]" />
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-[#D48C70] uppercase tracking-wider block mb-0.5">Keamanan</span>
                            <span className="font-bold text-[#2A1F1A] text-sm leading-snug">{product.specifications.safeForKids ? "Aman untuk dekorasi & hadiah" : "Dekorasi estetik, bukan mainan balita"}</span>
                          </div>
                        </div>
                        <div className="p-4 bg-[#FFF5F0] rounded-2xl border border-[#FCE6CB]/70 flex items-start gap-3">
                          <div className="w-9 h-9 shrink-0 rounded-xl bg-[#FFE4EC] border border-[#FFB6C8]/40 flex items-center justify-center">
                            <Package className="w-4 h-4 text-[#FF8FB1]" />
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-[#D48C70] uppercase tracking-wider block mb-0.5">Kategori</span>
                            <span className="font-bold text-[#2A1F1A] text-sm leading-snug">{product.category || "Boneka Flanel"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reviews Tab */}
                  {activeTab === 'reviews' && (
                    <div className="space-y-8">
                      {/* Review Stats */}
                      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12 bg-[#FFF5F0] p-6 rounded-3xl border-2 border-dashed border-[#E8B37D]/40">
                        <div className="text-center">
                          <div className="text-4xl font-black text-[#4A3B32] font-heading">{Number(product.rating || 4.9).toFixed(1)}</div>
                          <div className="flex justify-center my-2 gap-0.5"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /><Star className="w-4 h-4 fill-amber-400 text-amber-400" /><Star className="w-4 h-4 fill-amber-400 text-amber-400" /><Star className="w-4 h-4 fill-amber-400 text-amber-400" /><Star className="w-4 h-4 text-[#E8B37D]" /></div>
                          <div className="text-xs font-bold text-[#7A6A5E]">{product.reviewsCount || 320} ulasan</div>
                        </div>
                        <div className="flex-1 w-full space-y-2">
                          {[{ star: 5, pct: '85%' }, { star: 4, pct: '10%' }, { star: 3, pct: '5%' }, { star: 2, pct: '0%' }, { star: 1, pct: '0%' }].map((r) => (
                            <div key={r.star} className="flex items-center gap-3 text-xs">
                              <span className="text-[#7A6A5E] font-bold w-3">{r.star}</span>
                              <Star className="w-3 h-3 text-[#E8B37D]" />
                              <div className="flex-1 h-2 bg-[#FCE6CB] rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-amber-400 to-[#E8B37D] rounded-full" style={{ width: r.pct }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Review List */}
                      <div className="space-y-4">
                        {product.specifications.testimonials && product.specifications.testimonials.length > 0 ? (
                          product.specifications.testimonials.map((t: any, i: number) => (
                            <div key={i} className="p-5 bg-white rounded-2xl border border-[#FCE6CB]/70 hover:border-[#D48C70]/40 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-[#2A1F1A] text-sm flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FFB6C8] to-[#FF8FB1] flex items-center justify-center text-[10px] text-white font-black">{t.name.charAt(0)}</div>
                                  {t.name}
                                </span>
                                <span className="text-amber-400 text-xs flex">
                                  {[...Array(5)].map((_, idx) => (
                                    <Star key={idx} className={`w-3 h-3 ${idx < Math.floor(t.rating) ? 'fill-amber-400 text-amber-400' : 'text-[#FCE6CB]'}`} />
                                  ))}
                                </span>
                              </div>
                              <p className="text-[#7A6A5E] text-sm leading-relaxed">{t.message}</p>
                              {t.date && <p className="text-[11px] text-[#7A6A5E] font-medium mt-2">{t.date}</p>}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-[#7A6A5E] italic">Belum ada ulasan untuk boneka lucu ini!</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. RIGHT COLUMN (STICKY PURCHASE PANEL) - Order 2 on mobile, spans 2 rows on desktop */}
            <div className="lg:col-span-5 xl:col-span-4 relative order-2 lg:row-span-2 lg:order-2 z-20 gsap-reveal" data-effect="fade-in">
              <div className="lg:sticky lg:top-28 bg-white rounded-none lg:rounded-[2rem] border-0 lg:border-2 lg:border-[#FCE6CB] lg:shadow-[0_30px_70px_-30px_rgba(212,140,112,0.45)] p-5 sm:p-8 pb-4 lg:pb-8 flex flex-col gap-5">
                
                {/* Header Info & Title */}
                <div className="space-y-4 pb-6 border-b border-dashed border-[#FCE6CB]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <span 
                        className="inline-flex items-center gap-1.5 px-4 py-1 bg-[#FDF1D6] text-[#F15A24] text-[10px] sm:text-xs font-black uppercase tracking-wider drop-shadow-sm"
                        style={{ clipPath: "polygon(10px 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0% 50%)" }}
                      >
                        <Sparkles className="w-3 h-3" />
                        {product.category || "Dolls"}
                      </span>
                      <h1 className="text-2xl sm:text-3xl font-black text-[#4A3B32] leading-tight font-heading">
                        {product.name}
                      </h1>
                      <p className="font-magilio text-base text-[#D48C70] leading-none">teman peluk yang dijahit penuh kasih</p>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-2 shrink-0">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          alert("Tautan halaman berhasil disalin!");
                        }}
                        className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-[#FFF5F0] text-[#D48C70] hover:text-white hover:bg-[#FF8FB1] border border-[#FCE6CB] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB1]"
                        title="Salin Tautan"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button onClick={toggleWishlist} className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-[#FFF5F0] text-[#D48C70] hover:text-white hover:bg-rose-500 border border-[#FCE6CB] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB1]" title="Tambah ke Wishlist">
                        <Heart className={`w-5 h-5 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-black text-[#4A3B32] tracking-tight font-heading">
                      {formatIDR(currentPrice)}
                    </span>
                    {minPrice < maxPrice && (
                      <span className="text-xs font-bold text-[#B08A6D]">mulai dari {formatIDR(minPrice)}</span>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="flex flex-wrap items-center gap-2.5 text-[11px] sm:text-xs font-bold">
                    <div className="flex items-center gap-1.5 bg-[#FFE4EC] border border-[#FFB6C8]/40 text-[#4A3B32] px-3 py-1.5 rounded-full">
                      {product.id.length % 2 === 0 ? (
                        <><CheckCircle className="w-3.5 h-3.5 text-[#FF8FB1]" /> Tersedia 12</>
                      ) : (
                        <><Sparkles className="w-3.5 h-3.5 text-[#FF8FB1]" /> Sisa 2</>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#FFF5F0] border border-[#FCE6CB] text-[#4A3B32] px-3 py-1.5 rounded-full">
                      <HeartHandshake className="w-3.5 h-3.5 text-[#D48C70]" /> Terjual {product.specifications.soldCount || 63}
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#FFF5F0] border border-[#FCE6CB] text-[#4A3B32] px-3 py-1.5 rounded-full">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {Number(product.rating || 4.9).toFixed(1)}
                      <span className="text-[#B08A6D] font-medium">({product.reviewsCount || 235})</span>
                    </div>
                  </div>
                </div>

                {/* Variants Selection */}
                <div className="space-y-5">
                  {/* Color / Type */}
                  {hasTypes && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#4A3B32]">Warna / Tipe</span>
                        <span className="text-xs font-medium text-[#B08A6D]">{selectedType || "Pilih salah satu"}</span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {productTypes.map((typeObj, index) => {
                          const isSelected = selectedType === typeObj.name;
                          return (
                            <button
                              key={`${typeObj.name}-${index}`}
                              onClick={() => {
                                setSelectedType(typeObj.name);
                                if (typeObj.image) setActiveImage(typeObj.image);
                              }}
                              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB1] ${
                                isSelected
                                  ? "bg-gradient-to-br from-[#FF8FB1] to-[#FFB6C8] border-[#FF8FB1] text-white shadow-md shadow-[#FF8FB1]/30"
                                  : "bg-white border-[#FCE6CB] text-[#5A4F49] hover:border-[#D48C70]"
                              }`}
                            >
                              {isSelected && <CheckCircle className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />}
                              {typeObj.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Size */}
                  {hasSizes && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#4A3B32]">Ukuran</span>
                        <span className="text-xs font-medium text-[#B08A6D]">{selectedSize || "Pilih ukuran"}</span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {productSizes.map((szObj, index) => {
                          const isSelected = selectedSize === szObj.name;
                          const hasExtra = (szObj.extraPrice || 0) > 0;
                          return (
                            <button
                              key={`${szObj.name}-${index}`}
                              onClick={() => setSelectedSize(szObj.name)}
                              className={`min-w-[4rem] px-3 py-2.5 rounded-xl text-sm font-bold transition-all border-2 cursor-pointer text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB1] ${
                                isSelected
                                  ? "bg-gradient-to-br from-[#FF8FB1] to-[#FFB6C8] border-[#FF8FB1] text-white shadow-md shadow-[#FF8FB1]/30"
                                  : "bg-white border-[#FCE6CB] text-[#5A4F49] hover:border-[#D48C70]"
                              }`}
                            >
                              {szObj.name}
                              {hasExtra && (
                                <span className={`block text-[10px] font-bold mt-0.5 ${isSelected ? "text-white/90" : "text-[#D48C70]"}`}>+{formatIDR(szObj.extraPrice!)}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions (Quantity + Cart) */}
                <div className="pt-2 space-y-3.5">
                  <div className="flex items-center gap-3">
                    {/* Quantity */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center w-full lg:w-auto gap-2 lg:gap-4">
                      <span className="text-sm font-bold text-[#4A3B32] lg:hidden">Jumlah:</span>
                      <div className="flex items-center bg-[#FFF8F3] rounded-2xl border-2 border-[#FCE6CB] p-1 w-[125px] lg:w-[140px] shrink-0 gap-1 shadow-xs">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center bg-amber-100/80 hover:bg-rose-500 text-amber-800 hover:text-white rounded-xl font-black text-base transition-all duration-200 disabled:opacity-40 disabled:hover:bg-amber-100/80 disabled:hover:text-amber-800 disabled:cursor-not-allowed cursor-pointer active:scale-90 shadow-xs"
                          title="Kurangi"
                        >
                          −
                        </button>
                        <span className="flex-1 text-center text-sm font-black text-[#4A3B32]">{quantity}</span>
                        <button 
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center bg-gradient-to-br from-[#FF8FB1] to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-black text-base transition-all duration-200 cursor-pointer active:scale-90 shadow-sm shadow-pink-400/30"
                          title="Tambah"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Add to Cart (+ Keranjang) */}
                    <button
                      onClick={handleAddToCart}
                      disabled={isPurchaseDisabled}
                      className={`hidden lg:flex flex-1 py-3.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all border cursor-pointer items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB1] ${
                        isPurchaseDisabled 
                          ? "bg-[#F3E7DC] border-[#F3E7DC] text-[#7A6A5E] shadow-none" 
                          : "bg-[#FFF0F3] hover:bg-[#FFE4E9] border-[#FFB6C8] text-[#FF8FB1] shadow-xs active:scale-[0.98]"
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
                      <span>{isPurchaseDisabled ? "Pilih Varian Dulu" : "+ Keranjang"}</span>
                    </button>

                    {/* Buy Now (Beli Sekarang) */}
                    <button
                      onClick={handleBuyNow}
                      disabled={isPurchaseDisabled}
                      className={`hidden lg:flex flex-1 py-3.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-md active:scale-[0.98] cursor-pointer items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB1] ${
                        isPurchaseDisabled 
                          ? "bg-[#F3E7DC] text-[#7A6A5E] shadow-none" 
                          : "bg-[#4A3B32] hover:bg-[#2A1F1A] text-white shadow-[0_12px_30px_-12px_rgba(74,59,50,0.6)]"
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                      <span>{isPurchaseDisabled ? "Pilih Varian Dulu" : "Beli Sekarang"}</span>
                    </button>
                  </div>

                  {/* Shopee Button */}
                  {isShopeeAvailable && (
                    <button
                      onClick={() => product.shopeeLink && handleMarketplaceClick("shopee", product.shopeeLink)}
                      disabled={!product.shopeeLink}
                      className={`hidden lg:flex w-full py-3.5 text-sm font-bold rounded-xl items-center justify-center gap-2 transition-all border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
                        !product.shopeeLink
                          ? "bg-[#F3E7DC] border-[#F3E7DC] text-[#7A6A5E] cursor-not-allowed shadow-none"
                          : "bg-white border-orange-500 text-orange-500 hover:bg-orange-50 cursor-pointer shadow-sm shadow-orange-500/10 active:scale-[0.98]"
                      }`}
                    >
                      <img src="/images/shopee.png" alt="Shopee" className={`w-5 h-5 object-contain ${!product.shopeeLink ? 'opacity-50 grayscale' : ''}`} />
                      <span>{!product.shopeeLink ? "Belum di Shopee" : "Beli di Shopee"}</span>
                    </button>
                  )}

                  {/* WhatsApp direct */}
                  <a
                    href={getWhatsAppLink(product.name, selectedSize)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full py-3.5 text-sm font-extrabold rounded-xl items-center justify-center gap-2 transition-all bg-[#25D366] hover:bg-[#128C7E] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#128C7E]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      className="w-5 h-5"
                    >
                      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                    </svg>
                    Tanya via WhatsApp
                  </a>
                </div>

                {/* Shipping & Delivery Info */}
                <div className="pt-4 border-t border-dashed border-[#FCE6CB] space-y-3 hidden lg:block">
                  <div className="flex items-center gap-3 rounded-2xl bg-[#FFF5F0] border border-[#FCE6CB]/70 p-3.5">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-[#FCE6CB] flex items-center justify-center">
                      <Truck className="w-5 h-5 text-[#D48C70]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#2A1F1A] text-sm">Gratis ongkir</p>
                      <p className="text-xs text-[#B08A6D] mt-0.5">Untuk pesanan di atas Rp500.000</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-[#FFF5F0] border border-[#FCE6CB]/70 p-3.5">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-[#FCE6CB] flex items-center justify-center">
                      <Package className="w-5 h-5 text-[#D48C70]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#2A1F1A] text-sm">Estimasi pengiriman</p>
                      <p className="text-xs text-[#B08A6D] mt-0.5">2-4 hari kerja (Pulau Jawa)</p>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-dashed border-[#FCE6CB] flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#4A3B32] bg-[#FFE4EC] px-2.5 py-1.5 rounded-full border border-[#FFB6C8]/40">
                    <CheckCircle className="w-3.5 h-3.5 text-[#FF8FB1]" />
                    Produk Asli
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#4A3B32] bg-[#FFE4EC] px-2.5 py-1.5 rounded-full border border-[#FFB6C8]/40">
                    <Shield className="w-3.5 h-3.5 text-[#FF8FB1]" />
                    Pembayaran Aman
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#4A3B32] bg-[#FFE4EC] px-2.5 py-1.5 rounded-full border border-[#FFB6C8]/40">
                    <RotateCcw className="w-3.5 h-3.5 text-[#FF8FB1]" />
                    Retur 7 Hari
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* 3. RELATED PRODUCTS SECTION */}
          <div className="mt-4 lg:mt-16 pt-8 lg:pt-16 border-t border-dashed border-[#E8B37D]/40 mb-0 lg:mb-8 px-4 sm:px-6 lg:px-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-0 mb-6 sm:mb-8">
            <div>
              <p className="font-magilio text-lg text-[#D48C70] leading-none mb-1">lebih banyak teman peluk</p>
              <h2 className="text-xl sm:text-2xl font-black text-[#4A3B32] font-heading">Mungkin Anda Juga Suka</h2>
            </div>
            <Link href="/products" className="text-sm font-bold text-[#FF8FB1] hover:text-[#FF8FB1]/80 flex items-center gap-1 self-start sm:self-auto cursor-pointer">
              Lihat semua <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
          
          <div className="flex md:grid overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pb-6 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
            {(() => {
              let related = allProducts.filter(p => p.id !== product.id && p.category?.toLowerCase() === product.category?.toLowerCase());
              if (related.length === 0) {
                related = allProducts.filter(p => p.id !== product.id);
              }
              
              return related.slice(0, 5).map((relatedProduct, idx) => (
                <div key={relatedProduct.id} className="w-[170px] sm:w-[220px] md:w-auto shrink-0 snap-start flex flex-col items-stretch h-full">
                  <ProductCard
                    product={relatedProduct}
                    index={idx}
                    cartItemCount={cart.filter(c => c.id === relatedProduct.id).reduce((sum, c) => sum + c.quantity, 0)}
                    onDetailClick={(p: Product) => router.push(`/product/${p.id}`)}
                  />
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM ACTION BAR */}
        <div className="fixed bottom-2 left-2 right-2 z-50 lg:hidden">
          <div className="bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-dashed border-[#E8B37D]/60 rounded-3xl p-3 shadow-[0_-10px_35px_rgba(212,140,112,0.25)] flex items-center gap-2 relative">
            <div className="flex-1 flex gap-2 relative z-10">
              {/* Add to Cart (+ Keranjang) */}
              <button
                onClick={handleAddToCart}
                disabled={isPurchaseDisabled}
                className={`flex-1 py-3 px-2 rounded-2xl text-xs font-black transition-all border flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB1] ${
                  isPurchaseDisabled 
                    ? "bg-[#F3E7DC] border-[#F3E7DC] text-[#7A6A5E] shadow-none" 
                    : "bg-[#FFF0F3] hover:bg-[#FFE4E9] border-[#FFB6C8] text-[#FF8FB1] active:scale-[0.98]"
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="whitespace-nowrap">{isPurchaseDisabled ? "Pilih Varian" : "+ Keranjang"}</span>
              </button>

              {/* Buy Now (Beli Sekarang) */}
              <button
                onClick={handleBuyNow}
                disabled={isPurchaseDisabled}
                className={`flex-1 py-3 px-2 rounded-2xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB1] ${
                  isPurchaseDisabled 
                    ? "bg-[#F3E7DC] text-[#7A6A5E] shadow-none" 
                    : "bg-[#4A3B32] hover:bg-[#2A1F1A] text-white shadow-[#4A3B32]/30 active:scale-[0.98]"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="whitespace-nowrap">{isPurchaseDisabled ? "Pilih Varian" : "Beli Sekarang"}</span>
              </button>

              {/* Shopee Button */}
              {isShopeeAvailable && (
                <button
                  onClick={() => product.shopeeLink && handleMarketplaceClick("shopee", product.shopeeLink)}
                  disabled={!product.shopeeLink}
                  className={`shrink-0 p-3 text-xs font-black rounded-2xl flex items-center justify-center gap-1 transition-all border-2 ${
                    !product.shopeeLink
                      ? "bg-[#F3E7DC] border-[#F3E7DC] text-[#7A6A5E] cursor-not-allowed shadow-none"
                      : "bg-white border-orange-500 text-orange-500 hover:bg-orange-50 cursor-pointer shadow-sm shadow-orange-500/10 active:scale-[0.98]"
                  }`}
                  title={!product.shopeeLink ? "Belum tersedia di Shopee" : "Beli di Shopee"}
                >
                  <img src="/images/shopee.png" alt="Shopee" className={`w-4 h-4 object-contain ${!product.shopeeLink ? 'opacity-50 grayscale' : ''}`} />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* NO FOOTER ON PRODUCT DETAIL */}
      {/* CART DRAWER */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        cartItems={cart}
        onRemoveItem={handleRemoveCartItem}
        onUpdateQuantity={handleUpdateCartQuantity}
        onDetailClick={handleWishlistDetailClick}
        isLoggedIn={!!user}
        onAuthRequired={() => setIsAuthModalOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthRedirectUrl(null);
        }}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          if (authRedirectUrl) {
            router.push(authRedirectUrl);
            setAuthRedirectUrl(null);
          }
        }}
      />
    </div>
  );
}
