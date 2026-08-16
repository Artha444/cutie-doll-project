'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  Search, 
  Filter,
  Sparkles, 
  Smile, 
  ShieldCheck, 
  RefreshCw, 
  HelpCircle, 
  MessageSquare, 
  ShoppingBag, ShoppingCart, 
  ChevronDown,
  Gift,
  HeartHandshake,
  Star,
  LayoutGrid,
  List
} from 'lucide-react';
import { Product, ProductVariant, PRODUCTS } from '@/data/products';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { WishlistDrawer } from '@/components/WishlistDrawer';
import { CartCelebration } from '@/components/CartCelebration';
import { GSAPInitializer } from '@/components/GSAPInitializer';
import { SiteFooter } from '@/components/SiteFooter';

import { OrderTrackingModal } from '@/components/OrderTrackingModal';
import AuthModal from '@/components/AuthModal';
import { supabase } from '@/lib/supabase';
import confetti from 'canvas-confetti';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as LucideIcons from 'lucide-react';

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Sparkles;
  return <IconComponent className={className} />;
};

interface WhyFeature {
  icon: string;
  title: string;
  desc: string;
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
  logoTextMain: string;
  logoTextSub: string;
  logoIcon: string;
  logoImageType: 'icon' | 'image';
  logoImageUrl: string;
  [key: string]: unknown;
}

export default function Home() {
  const router = useRouter();
  // State
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<import('@/data/products').CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);
  const sortRef = React.useRef<HTMLDivElement>(null);
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });
  const drawerCartIconRef = useRef<HTMLDivElement | null>(null);
  const [celebrateTrigger, setCelebrateTrigger] = useState(false);
  const [celebrateProductImage, setCelebrateProductImage] = useState<string | undefined>();

  const handleCelebrate = (productImage?: string) => {
    setCelebrateProductImage(productImage);
    setCelebrateTrigger(false);
    requestAnimationFrame(() => setCelebrateTrigger(true));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only tilt on desktop
    if (window.innerWidth < 768) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 20;
    const y = -(e.clientY - top - height / 2) / 20;
    setHeroTilt({ x, y });
  };

  const handleHeroMouseLeave = () => {
    setHeroTilt({ x: 0, y: 0 });
  };

  // Site Settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    heroTitle: 'Temukan Teman Peluk Pertamamu!',
    heroDescription: 'Toko online Boneka Simoengil menyediakan aneka plushie & boneka super lembut berkualitas tinggi. Terbuat dari 100% premium dacron grade A, hypoallergenic, aman untuk anak-anak, dan bisa dicuci sesering mungkin tanpa khawatir kempis!',
    whyTitle: 'Kenapa Memilih Boneka Simoengil?',
    whyFeatures: [
      { icon: 'ShieldCheck', title: '100% Dacron Grade A', desc: 'Isian silikon dacron super murni tanpa campuran limbah garmen. Memastikan keempukan tahan bertahun-tahun dan tidak gampang kempes.' },
      { icon: 'RefreshCw', title: 'Bisa Dicuci (Washable)', desc: 'Mudah dibersihkan! Cukup dicuci dengan tangan atau mesin cuci (putaran halus). Dacron akan mengembang kembali begitu kering sempurna.' },
      { icon: 'Smile', title: 'Aman untuk Bayi', desc: 'Kain luar bulu yelvo/spandex hypoallergenic berbulu lembut dan tidak mudah rontok. Lulus uji kualitas aman bagi pernapasan balita.' }
    ],
    heroImage1: '/images/plushie_teddy.png',
    heroImage2: '/images/plushie_bunny.png',
    heroBadge1Icon: '🌟',
    heroBadge1Text: 'Terlembut',
    heroBadge2Icon: '❤️',
    heroBadge2Text: 'Anti Alergi',
    logoTextMain: 'Simoengil',
    logoTextSub: 'Plushie & Doll',
    logoIcon: 'Smile',
    logoImageType: 'icon',
    logoImageUrl: ''
  });

  // Load wishlist from localStorage on mount & Fetch Supabase products & Check Admin Auth
  useEffect(() => {
    const savedCart = localStorage.getItem('simoengil_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    }

    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const { data, error } = await supabase.from('products').select('*');
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
              shopeeLink: item.shopee_link || '',
              shopeeAvailable: specs.shopeeAvailable !== undefined ? specs.shopeeAvailable : true,
              specifications: {
                material: specs.material || '100% Premium Dacron & Kain Rasfur',
                size: specs.size || 'Standard',
                washing: specs.washing || 'Bisa dicuci dengan tangan atau mesin cuci',
                safeForKids: specs.safeForKids !== undefined ? specs.safeForKids : true,
                shopeePrice: specs.shopeePrice || undefined,
                shopeeAvailable: specs.shopeeAvailable !== undefined ? specs.shopeeAvailable : true,
                features: specs.features || [],
                images: specs.images || [],
                soldCount: specs.soldCount || 0,
                testimonials: specs.testimonials || [],
                types: specs.types || [],
                sizes: specs.sizes || [],
              },
              variants: (item.variants || []).map((v: Partial<ProductVariant>) => ({
                ...v,
                shopeeAvailable: v.shopeeAvailable !== undefined ? v.shopeeAvailable : true,
              }))
            };
          });
          setProductsList(mappedData);
        } else {
          const localMockStr = localStorage.getItem('simoengil_mock_products');
          if (localMockStr) {
            setProductsList(JSON.parse(localMockStr));
          } else {
            setProductsList(PRODUCTS);
          }
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local products list:', err);
        const localMockStr = localStorage.getItem('simoengil_mock_products');
        if (localMockStr) {
          setProductsList(JSON.parse(localMockStr));
        } else {
          setProductsList(PRODUCTS);
        }
      } finally {
        setIsLoadingProducts(false);
      }
    };

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          // Only redirect to admin panel if the role is admin
          if (session.user?.user_metadata?.role === 'admin') {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.warn('Auth check skipped');
      }
    };
    checkAuth();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        if (session.user?.user_metadata?.role === 'admin') {
          setIsAdmin(true);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'homepage').single();
        if (!error && data) {
          setSiteSettings(prev => ({
            ...prev,
            ...(data.settings || {})
          }));
        }
      } catch (err) {
        // Silently catch error, we will fallback to localStorage below
        console.log('Using local settings fallback');
      }

      // Always load local defaults if available as fallback or overlay
      const local = localStorage.getItem('simoengil_settings');
      if (local) {
        try {
          const settings = JSON.parse(local);
          setSiteSettings(prev => ({
            ...prev,
            ...settings
          }));
        } catch (e) {
          console.warn('Failed to parse local settings', e);
        }
      }
    };

    fetchProducts();
    fetchSettings();

    // Check URL parameters for auth redirect
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('auth') === 'true') {
        setIsAuthModalOpen(true);
        const url = new URL(window.location.href);
        url.searchParams.delete('auth');
        url.searchParams.delete('required');
        window.history.replaceState({}, '', url.toString());
      }
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Logic handled in the authListener above
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync cart to localStorage
  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    let updatedCart = cart.map(item => {
      if (item.cartItemId === cartItemId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    setCart(updatedCart);
    localStorage.setItem('simoengil_cart', JSON.stringify(updatedCart));
  };
  
  const handleAddToCart = (product: Product, variantSize?: string, variantType?: string) => {
    const cartItemId = `${product.id}-${variantSize || 'default'}-${variantType || 'default'}`;
    const existingItem = cart.find(item => item.cartItemId === cartItemId);
    
    let updatedCart;
    if (existingItem) {
      updatedCart = cart.map(item => 
        item.cartItemId === cartItemId 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
    } else {
      let price = product.price;
      const sizes = product.specifications?.sizes || [];
      const types = product.specifications?.types || [];
      
      const sizeObj = sizes.find(s => s.name === variantSize);
      const typeObj = types.find(t => t.name === variantType);
      
      if (sizeObj && sizeObj.extraPrice) price += sizeObj.extraPrice;
      if (typeObj && typeObj.extraPrice) price += typeObj.extraPrice;
      
      updatedCart = [...cart, { ...product, cartItemId, selectedVariantSize: variantSize, selectedVariantType: variantType, quantity: 1, selectedPrice: price }];
    }
    
    setCart(updatedCart);
    localStorage.setItem('simoengil_cart', JSON.stringify(updatedCart));
    handleCelebrate(product.image);
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    const updatedCart = cart.filter(item => item.cartItemId !== cartItemId);
    setCart(updatedCart);
    localStorage.setItem('simoengil_cart', JSON.stringify(updatedCart));
  };

  // Filter products using dynamic productsList
  const filteredProducts = productsList.filter(product => {
    const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'termurah') return a.price - b.price;
    if (sortBy === 'termahal') return b.price - a.price;
    if (sortBy === 'terlaris' || sortBy === 'popular') {
      const soldA = a.specifications?.soldCount || 0;
      const soldB = b.specifications?.soldCount || 0;
      return soldB - soldA;
    }
    if (sortBy === 'top_rated') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy === 'newest') {
      return Number(b.id) - Number(a.id);
    }
    return 0;
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
    const catalogSection = document.getElementById('katalog');
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Categories list
  const categories = ['Semua', ...Array.from(new Set(productsList.map(p => p.category).filter(Boolean)))];

  // FAQs
  const faqs = [
  {
    q: 'Apakah boneka flanel Simoengil aman untuk bayi dan balita?',
    a: 'Sangat aman, Bu. Boneka kami terbuat dari kain flanel premium yang lembut dan hypoallergenic (tidak mudah menyebabkan alergi). Jahitannya rapi, tidak ada bagian kecil yang mudah lepas, sehingga aman untuk anak kecil dan bayi.'
  },

  {
    q: 'Apakah bisa pesan boneka untuk kado wisuda dengan custom nama?',
    a: 'Tidak bisa, untuk pesanan custom tidak dilakukan di website, jika ingin dilakukan custom silahkan lakukan pembelian di Shopee'
  },
  {
    q: 'Berapa lama proses packing dan pengiriman?',
    a: 'Kami packing dan kirim setiap hari. Pesanan yang masuk sebelum jam 15.00 WIB biasanya dikirim di hari yang sama. Untuk Jabodetabek tersedia pengiriman sameday/instan melalui Shopee.'
  },
  {
    q: 'Apakah ada garansi jika boneka rusak atau cacat?',
    a: 'Ada garansi kualitas. Jika dalam 7 hari setelah terima ada cacat produksi (jahitan lepas, bahan robek, dll), silakan hubungi kami via WhatsApp untuk proses penggantian atau pengembalian.'
  }
];
  return (
    <div className="relative min-h-screen flex flex-col selection:bg-pink-100 selection:text-pink-600 bg-transparent font-sans text-slate-800">
      <GSAPInitializer />
      
      {/* Animated Gradient Blobs Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-pink-100/50 via-white/40 to-transparent blur-3xl animate-drift-1" />
        <div className="absolute top-[40%] -right-[10%] w-[35vw] h-[35vw] rounded-full bg-gradient-to-tr from-pink-200/25 via-orange-100/20 to-transparent blur-3xl animate-drift-2" />
        <div className="absolute bottom-[10%] left-[5%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-bl from-amber-100/30 via-pink-100/20 to-transparent blur-3xl animate-drift-3" />
      </div>

      {/* HEADER / NAVBAR */}
      <main className="flex-1 w-full overflow-x-hidden">
        
      {/* CATALOG FULL-BLEED HERO BANNER */}
      <div className="relative w-full h-[450px] sm:h-[550px] lg:h-[600px] flex flex-col items-center justify-center pt-24 sm:pt-28 overflow-hidden bg-black">
        {/* Background Hero Banner Image */}
        <div className="absolute inset-0 w-full h-full">
          <img src="/images/herobanner.jpeg" className="w-full h-full object-cover object-center" alt="Koleksi Boneka Handmade" />
        </div>
        
        {/* Removed black gradient overlay as requested */}

        {/* Text Content in Glassmorphic Container with Dashed Stitching Border */}
        <div className="relative z-10 w-full max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-left max-w-2xl px-6 py-8 sm:px-10 sm:py-12 bg-white/35 backdrop-blur-md border-2 border-dashed border-[#FF8FB1]/70 rounded-[2.5rem] shadow-xl space-y-4 sm:space-y-5 relative">
            <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-black text-[#2A1F1A] tracking-tight leading-tight">
              Adopsi Teman Peluk Impianmu
            </h1>
            <p className="text-slate-700 text-xs sm:text-sm md:text-base font-bold leading-relaxed max-w-xl">
              Temukan aneka karya boneka flanel buatan tangan yang gemoy dan berkarakter. Cocok untuk kado wisuda, ulang tahun, hiasan kamar, maupun dasbor mobil!
            </p>
          
          {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-start gap-3 sm:gap-4 pt-3">
              <button className="px-6 py-2.5 sm:px-8 sm:py-3 bg-[#FF8FB1] text-white font-bold text-xs sm:text-sm rounded-xl shadow-[0_4px_15px_rgba(255,143,177,0.4)] hover:bg-[#FF7A9F] hover:-translate-y-0.5 transition-all">
                Belanja Sekarang
              </button>
              <button className="px-6 py-2.5 sm:px-8 sm:py-3 bg-white text-[#2A1F1A] font-bold text-xs sm:text-sm rounded-xl border-2 border-[#FCE6CB] hover:bg-[#FFF0F3] hover:border-[#FF8FB1] hover:-translate-y-0.5 transition-all">
                Lihat Kategori
              </button>
            </div>
          </div>
        </div>

        {/* Floating Trust Badges (Sticker Style) */}
        <div className="hidden md:block absolute right-[8%] top-[25%] bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/60 shadow-[0_4px_15px_rgba(0,0,0,0.05)] rotate-3 hover:rotate-0 hover:scale-105 transition-all cursor-default">
          <span className="text-[11px] lg:text-xs font-bold text-[#FF8FB1] flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5"/> Siap Kirim Indonesia</span>
        </div>
        
        <div className="hidden md:block absolute right-[25%] top-[45%] bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/60 shadow-[0_4px_15px_rgba(0,0,0,0.05)] -rotate-3 hover:rotate-0 hover:scale-105 transition-all cursor-default">
          <span className="text-[11px] lg:text-xs font-bold text-[#FF8FB1] flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5"/> Garansi Produk</span>
        </div>
        
        <div className="hidden md:block absolute right-[5%] top-[65%] bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/60 shadow-[0_4px_15px_rgba(0,0,0,0.05)] rotate-2 hover:rotate-0 hover:scale-105 transition-all cursor-default">
          <span className="text-[11px] lg:text-xs font-bold text-[#FF8FB1] flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5"/> 100% Jahitan Tangan</span>
        </div>
        
        <div className="hidden md:block absolute right-[30%] bottom-[15%] bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/60 shadow-[0_4px_15px_rgba(0,0,0,0.05)] -rotate-6 hover:rotate-0 hover:scale-105 transition-all cursor-default">
          <span className="text-[11px] lg:text-xs font-bold text-[#FF8FB1] flex items-center gap-1.5"><Heart className="w-3.5 h-3.5"/> Rating 4.9/5</span>
        </div>
      </div>

      {/* UNIFIED FILTER TOOLBAR CARD (Notebook/Scrapbook Style from Reference) */}
      <div className="w-full max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-12 my-6 z-40 relative">
        <div className="relative bg-[#FFFDFB] p-4 sm:p-6 rounded-[2.5rem] border-2 border-dashed border-[#D48C70]/40 shadow-[0_10px_30px_rgba(212,140,112,0.08)] overflow-visible">
          
          {/* Washi Tape Corner Accents (Matching Reference Image) */}
          <div className="absolute -top-3 left-8 w-12 h-5 bg-[#FDE68A]/90 -rotate-12 shadow-xs z-30 pointer-events-none rounded-xs border border-amber-200/50" />
          <div className="absolute -top-3 right-10 w-12 h-5 bg-[#FCA5A5]/90 rotate-12 shadow-xs z-30 pointer-events-none rounded-xs border border-rose-200/50" />
          <div className="absolute -bottom-3 right-14 w-14 h-5 bg-[#FF8FB1]/90 -rotate-6 shadow-xs z-30 pointer-events-none rounded-xs border border-pink-200/50" />

          {/* Filter Toolbar Content */}
          <div className="w-full flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 lg:gap-6">
            
            {/* 1. Search Bar */}
            <div className="relative w-full lg:flex-1 lg:max-w-md">
              <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-full border-2 border-[#D48C70]/30 shadow-xs focus-within:border-[#D48C70] focus-within:ring-4 focus-within:ring-[#D48C70]/15 transition-all w-full">
                <Search className="w-4.5 h-4.5 text-[#D48C70] shrink-0" />
                <input
                  type="text"
                  placeholder="Cari boneka impianmu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-[#2A1F1A] placeholder-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-slate-400 hover:text-[#D48C70] bg-slate-100 hover:bg-[#FFF0F3] w-6 h-6 rounded-full flex items-center justify-center font-bold transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* 2. Showing Results Count */}
            <div className="flex text-xs font-bold tracking-wide uppercase text-[#D48C70]/80 whitespace-nowrap px-2 pb-1 lg:pb-0">
              Showing {filteredProducts.length > 0 ? 1 : 0}–{filteredProducts.length} of {productsList.length} items
            </div>

            {/* 3. Sort Options & View Mode Buttons (Matching Pill Button Design) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto justify-between lg:justify-end overflow-hidden">
              
              {/* Sort Segmented Control Container */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <span className="text-xs sm:text-sm font-bold text-[#D48C70]/80 whitespace-nowrap pl-1 sm:pl-0">Sort by:</span>
                
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide w-full sm:w-auto max-w-full">
                  {/* Top Rated */}
                  <button
                    onClick={() => setSortBy('top_rated')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                      sortBy === 'top_rated'
                        ? 'bg-[#D48C70] text-white border-[#D48C70] shadow-xs'
                        : 'bg-white text-[#D48C70] border-[#D48C70]/40 hover:bg-[#D48C70]/10'
                    }`}
                  >
                    Top Rated
                  </button>

                  {/* Popular */}
                  <button
                    onClick={() => setSortBy('popular')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                      sortBy === 'popular' || sortBy === 'terlaris'
                        ? 'bg-[#D48C70] text-white border-[#D48C70] shadow-xs'
                        : 'bg-white text-[#D48C70] border-[#D48C70]/40 hover:bg-[#D48C70]/10'
                    }`}
                  >
                    Popular
                  </button>

                  {/* Newest */}
                  <button
                    onClick={() => setSortBy('newest')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                      sortBy === 'newest'
                        ? 'bg-[#D48C70] text-white border-[#D48C70] shadow-xs'
                        : 'bg-white text-[#D48C70] border-[#D48C70]/40 hover:bg-[#D48C70]/10'
                    }`}
                  >
                    Newest
                  </button>

                  {/* Price */}
                  <button
                    onClick={() => setSortBy(sortBy === 'termurah' ? 'termahal' : 'termurah')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-1 ${
                      sortBy === 'termurah' || sortBy === 'termahal'
                        ? 'bg-[#D48C70] text-white border-[#D48C70] shadow-xs'
                        : 'bg-white text-[#D48C70] border-[#D48C70]/40 hover:bg-[#D48C70]/10'
                    }`}
                  >
                    Price {sortBy === 'termurah' ? '↑' : sortBy === 'termahal' ? '↓' : ''}
                  </button>
                </div>
              </div>

              {/* View Mode Toggles (Circular Buttons from Reference Image) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                    viewMode === 'grid'
                      ? 'bg-[#D48C70] text-white border-[#D48C70] shadow-xs'
                      : 'bg-white text-[#D48C70] border-[#D48C70]/40 hover:bg-[#D48C70]/10'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                    viewMode === 'list'
                      ? 'bg-[#D48C70] text-white border-[#D48C70] shadow-xs'
                      : 'bg-white text-[#D48C70] border-[#D48C70]/40 hover:bg-[#D48C70]/10'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CATALOG / PRODUCTS GRID */}
      <section id="katalog" className="relative z-10 pt-2 pb-24 w-full px-4 sm:px-6 lg:px-12 max-w-[95rem] mx-auto min-h-screen">

        {/* Empty State */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2rem] p-3 shadow-md border border-slate-100 flex flex-col h-full overflow-hidden relative group animate-pulse">
                <div className="relative aspect-square w-full rounded-3xl bg-slate-200 overflow-hidden mb-4 shrink-0"></div>
                <div className="flex-1 flex flex-col px-1 justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2.5 opacity-0">
                      <div className="flex -space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <LucideIcons.Star key={i} className="w-3.5 h-3.5 fill-[#FFB6C8] text-[#FFB6C8]" />
                        ))}
                      </div>
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-100/60">
                    <div className="h-6 bg-slate-200 rounded w-2/3 mb-3"></div>
                    <div className="w-full h-11 bg-slate-200 rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-white border border-[#FFB6C8]/20 flex items-center justify-center mx-auto text-slate-400 shadow-xs animate-float">
              <LucideIcons.SearchX className="w-10 h-10 text-[#FF8FB1]" />
            </div>
            <div>
              <h3 className="font-heading font-black text-[#2C2C2C] text-base">Tidak Menemukan Boneka Cocok</h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                Kami tidak menemukan boneka dengan kriteria pencarian &quot;{searchQuery}&quot;. Coba ganti kata kunci pencarian Anda!
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
              }}
              className="py-3 px-6 border border-[#FFB6C8] text-[#FF8FB1] hover:bg-[#FFF5F0] font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          /* Products Grid / List */
          <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-10" : "grid grid-cols-1 md:grid-cols-2 gap-6"}>
            {(() => {
              const filterKey = `${selectedCategory}-${searchQuery}-${sortBy}`;
              return filteredProducts.map((product, index) => (
                <ProductCard
                  key={`${product.id}-${filterKey}`}
                  index={index}
                  product={product}
                  animate={true}
                  cartItemCount={cart.filter(c => c.id === product.id).reduce((sum, c) => sum + c.quantity, 0)}
                  onDetailClick={handleProductDetailClick}
                />
              ));
            })()}
          </div>
        )}
      </section>

      {/* PROMO BANNER SECTION */}
      <section className="relative z-10 w-full px-4 sm:px-6 lg:px-12 mb-24 max-w-[95rem] mx-auto">
        <div className="relative rounded-[2.5rem] bg-gradient-to-tr from-[#FF8FB1] via-[#FFB6C8] to-[#FCE6CB] p-8 md:p-12 overflow-hidden shadow-[0_15px_45px_rgba(255,143,177,0.25)] border-2 border-white/40 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-pink-700/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="space-y-3 text-center md:text-left z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-black bg-white/30 text-white px-4 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-sm border border-white/30">
              <Gift className="w-3.5 h-3.5 text-white" />
              <span>Promo Spesial Bulan Ini</span>
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight font-heading drop-shadow-xs">
              Beli 2 Boneka Gemoy, Dapatkan Bonus Spesial!
            </h3>
            <p className="text-white/95 text-xs sm:text-sm font-medium leading-relaxed">
              Dapatkan bonus langsung gantungan kunci beruang/bunny premium untuk setiap pembelian minimal 2 boneka di official store Shopee kami.
            </p>
          </div>

          <div className="shrink-0 z-10 w-full md:w-auto">
            <a
              href="https://shopee.co.id/simoengil"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full md:w-auto text-center py-4 px-8 bg-white hover:bg-[#FFF8F0] text-[#FF8FB1] font-black rounded-2xl shadow-md transition-all hover:scale-[1.03] active:scale-95 duration-200 cursor-pointer"
            >
              <span>Belanja di Shopee & Claim Bonus</span>
              <ShoppingBag className="w-4 h-4 text-[#FF8FB1]" />
            </a>
          </div>
        </div>
      </section>

        {/* FOOTER */}
        <SiteFooter showCloudDivider={false} />


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
      
      {/* LIVE CHAT */}


      {/* TRACKING MODAL */}
      <CartCelebration
        trigger={celebrateTrigger}
        productImage={celebrateProductImage}
        cartIconRef={drawerCartIconRef}
        onComplete={() => {
          setCelebrateTrigger(false);
          if (window.innerWidth < 768) {
            router.push("/cart");
          } else {
            setIsWishlistOpen(true);
          }
        }}
      />

      <OrderTrackingModal isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} />

      {/* AUTH MODAL */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </main>
    </div>
  );
}

