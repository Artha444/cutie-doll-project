"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Search,
  Sparkles,
  Smile,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  MessageSquare,
  ShoppingBag,
  ShoppingCart,
  ChevronDown,
  Gift,
  HeartHandshake,
  Star,
  Check,
} from "lucide-react";
import { Product, ProductVariant, PRODUCTS } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { FeaturedProductsShowcase } from "@/components/FeaturedProductsShowcase";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { WishlistDrawer } from "@/components/WishlistDrawer";
import { CartCelebration } from "@/components/CartCelebration";
import { SiteFooter } from "@/components/SiteFooter";
import { GSAPInitializer } from "@/components/GSAPInitializer";

import { OrderTrackingModal } from "@/components/OrderTrackingModal";
import AuthModal from "@/components/AuthModal";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as LucideIcons from "lucide-react";
import TrustShowcase from "@/components/TrustShowcase";
import { Editable } from "./Editable";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const DynamicIcon = ({
  name,
  className,
}: {
  name: string;
  className?: string;
}) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Sparkles;
  return <IconComponent className={className} />;
};

interface WhyFeature {
  icon: string;
  title: string;
  desc: string;
}

interface TrustItem {
  image: string;
  title: string;
  description: string;
}

interface StoryContent {
  title: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  quote: string;
}

interface SiteSettings {
  heroTitle: string;
  heroDescription: string;
  whyTitle: string;
  whyFeatures: WhyFeature[];
  heroImage1: string;
  heroImage2: string;
  heroBadge1Icon: string;
  heroBadge1Text: string;
  heroBadge2Icon: string;
  heroBadge2Text: string;
  heroTagline: string;
  logoTextMain: string;
  logoTextSub: string;
  logoIcon: string;
  logoImageType: "icon" | "image";
  logoImageUrl: string;
  featuredTitle?: string;
  featuredSubtitle?: string;
  featuredProductIds?: string[];
  featuredCtaText?: string;
  [key: string]: unknown;
}

interface FeaturedProductsAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  productsList: Product[];
  currentIds: string[];
  onSave: (newIds: string[]) => Promise<void>;
}

function FeaturedProductsAdminModal({
  isOpen,
  onClose,
  productsList,
  currentIds,
  onSave,
}: FeaturedProductsAdminModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(currentIds);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedIds(currentIds);
  }, [currentIds, isOpen]);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectFirst4 = () => {
    setSelectedIds(productsList.slice(0, 4).map((p) => p.id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedIds);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 shrink-0" />

        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider mb-1">
              <span>Admin Mode</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-800">
              Atur Produk Unggulan
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Pilih produk yang ingin ditampilkan pada Grid Statis di beranda.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-3 bg-amber-50/60 border-b border-amber-100/50 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-amber-900">
            Terpilih:{" "}
            <span className="text-amber-600 text-sm font-black">
              {selectedIds.length}
            </span>{" "}
            produk
            <span className="text-amber-700/75 font-normal ml-1">
              (Disarankan 4 atau 8 produk agar grid statis simetris)
            </span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectFirst4}
              className="px-3 py-1 rounded-lg bg-white border border-amber-300 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors shadow-2xs"
            >
              Pilih 4 Pertama
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors shadow-2xs"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-2.5 flex-1 custom-scrollbar">
          {productsList.map((product) => {
            const isChecked = selectedIds.includes(product.id);
            return (
              <div
                key={product.id}
                onClick={() => handleToggle(product.id)}
                className={`flex items-center gap-4 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                  isChecked
                    ? "border-amber-400 bg-amber-50/40 shadow-xs"
                    : "border-slate-100 hover:border-slate-200 bg-white"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                    isChecked
                      ? "bg-amber-500 border-amber-500 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm truncate">
                    {product.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {product.category} ·{" "}
                    <span className="font-semibold text-slate-700">
                      Rp {product.price.toLocaleString("id-ID")}
                    </span>
                  </p>
                </div>

                {isChecked && (
                  <span className="text-[11px] font-extrabold text-amber-700 bg-amber-200/50 px-2.5 py-1 rounded-full shrink-0">
                    #{selectedIds.indexOf(product.id) + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-sm shadow-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? "Menyimpan..." : "Simpan Pilihan"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Home() {
  const router = useRouter();
  // State
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isFeaturedModalOpen, setIsFeaturedModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cart, setCart] = useState<import("@/data/products").CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("terbaru");
  const drawerCartIconRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [celebrateTrigger, setCelebrateTrigger] = useState(false);
  const [celebrateProductImage, setCelebrateProductImage] = useState<
    string | undefined
  >();

  // Catch misplaced Supabase Auth Magic Link redirects to root
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("code")) {
        const code = url.searchParams.get("code");
        // If we are inside a popup (Google Login), redirect to popup-callback
        if (window.opener || window.name === 'authPopup') {
          window.location.href = `/auth/callback?code=${code}&next=/auth/popup-callback`;
        } else {
          window.location.href = `/auth/callback?code=${code}`;
        }
      }
    }
  }, []);

  // Hero Background Parallax
  useEffect(() => {
    if (!bgRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        yPercent: -12, // Slightly faster upward movement on scroll
        ease: "none",
        scrollTrigger: {
          trigger: bgRef.current?.parentElement,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  // Hero Text Parallax
  useEffect(() => {
    if (!textRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(textRef.current, {
        y: -55, // Slightly faster floating text movement
        ease: "none",
        scrollTrigger: {
          trigger: textRef.current?.parentElement,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  // Parallax for the Sewing Stitch Section Divider removed as requested
  useEffect(() => {
    // Divider stays static
  }, []);

  // Stitch Line Animation for "Cara Pesan"
  useEffect(() => {
    const ctx = gsap.context(() => {
      const stitchPaths = document.querySelectorAll('.path-stitch-line');
      stitchPaths.forEach((path) => {
        const length = (path as SVGPathElement).getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(path, {
          strokeDashoffset: 0,
          scrollTrigger: {
            trigger: '#cara-pesan',
            start: 'top 60%',
            end: 'bottom 80%',
            scrub: 1,
          }
        });
      });
    });
    return () => ctx.revert();
  }, []);

  const handleCelebrate = (productImage?: string) => {
    setCelebrateProductImage(productImage);
    setCelebrateTrigger(false);
    requestAnimationFrame(() => setCelebrateTrigger(true));
  };

  // Site Settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    heroTitle:
      "Boneka Flanel Jahit Tangan Premium — Kado Lembut yang Selalu Dicinta",
    heroDescription:
      "Setiap boneka flanel Simoengil dijahit tangan satu per satu menggunakan dacron Grade A dan bulu yelvo hypoallergenic. Presisi, kuat, serta aman untuk balita maupun kado istimewa bagi orang tersayang.",
    whyTitle: "Kenapa Memilih Boneka Simoengil?",
    whyFeatures: [
      {
        icon: "ShieldCheck",
        title: "100% Dacron Grade A",
        desc: "Isian silikon dacron super murni tanpa campuran limbah garmen. Memastikan keempukan tahan bertahun-tahun dan tidak gampang kempes.",
      },
      {
        icon: "Sparkles",
        title: "Ukuran Mungil 10–20cm",
        desc: "Dirancang dalam ukuran 10cm sampai 20cm yang sangat cocok dijadikan kado spesial, gantungan kunci tas, atau pajangan estetik di kamar.",
      },
      {
        icon: "Smile",
        title: "Kain Flanel & Dacron",
        desc: "Dikerjakan dari kain flanel pilihan yang rapi dan berkarakter, diisi dengan dacron grade A anti-kempes yang tahan lama.",
      },
    ],
    heroImage1: "/images/plushie_teddy.png",
    heroImage2: "/images/plushie_bunny.png",
    heroBadge1Icon: "🪡",
    heroBadge1Text: "100% Handmade",
    heroBadge2Icon: "✨",
    heroBadge2Text: "Dacron Grade A",
    heroTagline: "100% Jahit Tangan • Grade A Dacron • Ukuran Mungil 10–20cm",
    logoTextMain: "Simoengil",
    logoTextSub: "Plushie & Doll",
    logoIcon: "Smile",
    logoImageType: "icon",
    logoImageUrl: "",
    featuredTitle: "Produk Unggulan Pilihan Kami",
    featuredSubtitle:
      "Koleksi boneka terfavorit yang paling sering dipesan dan dicintai pelanggan. Langsung terlihat sekaligus tanpa perlu digeser!",
    featuredProductIds: ["1", "2", "3", "4"],
    featuredCtaText: "Lihat Semua Koleksi →",
    trustItems: [
      {
        image: "/images/3-Hand.jpeg",
        title: "100% Jahitan Tangan",
        description:
          "Setiap boneka kami dijahit dengan tangan, satu per satu, penuh ketelitian. Nggak ada mesin massal—cuma keterampilan dan kesabaran, supaya tiap jahitan kuat dan nggak gampang lepas.",
      },
      {
        image: "/images/4-Ruler.jpeg",
        title: "Detail Rapih & Kuat",
        description:
          "Ukuran boneka flanel kami memang mungil, tapi detailnya nggak sembarangan. Setiap pola diukur presisi supaya proporsinya pas dan jahitannya tetap kuat meski sering dipeluk.",
      },
      {
        image: "/images/1-Cardboard.jpeg",
        title: "Packing Aman",
        description:
          "Boneka diisi dakron premium yang empuk dan padat, lalu dikemas rapat dengan kardus tebal supaya aman sampai tujuan tanpa penyok, kotor, atau rusak di jalan.",
      },
      {
        image: "/images/2-Truck.jpeg",
        title: "Pengiriman Cepat",
        description:
          "Begitu pesanan selesai dijahit, langsung kami kirim secepat mungkin—supaya boneka baru kamu nggak lama-lama menunggu di perjalanan.",
      },
    ],
    story: {
      title: "Boneka Flanel yang Dibuat dengan Kasih Sayang",
      paragraph1:
        "Halo, saya ibu dari Simoengil. Boneka-boneka ini saya buat dengan tangan sendiri menggunakan kain flanel premium yang super lembut. Setiap boneka dijahit pelan-pelan agar rapi dan kuat.",
      paragraph2:
        "Saya paham betul seorang ibu ingin yang terbaik. Makanya saya hanya pakai bahan flanel berkualitas tinggi. Boneka ini tersedia dalam ukuran 10cm dan 15cm (imut & mungil, tidak untuk dipeluk), hingga ukuran 20cm yang nyaman dipeluk.",
      paragraph3:
        "Sangat cocok untuk kado ulang tahun, gantungan kunci, kado wisuda, atau sekadar teman bermain anak. Banyak pelanggan yang sudah membeli dan senang dengan hasilnya.",
      quote:
        "Setiap boneka dibuat pelan-pelan supaya bisa menemani anak dengan nyaman dan penuh kehangatan.",
    },
  });

  // Load wishlist from localStorage on mount & Fetch Supabase products & Check Admin Auth
  useEffect(() => {
    const savedCart = localStorage.getItem("simoengil_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to load cart", e);
      }
    }

    const fetchProducts = async () => {
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
              shopeeAvailable:
                specs.shopeeAvailable !== undefined
                  ? specs.shopeeAvailable
                  : true,
              specifications: {
                material: specs.material || "100% Premium Dacron & Kain Rasfur",
                size: specs.size || "Standard",
                washing:
                  specs.washing || "Bisa dicuci dengan tangan atau mesin cuci",
                safeForKids:
                  specs.safeForKids !== undefined ? specs.safeForKids : true,
                shopeePrice: specs.shopeePrice || undefined,
                shopeeAvailable:
                  specs.shopeeAvailable !== undefined
                    ? specs.shopeeAvailable
                    : true,
                features: specs.features || [],
                images: specs.images || [],
                soldCount: specs.soldCount || 0,
                testimonials: specs.testimonials || [],
                types: specs.types || [],
                sizes: specs.sizes || [],
              },
              variants: (item.variants || []).map(
                (v: Partial<ProductVariant>) => ({
                  ...v,
                  shopeeAvailable:
                    v.shopeeAvailable !== undefined ? v.shopeeAvailable : true,
                }),
              ),
            };
          });
          setProductsList(mappedData);
        } else {
          const localMockStr = localStorage.getItem("simoengil_mock_products");
          if (localMockStr) {
            setProductsList(JSON.parse(localMockStr));
          }
        }
      } catch (err) {
        console.warn(
          "Supabase fetch failed, falling back to local products list:",
          err,
        );
        const localMockStr = localStorage.getItem("simoengil_mock_products");
        if (localMockStr) {
          setProductsList(JSON.parse(localMockStr));
        }
      }
    };

    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          // Only redirect to admin panel if the role is admin
          if (session.user?.user_metadata?.role === "admin") {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.warn("Auth check skipped");
      }
    };
    checkAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUser(session.user);
          if (session.user?.user_metadata?.role === "admin") {
            setIsAdmin(true);
          }
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      },
    );

    const sanitizeHeroSettings = (
      loaded: Partial<SiteSettings>,
    ): Partial<SiteSettings> => {
      const copy = { ...loaded };
      if (
        !copy.heroTitle ||
        copy.heroTitle.includes("Selamat Datang") ||
        copy.heroTitle === "Temukan Boneka Kesukaanmu!"
      ) {
        copy.heroTitle =
          "Boneka Flanel Jahit Tangan Premium — Kado Lembut yang Selalu Dicinta";
      }
      if (
        !copy.heroDescription ||
        copy.heroDescription.trim().startsWith('"') ||
        copy.heroDescription.includes("Simoengil adalah platform e-commerce") ||
        copy.heroDescription.includes("balita") ||
        copy.heroDescription.includes("yelvo") ||
        copy.heroDescription.includes("dicuci")
      ) {
        copy.heroDescription =
          "Setiap boneka flanel Simoengil berukuran mungil (10–20cm), dijahit tangan satu per satu menggunakan kain flanel pilihan dan dacron Grade A anti-kempes. Sangat cocok sebagai kado istimewa, gantungan kunci, maupun pajangan estetik.";
      }
      if (
        !copy.heroTagline ||
        copy.heroTagline.includes("Balita") ||
        copy.heroTagline.includes("balita") ||
        copy.heroTagline.includes("Dicuci") ||
        copy.heroTagline.includes("Bayi")
      ) {
        copy.heroTagline = "100% Jahit Tangan • Grade A Dacron • Ukuran Mungil 10–20cm";
      }
      if (copy.heroBadge1Text === "Terlembut" || copy.heroBadge1Text === "Aman untuk Bayi") {
        copy.heroBadge1Text = "100% Handmade";
        copy.heroBadge1Icon = "🪡";
      }
      if (copy.heroBadge2Text === "Anti Alergi" || copy.heroBadge2Text === "Bisa Dicuci") {
        copy.heroBadge2Text = "Dacron Grade A";
        copy.heroBadge2Icon = "✨";
      }
      if (copy.whyFeatures && Array.isArray(copy.whyFeatures)) {
        copy.whyFeatures = copy.whyFeatures.map((feat) => {
          if (
            feat.title?.includes("Dicuci") ||
            feat.title?.includes("Washable") ||
            feat.desc?.includes("dicuci")
          ) {
            return {
              icon: "Sparkles",
              title: "Ukuran Mungil 10–20cm",
              desc: "Dirancang dalam ukuran 10cm sampai 20cm yang sangat cocok dijadikan kado spesial, gantungan kunci tas, atau pajangan estetik di kamar.",
            };
          }
          if (
            feat.title?.includes("Bayi") ||
            feat.title?.includes("Balita") ||
            feat.desc?.includes("balita") ||
            feat.desc?.includes("yelvo")
          ) {
            return {
              icon: "Smile",
              title: "Kain Flanel & Dacron",
              desc: "Dikerjakan dari kain flanel pilihan yang rapi dan berkarakter, diisi dengan dacron grade A anti-kempes yang tahan lama.",
            };
          }
          return feat;
        });
      }
      return copy;
    };

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("*")
          .eq("id", "homepage")
          .single();
          
        if (!error && data && data.settings) {
          const cleanSettings = sanitizeHeroSettings(data.settings);
          setSiteSettings((prev) => ({
            ...prev,
            ...cleanSettings,
          }));
          // Update the stale local cache with fresh data from DB
          localStorage.setItem("simoengil_settings", JSON.stringify(cleanSettings));
          return; // Exit early since we got fresh data
        }
      } catch (err) {
        console.log("Supabase fetch error, falling back to local cache.");
      }

      // Fallback: only runs if DB fetch failed or returned nothing
      const local = localStorage.getItem("simoengil_settings");
      if (local) {
        try {
          const settings = sanitizeHeroSettings(JSON.parse(local));
          setSiteSettings((prev) => ({
            ...prev,
            ...settings,
          }));
        } catch (e) {
          console.warn("Failed to parse local settings", e);
        }
      }
    };

    fetchProducts();
    fetchSettings();

    // Check URL parameters for auth redirect
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("auth") === "true") {
        setIsAuthModalOpen(true);
        const url = new URL(window.location.href);
        url.searchParams.delete("auth");
        url.searchParams.delete("required");
        window.history.replaceState({}, "", url.toString());
      }
    }

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Logic handled in the authListener above
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync cart to localStorage
  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    let updatedCart = cart.map((item) => {
      if (item.cartItemId === cartItemId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    setCart(updatedCart);
    localStorage.setItem("simoengil_cart", JSON.stringify(updatedCart));
  };

  const handleAddToCart = (
    product: Product,
    variantSize?: string,
    variantType?: string,
  ) => {
    const cartItemId = `${product.id}-${variantSize || "default"}-${variantType || "default"}`;
    const existingItem = cart.find((item) => item.cartItemId === cartItemId);

    let updatedCart;
    if (existingItem) {
      updatedCart = cart.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
    } else {
      let price = product.price;
      const sizes = product.specifications?.sizes || [];
      const types = product.specifications?.types || [];

      const sizeObj = sizes.find((s) => s.name === variantSize);
      const typeObj = types.find((t) => t.name === variantType);

      if (sizeObj && sizeObj.extraPrice) price += sizeObj.extraPrice;
      if (typeObj && typeObj.extraPrice) price += typeObj.extraPrice;

      updatedCart = [
        ...cart,
        {
          ...product,
          cartItemId,
          selectedVariantSize: variantSize,
          selectedVariantType: variantType,
          quantity: 1,
          selectedPrice: price,
        },
      ];
    }

    setCart(updatedCart);
    localStorage.setItem("simoengil_cart", JSON.stringify(updatedCart));
    setIsWishlistOpen(true);
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    const updatedCart = cart.filter((item) => item.cartItemId !== cartItemId);
    setCart(updatedCart);
    localStorage.setItem("simoengil_cart", JSON.stringify(updatedCart));
  };

  const handleSettingsSave = async (key: string, value: any): Promise<void> => {
    // Optimistic UI update
    const newSettings = { ...siteSettings, [key]: value };
    setSiteSettings(newSettings);

    // Persist to localStorage as cache
    localStorage.setItem("simoengil_settings", JSON.stringify(newSettings));

    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ id: "homepage", settings: newSettings });

      if (error) throw error;
    } catch (err: any) {
      console.error("Failed to save settings:", err);
      alert("Gagal menyimpan ke server Supabase: " + (err.message || err.toString()));
      // Silently fail — localStorage cache still works for the session
    }
  };

  // Filter products using dynamic productsList
  const filteredProducts = productsList
    .filter((product) => {
      const matchesCategory =
        selectedCategory === "Semua" || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "termurah") return a.price - b.price;
      if (sortBy === "termahal") return b.price - a.price;
      return 0; // 'terbaru' uses default order
    });

  // Open product detail
  const handleProductDetailClick = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  // Toggle FAQ accordion
  const toggleFaq = (index: number) => {
    setFaqOpenIndex(faqOpenIndex === index ? null : index);
  };

  const handleHeroCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const catalogSection = document.getElementById("katalog");
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Categories list
  const categories = [
    "Semua",
    ...Array.from(new Set(productsList.map((p) => p.category).filter(Boolean))),
  ];

  // FAQs
  const faqs = [
    {
      q: "Apakah boneka flanel Simoengil dikhususkan untuk balita atau bisa dicuci?",
      a: "Boneka flanel kami berukuran mungil (10-20cm) yang dirancang khusus sebagai kado spesial, gantungan kunci tas, dan pajangan estetik — bukan target atau dikhususkan untuk balita. Selain itu, bahan kain flanel tidak disarankan untuk dicuci basah agar bentuk dan teksturnya tetap awet (cukup bersihkan debu secara kering/dry wipe).",
    },

    {
      q: "Apakah bisa pesan boneka untuk kado wisuda dengan custom nama?",
      a: "Tidak bisa, untuk pesanan custom tidak dilakukan di website, jika ingin dilakukan custom silahkan lakukan pembelian di Shopee",
    },
    {
      q: "Berapa lama proses packing dan pengiriman?",
      a: "Kami packing dan kirim setiap hari. Pesanan yang masuk sebelum jam 15.00 WIB biasanya dikirim di hari yang sama. Untuk Jabodetabek tersedia pengiriman sameday/instan melalui Shopee.",
    },
    {
      q: "Apakah ada garansi jika boneka rusak atau cacat?",
      a: "Ada garansi kualitas. Jika dalam 7 hari setelah terima ada cacat produksi (jahitan lepas, bahan robek, dll), silakan hubungi kami via WhatsApp untuk proses penggantian atau pengembalian.",
    },
  ];

  // Safe derived story — guards against undefined if Supabase/localStorage
  // merge doesn't include the story field.
  const story: StoryContent = (siteSettings.story as StoryContent) ?? {
    title: "Boneka Flanel yang Dibuat dengan Kasih Sayang",
    paragraph1:
      "Halo, selamat datang di Simoengil. Boneka-boneka ini saya buat dengan tangan sendiri menggunakan kain flanel dan dacron grade A pilihan. Setiap boneka dijahit perlahan agar rapi, berkarakter, dan presisi.",
    paragraph2:
      "Saya paham betul sebuah karya kerajinan tangan harus memiliki ketelitian tinggi. Boneka flanel ini tersedia dalam ukuran mungil 10cm hingga 20cm — imut, detail, dan sangat pas untuk dijadikan koleksi maupun hadiah.",
    paragraph3:
      "Sangat cocok untuk kado ulang tahun, gantungan kunci tas, kado wisuda, atau pajangan estetik di kamar. Banyak pelanggan yang sudah membeli dan senang dengan kerapihan karyanya.",
    quote:
      "Setiap boneka flanel dikerjakan satu per satu dengan tangan, menghasilkan karya mungil yang rapi, unik, dan penuh makna.",
  };

  // Derive Featured Products for Static Grid
  const featuredProductIds = (siteSettings.featuredProductIds as string[]) || [
    "1",
    "2",
    "3",
    "4",
  ];
  const displayFeaturedProducts = featuredProductIds
    .map((id) => productsList.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
  const finalFeaturedProducts =
    displayFeaturedProducts.length > 0
      ? displayFeaturedProducts
      : productsList.slice(0, 4);

  return (
    <div className="relative min-h-screen flex flex-col selection:bg-orange-100 selection:text-orange-600 bg-transparent font-sans text-slate-800">
      <GSAPInitializer />

      {/* HEADER / NAVBAR */}

      <main className="flex-1 w-full overflow-x-hidden">
        {/* HERO SECTION */}
        <section className="relative z-0 w-full min-h-[100svh] pt-20 sm:pt-28 pb-16 flex flex-col justify-start lg:justify-center">
          {/* Zoomed Out Background with Parallax Ref */}
          <div
            ref={bgRef}
            className="absolute inset-0 w-full h-[120%] md:h-[130%] top-0 bg-cover bg-[32%_30%] md:bg-center bg-no-repeat z-0 pointer-events-none"
            style={{ backgroundImage: "url('/images/-boneka_interior.webp')" }}
          />
          {/* Sunlight Beams from Window */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
            <svg
              viewBox="0 0 1920 1080"
              className="w-full h-full opacity-[0.35]"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="sun-beam-grad-1"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#FFF8D6" stopOpacity="0.85" />
                  <stop offset="45%" stopColor="#FFEAA7" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FFEAA7" stopOpacity="0" />
                </linearGradient>
                <filter id="blur-beam-std">
                  <feGaussianBlur stdDeviation="35" />
                </filter>
              </defs>
              {/* Main wide diagonal light beam directed towards the doll/nightstand area (left-center) */}
              <polygon
                points="0,80 320,0 1100,1080 0,1080"
                fill="url(#sun-beam-grad-1)"
                filter="url(#blur-beam-std)"
              />
              {/* Secondary sharper beam for realistic overlap */}
              <polygon
                points="80,0 260,0 950,1080 300,1080"
                fill="url(#sun-beam-grad-1)"
                filter="url(#blur-beam-std)"
                opacity="0.65"
              />
            </svg>
          </div>

          {/* Floating Dust Particles in the Sunbeam */}
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden select-none">
            <div className="absolute left-[8%] top-[45%] w-1.5 h-1.5 bg-white/70 rounded-full blur-[0.4px] animate-dust-1" />
            <div
              className="absolute left-[14%] top-[55%] w-1 h-1 bg-white/80 rounded-full animate-dust-2"
              style={{ animationDelay: "1.5s" }}
            />
            <div
              className="absolute left-[6%] top-[65%] w-2 h-2 bg-yellow-100/60 rounded-full blur-[0.7px] animate-dust-3"
              style={{ animationDelay: "3.0s" }}
            />
            <div
              className="absolute left-[18%] top-[50%] w-1 h-1 bg-white/85 rounded-full animate-dust-1"
              style={{ animationDelay: "4.5s" }}
            />
            <div
              className="absolute left-[24%] top-[58%] w-1.5 h-1.5 bg-yellow-50/50 rounded-full blur-[0.4px] animate-dust-2"
              style={{ animationDelay: "0.5s" }}
            />
            <div
              className="absolute left-[10%] top-[35%] w-1 h-1 bg-white/90 rounded-full animate-dust-3"
              style={{ animationDelay: "2.0s" }}
            />
            <div
              className="absolute left-[16%] top-[40%] w-1.5 h-1.5 bg-white/60 rounded-full blur-[0.3px] animate-dust-1"
              style={{ animationDelay: "5.2s" }}
            />
            <div
              className="absolute left-[20%] top-[30%] w-2 h-2 bg-yellow-100/50 rounded-full blur-[0.8px] animate-dust-2"
              style={{ animationDelay: "3.7s" }}
            />
            <div
              className="absolute left-[28%] top-[48%] w-1 h-1 bg-white/75 rounded-full animate-dust-3"
              style={{ animationDelay: "6.0s" }}
            />
            <div
              className="absolute left-[26%] top-[56%] w-1.5 h-1.5 bg-yellow-50/50 rounded-full blur-[0.4px] animate-dust-1"
              style={{ animationDelay: "2.5s" }}
            />
            <div
              className="absolute left-[33%] top-[52%] w-1 h-1 bg-white/80 rounded-full animate-dust-2"
              style={{ animationDelay: "7.1s" }}
            />
            <div
              className="absolute left-[4%] top-[72%] w-1.5 h-1.5 bg-white/50 rounded-full blur-[0.4px] animate-dust-3"
              style={{ animationDelay: "1.2s" }}
            />
          </div>

          {/* Animated Butterflies */}
          {/* Butterfly 1 (Near Window/Left) */}
          <div
            className="absolute left-[20%] top-[40%] w-12 h-12 z-10 animate-fly-1 pointer-events-none"
            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              {/* Left Wing */}
              <g
                className="animate-wing-left"
                style={{
                  transformOrigin: "50px 50px",
                  transformStyle: "preserve-3d",
                }}
              >
                <path
                  d="M50,48 C20,15 5,30 15,55 C22,70 45,60 50,52"
                  fill="#FF8FB1"
                />
                <path
                  d="M50,52 C35,62 30,78 42,82 C48,82 48,70 50,65"
                  fill="#FFE4EC"
                />
              </g>
              {/* Right Wing */}
              <g
                className="animate-wing-right"
                style={{
                  transformOrigin: "50px 50px",
                  transformStyle: "preserve-3d",
                }}
              >
                <path
                  d="M50,48 C80,15 95,30 85,55 C78,70 55,60 50,52"
                  fill="#FF8FB1"
                />
                <path
                  d="M50,52 C65,62 70,78 58,82 C52,82 52,70 50,65"
                  fill="#FFE4EC"
                />
              </g>
              {/* Body */}
              <ellipse cx="50" cy="53" rx="3" ry="18" fill="#4A3B32" />
              <circle cx="50" cy="33" r="4" fill="#4A3B32" />
              <path
                d="M49,30 Q43,18 36,22 M51,30 Q57,18 64,22"
                stroke="#4A3B32"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Butterfly 2 (Near Bed/Right) */}
          <div
            className="absolute right-[25%] top-[25%] w-10 h-10 z-10 animate-fly-2 pointer-events-none"
            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              {/* Left Wing */}
              <g
                className="animate-wing-left"
                style={{
                  transformOrigin: "50px 50px",
                  transformStyle: "preserve-3d",
                }}
              >
                <path
                  d="M50,48 C20,15 5,30 15,55 C22,70 45,60 50,52"
                  fill="#F8BBD0"
                />
                <path
                  d="M50,52 C35,62 30,78 42,82 C48,82 48,70 50,65"
                  fill="#FFE4EC"
                />
              </g>
              {/* Right Wing */}
              <g
                className="animate-wing-right"
                style={{
                  transformOrigin: "50px 50px",
                  transformStyle: "preserve-3d",
                }}
              >
                <path
                  d="M50,48 C80,15 95,30 85,55 C78,70 55,60 50,52"
                  fill="#F8BBD0"
                />
                <path
                  d="M50,52 C65,62 70,78 58,82 C52,82 52,70 50,65"
                  fill="#FFE4EC"
                />
              </g>
              {/* Body */}
              <ellipse cx="50" cy="53" rx="2.5" ry="16" fill="#4A3B32" />
              <circle cx="50" cy="35" r="3.5" fill="#4A3B32" />
              <path
                d="M49,32 Q43,20 36,24 M51,32 Q57,20 64,24"
                stroke="#4A3B32"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Butterfly 3 (Soft Cyan - Middle Upper) */}
          <div
            className="absolute left-[45%] top-[15%] w-9 h-9 z-10 animate-fly-3 pointer-events-none"
            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              {/* Left Wing */}
              <g
                className="animate-wing-left"
                style={{
                  transformOrigin: "50px 50px",
                  transformStyle: "preserve-3d",
                }}
              >
                <path
                  d="M50,48 C20,15 5,30 15,55 C22,70 45,60 50,52"
                  fill="#80DEEA"
                />
                <path
                  d="M50,52 C35,62 30,78 42,82 C48,82 48,70 50,65"
                  fill="#E0F7FA"
                />
              </g>
              {/* Right Wing */}
              <g
                className="animate-wing-right"
                style={{
                  transformOrigin: "50px 50px",
                  transformStyle: "preserve-3d",
                }}
              >
                <path
                  d="M50,48 C80,15 95,30 85,55 C78,70 55,60 50,52"
                  fill="#80DEEA"
                />
                <path
                  d="M50,52 C65,62 70,78 58,82 C52,82 52,70 50,65"
                  fill="#E0F7FA"
                />
              </g>
              {/* Body */}
              <ellipse cx="50" cy="53" rx="2.2" ry="15" fill="#4A3B32" />
              <circle cx="50" cy="36" r="3.2" fill="#4A3B32" />
              <path
                d="M49,33 Q43,21 36,25 M51,33 Q57,21 64,25"
                stroke="#4A3B32"
                strokeWidth="1.0"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Butterfly 4 (Soft Gold - Center Right) */}
          <div
            className="absolute right-[45%] top-[40%] w-11 h-11 z-10 animate-fly-4 pointer-events-none"
            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              {/* Left Wing */}
              <g
                className="animate-wing-left"
                style={{
                  transformOrigin: "50px 50px",
                  transformStyle: "preserve-3d",
                }}
              >
                <path
                  d="M50,48 C20,15 5,30 15,55 C22,70 45,60 50,52"
                  fill="#FFE082"
                />
                <path
                  d="M50,52 C35,62 30,78 42,82 C48,82 48,70 50,65"
                  fill="#FFF9C4"
                />
              </g>
              {/* Right Wing */}
              <g
                className="animate-wing-right"
                style={{
                  transformOrigin: "50px 50px",
                  transformStyle: "preserve-3d",
                }}
              >
                <path
                  d="M50,48 C80,15 95,30 85,55 C78,70 55,60 50,52"
                  fill="#FFE082"
                />
                <path
                  d="M50,52 C65,62 70,78 58,82 C52,82 52,70 50,65"
                  fill="#FFF9C4"
                />
              </g>
              {/* Body */}
              <ellipse cx="50" cy="53" rx="2.8" ry="17" fill="#4A3B32" />
              <circle cx="50" cy="34" r="3.8" fill="#4A3B32" />
              <path
                d="M49,31 Q43,19 36,23 M51,31 Q57,19 64,23"
                stroke="#4A3B32"
                strokeWidth="1.3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Butterfly 5 (Soft Lavender - Left Upper) */}
          <div
            className="absolute left-[30%] top-[20%] w-8 h-8 z-10 animate-fly-5 pointer-events-none"
            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              {/* Left Wing */}
              <g
                className="animate-wing-left"
                style={{
                  transformOrigin: "50px 50px",
                  transformStyle: "preserve-3d",
                }}
              >
                <path
                  d="M50,48 C20,15 5,30 15,55 C22,70 45,60 50,52"
                  fill="#CE93D8"
                />
                <path
                  d="M50,52 C35,62 30,78 42,82 C48,82 48,70 50,65"
                  fill="#F3E5F5"
                />
              </g>
              {/* Right Wing */}
              <g
                className="animate-wing-right"
                style={{
                  transformOrigin: "50px 50px",
                  transformStyle: "preserve-3d",
                }}
              >
                <path
                  d="M50,48 C80,15 95,30 85,55 C78,70 55,60 50,52"
                  fill="#CE93D8"
                />
                <path
                  d="M50,52 C65,62 70,78 58,82 C52,82 52,70 50,65"
                  fill="#F3E5F5"
                />
              </g>
              {/* Body */}
              <ellipse cx="50" cy="53" rx="2.0" ry="14" fill="#4A3B32" />
              <circle cx="50" cy="37" r="3.0" fill="#4A3B32" />
              <path
                d="M49,34 Q43,22 36,26 M51,34 Q57,22 64,26"
                stroke="#4A3B32"
                strokeWidth="0.9"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between w-full z-20 mt-auto md:mt-0 pt-16 md:pt-0 pb-8 md:pb-0">
            {/* Left Column: Interactive Product Annotation Badge (connecting with Left Illustration) removed */}

            {/* Right Column: Editorial Hero Copy (Unboxed, seamlessly integrated) */}
            <div
              ref={textRef}
              className="w-full lg:w-[58%] text-center lg:text-left space-y-5 lg:space-y-6 relative z-10 flex flex-col items-center lg:items-start ml-auto p-2 sm:p-4 mt-[42vh] sm:mt-[35vh] lg:mt-0"
            >
              {/* Subtle ambient glow behind text to ensure crisp readability without a harsh card box */}
              <div
                className="absolute -inset-x-8 -inset-y-6 bg-gradient-to-b lg:bg-gradient-to-r from-transparent via-[#FFFDF9]/90 to-[#FFFDF9] lg:from-transparent lg:via-[#FFFDF9]/85 lg:to-[#FFFDF9]/95 blur-2xl -z-10 rounded-[3rem] pointer-events-none"
                aria-hidden="true"
              />

              {/* Pre-headline Badge (Hexagon Style) */}
              <div 
                className="inline-flex items-center justify-center px-7 py-2 bg-[#FDF1D6] text-[#F15A24] text-xs sm:text-sm font-black uppercase tracking-wider drop-shadow-sm mb-2"
                style={{ clipPath: "polygon(15px 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 15px 100%, 0% 50%)" }}
              >
                <span>Boneka Flanel Premium Jahit Tangan</span>
              </div>

              {/* Editable Headline (H1) — Strong value proposition & differentiator */}
              <Editable
                isAdmin={isAdmin}
                itemKey="heroTitle"
                initialValue={siteSettings.heroTitle}
                onSave={handleSettingsSave}
                as="h1"
                className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] tracking-tight leading-[1.12] gsap-hero-title drop-shadow-2xs"
              >
                {(value) => (
                  <span dangerouslySetInnerHTML={{ __html: value }} />
                )}
              </Editable>

              {/* Editable Description Paragraph (Clean, informative, no quotation marks or avatar) */}
              <Editable
                isAdmin={isAdmin}
                itemKey="heroDescription"
                initialValue={siteSettings.heroDescription}
                onSave={handleSettingsSave}
                as="p"
                className="hidden sm:block text-sm sm:text-base md:text-lg text-[#4A3B32] font-medium leading-relaxed max-w-xl gsap-hero-desc"
              />

              {/* Trust Pills — Authentic e-commerce social proof & differentiators */}
              <div className="hidden sm:flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-1 pb-1 text-xs sm:text-sm font-bold text-[#5A4F49]">
                <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-[#D48C70]/25 shadow-2xs">
                  <span className="text-amber-500">★ 4.9/5</span>
                  <span>500+ Pelanggan Puas</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-[#D48C70]/25 shadow-2xs">
                  <span>✓ 100% Jahit Tangan</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-[#D48C70]/25 shadow-2xs">
                  <span>✓ Ukuran Mungil 10–20cm</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 md:gap-4 pt-3 w-full gsap-hero-ctas">
                <div className="relative group inline-block w-full sm:w-auto">
                  {/* Floating Taekwondo Doll Hiding Behind */}
                  <div className="absolute -left-2 -top-6 w-16 h-16 sm:w-20 sm:h-20 z-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-10 group-hover:-translate-x-6 group-hover:-rotate-12 origin-bottom">
                    <div className="relative w-full h-full animate-peek group-hover:animate-none">
                      <img
                        src="/images/boneka3.png"
                        alt="Boneka Taekwondo"
                        onError={(e) => {
                          e.currentTarget.src = "/images/boneka3.png";
                        }}
                        className="w-full h-full object-contain drop-shadow-md brightness-95 sepia-[0.2]"
                      />
                      {/* Exclamation Mark */}
                      <div className="absolute top-0 right-2 sm:right-3 text-3xl sm:text-4xl font-black text-[#D48C70] drop-shadow-[0_2px_4px_rgba(212,140,112,0.5)] opacity-0 scale-50 transition-all duration-300 animate-peek-alert group-hover:animate-none group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-12 z-20">
                        !
                      </div>
                    </div>
                  </div>

                  <a
                    href="#katalog"
                    onClick={handleHeroCtaClick}
                    className="relative z-10 w-full sm:w-auto px-7 py-4.5 bg-[#D48C70] hover:bg-[#C27D62] text-white font-extrabold rounded-xl text-center shadow-lg shadow-[#D48C70]/30 hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 cursor-pointer btn-premium-hover"
                  >
                    <span>Pilih Boneka Favoritmu</span>
                    <span className="bg-white text-[#D48C70] w-6 h-6 rounded-md flex items-center justify-center font-black text-sm shrink-0">
                      &gt;
                    </span>
                  </a>
                </div>

                <a
                  href="#tentang"
                  className="w-full sm:w-auto px-7 py-4 bg-white/90 hover:bg-white text-[#D48C70] border border-[#D48C70]/30 font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center cursor-pointer hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                  Tentang Simoengil
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            CLOUD DIVIDER — Hero → Featured Products
        ========================================================================= */}
        <div
          className="relative z-20 w-full overflow-hidden flex justify-center pointer-events-none select-none drop-shadow-sm -mb-1"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full min-w-[1000px] block"
            style={{ height: "clamp(60px, 8vw, 100px)" }}
          >
            {/* Shadow / Secondary Cloud Layer */}
            <path
              d="
                M0,100 L0,50
                Q60,10 120,35
                Q150,47 180,30
                Q220,7 270,27
                Q300,40 330,23
                Q375,-3 420,20
                Q455,37 490,17
                Q535,-7 580,15
                Q615,31 650,13
                Q690,-7 730,10
                Q770,27 810,7
                Q850,-13 895,7
                Q930,23 965,5
                Q1005,-15 1050,7
                Q1085,23 1120,5
                Q1165,-17 1210,5
                Q1250,23 1290,7
                Q1340,-15 1380,10
                Q1415,27 1440,15
                L1440,100 Z
              "
              fill="#d0926e"
              opacity="0.3"
              transform="translate(-15, -12) scale(1.02)"
            />
            {/* Main Cloud Layer */}
            <path
              d="
                M0,100 L0,50
                Q60,10 120,35
                Q150,47 180,30
                Q220,7 270,27
                Q300,40 330,23
                Q375,-3 420,20
                Q455,37 490,17
                Q535,-7 580,15
                Q615,31 650,13
                Q690,-7 730,10
                Q770,27 810,7
                Q850,-13 895,7
                Q930,23 965,5
                Q1005,-15 1050,7
                Q1085,23 1120,5
                Q1165,-17 1210,5
                Q1250,23 1290,7
                Q1340,-15 1380,10
                Q1415,27 1440,15
                L1440,100 Z
              "
              fill="#e7c79f"
            />
            {/* Stitched Line Border (Jahitan) */}
            <path
              d="
                M0,50
                Q60,10 120,35
                Q150,47 180,30
                Q220,7 270,27
                Q300,40 330,23
                Q375,-3 420,20
                Q455,37 490,17
                Q535,-7 580,15
                Q615,31 650,13
                Q690,-7 730,10
                Q770,27 810,7
                Q850,-13 895,7
                Q930,23 965,5
                Q1005,-15 1050,7
                Q1085,23 1120,5
                Q1165,-17 1210,5
                Q1250,23 1290,7
                Q1340,-15 1380,10
                Q1415,27 1440,15
              "
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeDasharray="12 8"
              strokeLinecap="round"
              opacity="0.8"
            />
          </svg>
        </div>

        {/* =========================================================================
            PRODUK UNGGULAN SHOWCASE (Interactive Fanned Polaroid Deck & Info Box)
            Sesuai desain screenshot: Polaroid bertumpuk & info box navigasi circular
        ========================================================================= */}
        <FeaturedProductsShowcase
          products={finalFeaturedProducts}
          isAdmin={isAdmin}
          siteSettings={siteSettings}
          onSaveSettings={handleSettingsSave}
          onOpenAdminModal={() => setIsFeaturedModalOpen(true)}
          onProductDetailClick={handleProductDetailClick}
        />

        {/* BRAND PROMISE SECTION (Text & Peach Background) */}
        <section className="relative z-10 w-full pt-24 md:pt-32 pb-4 px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="absolute top-0 h-[60px] md:h-[80px] left-0 right-0 bg-[#e7c79f] -z-20" />
          <div className="absolute top-[54px] md:top-[74px] bottom-0 left-0 right-0 bg-[#FCE6CB] -z-10" />
          {/* Creative Stitch & Felt Wave Divider (Made taller to allow downward parallax without revealing straight lines) */}
          <div
            ref={dividerRef}
            className="absolute top-0 left-0 right-0 w-full z-20 pointer-events-none"
          >
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="w-full h-[55px] md:h-[75px] block"
            >
              {/* Smooth Curve Felt Fabric Layer */}
              <path
                d="M0,20 Q600,110 1200,20 L1200,120 L0,120 Z"
                fill="#FCE6CB"
              />
              {/* White Sewing Stitch Line (Embroidery Thread) */}
              <path
                d="M0,12 Q600,102 1200,12"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="4"
                strokeDasharray="14 10"
                strokeLinecap="round"
                opacity="0.9"
              />
            </svg>
          </div>
          <Editable
            isAdmin={isAdmin}
            itemKey="whyTitle"
            initialValue={siteSettings.whyTitle}
            onSave={handleSettingsSave}
            as="h2"
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#2A2320] leading-tight max-w-4xl mx-auto mb-6 tracking-tight drop-shadow-sm"
          />
          <Editable
            isAdmin={isAdmin}
            itemKey="heroDescription"
            initialValue={siteSettings.heroDescription}
            onSave={handleSettingsSave}
            as="p"
            className="font-sans text-sm md:text-base text-[#5A4F49] max-w-lg mx-auto leading-relaxed mb-10 text-center"
          />
        </section>

        {/* TRUST SHOWCASE */}
        <TrustShowcase
          isAdmin={isAdmin}
          items={siteSettings.trustItems as TrustItem[]}
          onSave={(updatedItems) =>
            handleSettingsSave("trustItems", updatedItems)
          }
        />

        {/* =============================================
            CLOUD DIVIDER — Trust Badge → White Zone
        =============================================== */}
        <div
          className="relative z-10 w-full overflow-hidden flex justify-center -mb-1 pointer-events-none select-none"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 1440 140"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full min-w-[1000px] block h-[120px] md:h-[140px]"
          >
            {/* Cloud background base — peach (warna trust badge) */}
            <rect width="1440" height="140" fill="#FCE6CB" />
            {/* Fluffy cloud layer — awan putih mengalir ke zona putih */}
            <path
              d="
                M0,140 L0,95
                Q60,55 120,80
                Q150,92 180,75
                Q220,52 270,72
                Q300,85 330,68
                Q375,42 420,65
                Q455,82 490,62
                Q535,38 580,60
                Q615,76 650,58
                Q690,38 730,55
                Q770,72 810,52
                Q850,32 895,52
                Q930,68 965,50
                Q1005,30 1050,52
                Q1085,68 1120,50
                Q1165,28 1210,50
                Q1250,68 1290,52
                Q1340,30 1380,55
                Q1415,72 1440,60
                L1440,140 Z
              "
              fill="#ffffff"
            />
            {/* Second cloud puff layer for depth */}
            <path
              d="
                M0,140 L0,110
                Q40,90 80,105
                Q110,115 145,100
                Q180,85 215,100
                Q250,115 285,102
                Q320,88 360,104
                Q395,118 435,103
                Q475,87 515,102
                Q555,118 595,105
                Q635,90 675,106
                Q715,120 755,107
                Q795,92 835,108
                Q875,122 915,108
                Q955,93 995,109
                Q1035,123 1075,110
                Q1115,95 1155,110
                Q1195,124 1240,112
                Q1285,98 1330,112
                Q1380,124 1440,115
                L1440,140 Z
              "
              fill="#ffffff"
              opacity="0.7"
            />
          </svg>
        </div>

        {/* =============================================
            WHITE ZONE — Tentang, Testimonial, FAQ
            Background putih bersih untuk kontras elegan
            dengan peach trust badge di atasnya
        =============================================== */}
        <div className="relative z-10 bg-white">
          {/* SECTION A: TENTANG SIMOENGIL (STORYTELLING) */}
          <section id="tentang" className="relative py-24">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                {/* Story Image Section with Polaroid Vibe */}
                <div className="lg:col-span-5 relative flex justify-center">
                  <div className="absolute -top-6 -left-6 w-16 h-16 bg-[#D48C70]/10 rounded-full blur-xl" />
                  <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#E8B37D]/10 rounded-full blur-2xl" />

                  <div className="relative bg-white p-4 pb-12 rounded-[2rem] shadow-xl border border-[#E8B37D]/20 rotate-[-2deg] hover:rotate-0 transition-transform duration-500 max-w-[380px] w-full z-10">
                    <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-[#FCE6CB]">
                      <img
                        src="/images/detail_fabric.png"
                        alt="Bahan Premium Kain Simoengil"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-[#2A1F1A]/80 backdrop-blur-xs text-white text-[10px] uppercase tracking-widest font-black py-1 px-3 rounded-full">
                        Premium Quality
                      </div>
                    </div>
                    <div className="mt-5 text-center font-serif text-[#2C2C2C] text-sm tracking-wide flex items-center justify-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#D48C70]" /> Kain
                      Lembut & Dacron Murni
                    </div>
                  </div>
                </div>

                {/* Story Text Section */}
                <div className="lg:col-span-7 space-y-8">
                  <div 
                    className="inline-flex items-center justify-center gap-2 px-6 py-1.5 bg-[#FDF1D6] text-[#F15A24] text-xs font-black uppercase tracking-wider drop-shadow-sm mb-2"
                    style={{ clipPath: "polygon(15px 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 15px 100%, 0% 50%)" }}
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>Cerita Simoengil</span>
                  </div>

                  <Editable
                    isAdmin={isAdmin}
                    itemKey="story.title"
                    initialValue={story.title}
                    onSave={(key, value) =>
                      handleSettingsSave("story", { ...story, title: value })
                    }
                    as="h2"
                    className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#2A1F1A] leading-tight gsap-section-title relative pb-3"
                  />
                  <span className="gsap-underline absolute bottom-0 left-0 bg-[#D48C70] h-[3px] w-0" />

                  <div
                    className="space-y-5 text-slate-600 text-sm sm:text-base leading-relaxed font-medium gsap-reveal"
                    data-effect="blur"
                  >
                    <Editable
                      isAdmin={isAdmin}
                      itemKey="story.paragraph1"
                      initialValue={story.paragraph1}
                      onSave={(key, value) =>
                        handleSettingsSave("story", {
                          ...story,
                          paragraph1: value,
                        })
                      }
                      as="p"
                      className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium"
                    />
                    <Editable
                      isAdmin={isAdmin}
                      itemKey="story.paragraph2"
                      initialValue={story.paragraph2}
                      onSave={(key, value) =>
                        handleSettingsSave("story", {
                          ...story,
                          paragraph2: value,
                        })
                      }
                      as="p"
                      className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium"
                    />
                    <Editable
                      isAdmin={isAdmin}
                      itemKey="story.paragraph3"
                      initialValue={story.paragraph3}
                      onSave={(key, value) =>
                        handleSettingsSave("story", {
                          ...story,
                          paragraph3: value,
                        })
                      }
                      as="p"
                      className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium"
                    />
                  </div>

                  {/* Highlight Quote */}
                  <div
                    className="relative pl-6 border-l-4 border-[#D48C70] py-2 bg-[#FFF5F0]/60 rounded-r-2xl pr-4 gsap-reveal"
                    data-effect="fade-up"
                    data-delay="0.1"
                  >
                    <span className="absolute top-1 left-2 text-4xl text-[#D48C70]/30 leading-none font-serif">
                      &ldquo;
                    </span>
                    <Editable
                      isAdmin={isAdmin}
                      itemKey="story.quote"
                      initialValue={story.quote}
                      onSave={(key, value) =>
                        handleSettingsSave("story", { ...story, quote: value })
                      }
                      as="p"
                      className="italic text-[#2A1F1A] font-serif text-sm sm:text-base leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PROMO BANNER SECTION */}
          {/* <section className="relative z-10 w-full px-4 sm:px-6 lg:px-8 mb-24">
          <div className="relative rounded-[2.5rem] bg-gradient-to-tr from-[#FF8FB1] to-[#FFB6C8] p-8 md:p-14 overflow-hidden shadow-lg border border-white/20 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-pink-700/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="space-y-4 text-center md:text-left z-10 max-w-xl">
              <span className="text-xs font-black bg-white/20 text-white px-4 py-1.5 rounded-full uppercase tracking-wider">
                🎁 Promo Spesial Bulan Ini
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight font-heading">
                Beli 2 Boneka Gemoy, Dapatkan Gantungan Kunci Gratis!
              </h3>
              <p className="text-white/90 text-xs sm:text-sm font-medium leading-relaxed">
                Dapatkan bonus langsung gantungan kunci beruang/bunny premium untuk setiap pembelian minimal 2 boneka beruang tipe apapun di official store Shopee kami. Promo otomatis berlaku selama persediaan masih ada!
              </p>
            </div>

            <div className="shrink-0 z-10 w-full md:w-auto">
              <a
                href="https://shopee.co.id"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full md:w-auto text-center py-4 px-8 bg-white hover:bg-[#FFF5F0] text-[#FF8FB1] font-extrabold rounded-2xl shadow-md transition-all hover:scale-[1.03] active:scale-95 duration-200"
              >
                Belanja di Shopee & Claim Bonus 🧸
              </a>
            </div>
          </div>
        </section> */}

          {/* TESTIMONIALS SECTION */}
          <section className="relative py-20">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                <div 
                  className="inline-flex items-center justify-center gap-2 px-6 py-1.5 bg-[#FDF1D6] text-[#F15A24] text-xs font-black uppercase tracking-wider drop-shadow-sm mb-2"
                  style={{ clipPath: "polygon(15px 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 15px 100%, 0% 50%)" }}
                >
                  <Smile className="w-3.5 h-3.5" />
                  <span>Wall of Love</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#2A1F1A] leading-tight gsap-section-title relative inline-block pb-3">
                  Kisah Manis Boneka Simoengil
                  <span className="gsap-underline absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#D48C70] h-[3px] w-0"></span>
                </h2>
                <p
                  className="text-slate-500 text-sm font-medium leading-relaxed gsap-reveal"
                  data-effect="blur"
                >
                  Ribuan boneka handmade kami telah menjadi kado terindah &
                  membawa senyuman di berbagai rumah.
                </p>
              </div>

              <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 gap-4 md:gap-8 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
                {/* Testimonial 1 */}
                <div
                  className="bg-white rounded-[2.2rem] p-6 sm:p-8 border border-[#E8B37D]/20 shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex flex-col justify-between space-y-6 hover:shadow-[0_15px_35px_rgba(212,140,112,0.12)] hover:-translate-y-1 transition-all duration-300 gsap-reveal w-[85vw] max-w-[280px] sm:max-w-[320px] md:w-auto md:max-w-none flex-none snap-start"
                  data-effect="fade-up"
                  data-delay="0.1"
                >
                  <div className="space-y-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4.5 h-4.5 fill-current text-[#E8B37D]"
                        />
                      ))}
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium italic">
                      &quot;Bulunya halus banget rasfur premium, jahitannya
                      sangat rapi dan tebal. Isian dacronnya padat tapi tetap
                      empuk banget dipeluk. Sangat rekomended buat kado
                      anak-anak!&quot;
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-[#FFF5F0] text-[#D48C70] font-bold text-xs flex items-center justify-center border border-[#E8B37D]/20 shrink-0">
                      RN
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#2C2C2C] flex flex-wrap items-center gap-1.5">
                        <span>Ratih Ningsih</span>
                        <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded font-black border border-emerald-100 uppercase tracking-widest scale-95">
                          ✓ Verified
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        12 Mei 2026
                      </p>
                    </div>
                  </div>
                </div>

                {/* Testimonial 2 */}
                <div
                  className="bg-white rounded-[2.2rem] p-6 sm:p-8 border border-[#E8B37D]/20 shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex flex-col justify-between space-y-6 hover:shadow-[0_15px_35px_rgba(212,140,112,0.12)] hover:-translate-y-1 transition-all duration-300 gsap-reveal w-[85vw] max-w-[280px] sm:max-w-[320px] md:w-auto md:max-w-none flex-none snap-start"
                  data-effect="fade-up"
                  data-delay="0.2"
                >
                  <div className="space-y-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4.5 h-4.5 fill-current text-[#E8B37D]"
                        />
                      ))}
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium italic">
                      &quot;Beli untuk kado wisuda pacar, respon admin cepat and
                      dapet selempang kustom nama wisuda gratis. Packingnya rapi
                      menggunakan box cantik dan pita pink manis. Worth the
                      price!&quot;
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-[#FFF5F0] text-[#D48C70] font-bold text-xs flex items-center justify-center border border-[#E8B37D]/20 shrink-0">
                      BS
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#2C2C2C] flex flex-wrap items-center gap-1.5">
                        <span>Budi Santoso</span>
                        <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded font-black border border-emerald-100 uppercase tracking-widest scale-95">
                          ✓ Verified
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        04 Mei 2026
                      </p>
                    </div>
                  </div>
                </div>

                {/* Testimonial 3 */}
                <div
                  className="bg-white rounded-[2.2rem] p-6 sm:p-8 border border-[#E8B37D]/20 shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex flex-col justify-between space-y-6 hover:shadow-[0_15px_35px_rgba(212,140,112,0.12)] hover:-translate-y-1 transition-all duration-300 gsap-reveal w-[85vw] max-w-[280px] sm:max-w-[320px] md:w-auto md:max-w-none flex-none snap-start"
                  data-effect="fade-up"
                  data-delay="0.3"
                >
                  <div className="space-y-4">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4.5 h-4.5 fill-current text-[#E8B37D]"
                        />
                      ))}
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium italic">
                      &quot;Anak saya senang sekali dengan boneka ukuran 20cm
                      ini, pas buat dipeluk saat tidur. Bulunya tidak mudah
                      rontok jadi aman untuk balita. Kemarin dicuci mesin tetap
                      mengembang bagus!&quot;
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-[#FFF5F0] text-[#D48C70] font-bold text-xs flex items-center justify-center border border-[#E8B37D]/20 shrink-0">
                      SR
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#2C2C2C] flex flex-wrap items-center gap-1.5">
                        <span>Siti Rahma</span>
                        <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.2 rounded font-black border border-emerald-100 uppercase tracking-widest scale-95">
                          ✓ Verified
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        28 April 2026
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CARA PESAN SECTION */}
          <section
            id="cara-pesan"
            className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-20 border-t border-slate-100"
          >
            <div className="text-center mb-16 space-y-3 relative z-20">
              <div className="inline-flex p-2.5 rounded-2xl bg-[#FFF5F0] border border-[#E8B37D]/25 text-[#D48C70] mb-2 shadow-xs">
                <HelpCircle className="w-5 h-5 text-[#D48C70]" />
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#2A1F1A] leading-tight relative inline-block pb-3 font-bold">
                Cara Mudah Memesan Boneka
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#D48C70] h-[3px] w-12 rounded-full"></span>
              </h2>
              <p className="text-slate-500 text-sm font-medium">
                Ikuti 3 langkah mudah berikut untuk mendapatkan boneka kesayanganmu langsung ke rumah.
              </p>
            </div>

            <div className="relative max-w-5xl mx-auto">
              {/* Garis jahitan di belakang, hanya muncul di desktop */}
              <svg 
                className="hidden md:block absolute top-[4.5rem] left-0 w-full h-auto z-0 pointer-events-none"
                viewBox="0 0 1000 140" 
                preserveAspectRatio="none" 
                style={{ filter: 'drop-shadow(0 2px 2px rgba(212,140,112,0.15))' }}
              >
                <path 
                  className="path-stitch-line"
                  d="M 0 40 Q 166 -10 333 40 T 666 40 T 1000 40" 
                  fill="none" 
                  stroke="#D48C70" 
                  strokeWidth="3" 
                  strokeDasharray="10 8" 
                  strokeLinecap="round" 
                />
                <g transform="translate(1000, 40) rotate(35)">
                  <path d="M -20 -2 L 0 0 L -20 2 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1"/>
                  <circle cx="-16" cy="0" r="1" fill="#D48C70"/>
                  <path d="M -16 0 L -25 0" stroke="#D48C70" strokeWidth="2" strokeLinecap="round"/>
                </g>
              </svg>

              {/* Garis jahitan melintang ke bawah, hanya muncul di mobile */}
              <svg 
                className="block md:hidden absolute left-1/2 -translate-x-1/2 top-10 w-32 h-[92%] z-0 pointer-events-none" 
                viewBox="0 0 100 1000" 
                preserveAspectRatio="none"
                style={{ filter: 'drop-shadow(0 2px 2px rgba(212,140,112,0.15))' }}
              >
                <path 
                  className="path-stitch-line"
                  d="M 50 0 Q 100 166 50 333 T 50 666 T 50 1000" 
                  fill="none" 
                  stroke="#D48C70" 
                  strokeWidth="4" 
                  strokeDasharray="10 8" 
                  strokeLinecap="round" 
                />
                <g transform="translate(50, 1000) rotate(90)">
                  <path d="M -20 -2 L 0 0 L -20 2 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1"/>
                  <circle cx="-16" cy="0" r="1" fill="#D48C70"/>
                  <path d="M -16 0 L -25 0" stroke="#D48C70" strokeWidth="2" strokeLinecap="round"/>
                </g>
              </svg>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 relative z-10">
                {/* Langkah 1 */}
                <div className="bg-[#FFF0E5] rounded-[2.2rem] p-8 border-2 border-[#E8B37D]/40 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col items-center text-center space-y-4 hover:shadow-[0_15px_35px_rgba(212,140,112,0.12)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                  {/* Fabric Patch */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-[#FFF5F0] rotate-12 rounded-lg border border-[#E8B37D]/30 shadow-sm opacity-80 group-hover:rotate-6 transition-transform">
                    {/* Cross stitches on patch */}
                    <svg className="absolute inset-0 w-full h-full text-[#D48C70]/50" viewBox="0 0 40 40">
                      <path d="M4 4 L8 8 M8 4 L4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M32 4 L36 8 M36 4 L32 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M4 32 L8 36 M8 32 L4 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M32 32 L36 36 M36 32 L32 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-[#FFF5F0] border border-[#E8B37D]/20 text-[#D48C70] flex items-center justify-center shadow-sm relative z-10">
                    {/* Custom Vector: Small doll picked by hand */}
                    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="9" r="4" fill="#FCE6CB" stroke="#D48C70" strokeWidth="1.5"/>
                      <path d="M9 13 Q12 18 15 13" fill="#FCE6CB" stroke="#D48C70" strokeWidth="1.5"/>
                      <path d="M12 2 L12 5" stroke="#D48C70" strokeWidth="1.5" strokeDasharray="2 2"/>
                      {/* Pointing hand */}
                      <path d="M16 16 L18 14 C19 13 21 15 20 17 L17 21 C16 22 14 22 13 21 L11 19 L16 16 Z" fill="white" stroke="#D48C70" strokeWidth="1.5"/>
                      <path d="M16 16 L13 19" stroke="#D48C70" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <div className="space-y-2 relative z-10">
                    <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest block">Langkah 01</span>
                    <h3 className="font-serif text-lg text-[#2A1F1A] font-bold">Pilih Boneka Favorit</h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
                      Jelajahi katalog boneka premium kami, pilih varian ukuran, lalu klik <strong>Tambah ke Keranjang</strong>.
                    </p>
                  </div>
                </div>

                {/* Langkah 2 */}
                <div className="bg-[#FFF0E5] rounded-[2.2rem] p-8 border-2 border-[#E8B37D]/40 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col items-center text-center space-y-4 hover:shadow-[0_15px_35px_rgba(212,140,112,0.12)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group mt-0 md:mt-8">
                  {/* Fabric Patch */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-[#FFF5F0] -rotate-6 rounded-lg border border-[#E8B37D]/30 shadow-sm opacity-80 group-hover:rotate-0 transition-transform">
                    <svg className="absolute inset-0 w-full h-full text-[#D48C70]/50" viewBox="0 0 40 40">
                      <path d="M4 4 L8 8 M8 4 L4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M32 4 L36 8 M36 4 L32 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M4 32 L8 36 M8 32 L4 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M32 32 L36 36 M36 32 L32 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-[#FFF5F0] border border-[#E8B37D]/20 text-[#D48C70] flex items-center justify-center shadow-sm relative z-10">
                    {/* Custom Vector: Parcel box with cross stitches + location pin */}
                    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="10" width="16" height="10" rx="2" fill="#FCE6CB" stroke="#D48C70" strokeWidth="1.5"/>
                      <path d="M4 14 L20 14" stroke="#D48C70" strokeDasharray="3 3"/>
                      <path d="M12 10 L12 20" stroke="#D48C70" strokeDasharray="3 3"/>
                      {/* Location Pin */}
                      <path d="M12 2 C9 2 7 4 7 7 C7 11 12 16 12 16 C12 16 17 11 17 7 C17 4 15 2 12 2 Z" fill="white" stroke="#D48C70"/>
                      <circle cx="12" cy="7" r="2" fill="#D48C70"/>
                    </svg>
                  </div>
                  <div className="space-y-2 relative z-10">
                    <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest block">Langkah 02</span>
                    <h3 className="font-serif text-lg text-[#2A1F1A] font-bold">Isi Detail Pengiriman</h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
                      Lakukan login cepat, isi alamat lengkap Anda, dan sistem kami akan menghitung biaya ongkir secara otomatis.
                    </p>
                  </div>
                </div>

                {/* Langkah 3 */}
                <div className="bg-[#FFF0E5] rounded-[2.2rem] p-8 border-2 border-[#E8B37D]/40 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col items-center text-center space-y-4 hover:shadow-[0_15px_35px_rgba(212,140,112,0.12)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                  {/* Fabric Patch */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-[#FFF5F0] rotate-6 rounded-lg border border-[#E8B37D]/30 shadow-sm opacity-80 group-hover:-rotate-3 transition-transform">
                    <svg className="absolute inset-0 w-full h-full text-[#D48C70]/50" viewBox="0 0 40 40">
                      <path d="M4 4 L8 8 M8 4 L4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M32 4 L36 8 M36 4 L32 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M4 32 L8 36 M8 32 L4 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M32 32 L36 36 M36 32 L32 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-[#FFF5F0] border border-[#E8B37D]/20 text-[#D48C70] flex items-center justify-center shadow-sm relative z-10">
                    {/* Custom Vector: Wallet/card with embroidered heart */}
                    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="6" width="18" height="13" rx="2" fill="#FCE6CB" stroke="#D48C70"/>
                      <path d="M3 10 L21 10" stroke="#D48C70" strokeWidth="2"/>
                      {/* Embroidered heart */}
                      <path d="M11.5 15 C11.5 15 10 13.5 10 12.5 C10 11.5 11 11.5 11.5 12.5 C12 11.5 13 11.5 13 12.5 C13 13.5 11.5 15 11.5 15 Z" fill="#D48C70" stroke="#D48C70" strokeWidth="1"/>
                      {/* Thread trailing from heart */}
                      <path d="M12.5 14 Q15 17 18 15" stroke="#D48C70" strokeDasharray="1.5 1.5"/>
                    </svg>
                  </div>
                  <div className="space-y-2 relative z-10">
                    <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest block">Langkah 03</span>
                    <h3 className="font-serif text-lg text-[#2A1F1A] font-bold">Pembayaran Instan</h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
                      Selesaikan pembayaran aman via Midtrans (Transfer Bank, E-Wallet, dll). Pesanan Anda langsung kami proses kirim!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ SECTION */}
          <section
            id="faq"
            className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pb-28 pt-4"
          >
            <div className="text-center mb-12 space-y-3">
              <div className="inline-flex p-2.5 rounded-2xl bg-[#FFF5F0] border border-[#E8B37D]/25 text-[#D48C70] mb-2 shadow-xs">
                <HelpCircle className="w-5 h-5 text-[#D48C70]" />
              </div>
              <h2 className="font-serif text-3xl text-[#2A1F1A] leading-tight gsap-section-title relative inline-block pb-3">
                Pertanyaan Populer (FAQ)
                <span className="gsap-underline absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#D48C70] h-[3px] w-0"></span>
              </h2>
              <p
                className="text-slate-500 text-xs sm:text-sm font-medium gsap-reveal"
                data-effect="blur"
              >
                Informasi lengkap seputar kualitas boneka, dan pengemasan
                pesanan.
              </p>
            </div>

            {/* FAQ Accordion list */}
            <div className="space-y-4 gsap-reveal" data-effect="fade-up">
              {faqs.map((faq, idx) => {
                const isOpen = faqOpenIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.04)] hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Header question */}
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-[#2C2C2C] text-sm sm:text-base cursor-pointer hover:bg-[#FFF5F0]/60"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#D48C70]" : ""}`}
                      />
                    </button>

                    {/* Answer body */}
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isOpen
                          ? "max-h-96 opacity-100 border-t border-slate-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="p-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium bg-[#FFF8F5]/50">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
        {/* END WHITE ZONE */}

        {/* FOOTER */}
        <SiteFooter />

        {/* FEATURED PRODUCTS ADMIN MODAL */}
        <FeaturedProductsAdminModal
          isOpen={isFeaturedModalOpen}
          onClose={() => setIsFeaturedModalOpen(false)}
          productsList={productsList}
          currentIds={featuredProductIds}
          onSave={async (newIds) => {
            await handleSettingsSave("featuredProductIds", newIds);
          }}
        />

        {/* DETAIL MODAL REMOVED (Direct Navigation to /product/[id]) */}

        {/* WISHLIST DRAWER */}
        <WishlistDrawer
          isOpen={isWishlistOpen}
          onClose={() => setIsWishlistOpen(false)}
          cartItems={cart}
          onRemoveItem={handleRemoveCartItem}
          onUpdateQuantity={handleUpdateCartQuantity}
          onDetailClick={handleProductDetailClick}
          isLoggedIn={!!user}
          onAuthRequired={() => setIsAuthModalOpen(true)}
          drawerCartIconRef={drawerCartIconRef}
        />

        <CartCelebration
          trigger={celebrateTrigger}
          productImage={celebrateProductImage}
          cartIconRef={drawerCartIconRef}
          onComplete={() => setCelebrateTrigger(false)}
        />

        {/* TRACKING MODAL */}
        <OrderTrackingModal
          isOpen={isTrackingOpen}
          onClose={() => setIsTrackingOpen(false)}
        />

        {/* AUTH MODAL */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </main>
    </div>
  );
}
