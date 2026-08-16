'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  ArrowRight,
  MapPin, 
  Truck, 
  CreditCard, 
  ShoppingBag, 
  ShieldCheck, 
  Sparkles, 
  Smile, 
  Info,
  Check,
  CheckCircle,
  QrCode,
  Landmark,
  Plus,
  Minus,
  AlertCircle
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { PRODUCTS, Product, CartItem } from '@/data/products';
import { CourierResult } from '@/lib/biteship';
import confetti from 'canvas-confetti';
import { useSiteSettings } from '@/context/SiteSettingsContext';

const steps = [
  { label: "Pilih Boneka", short: "Pilih" },
  { label: "Keranjang", short: "Keranjang" },
  { label: "Alamat & Ongkir", short: "Alamat" },
  { label: "Pembayaran", short: "Bayar" },
];

function CrossPatch({ className }: { className?: string }) {
  return (
    <div
      className={`relative w-9 h-9 bg-[#FFF5F0] rounded-lg border border-[#E8B37D]/30 shadow-sm opacity-80 ${className || ""}`}
    >
      <svg className="absolute inset-0 w-full h-full text-[#D48C70]/50" viewBox="0 0 40 40">
        <path d="M4 4 L8 8 M8 4 L4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M32 4 L36 8 M36 4 L32 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4 32 L8 36 M8 32 L4 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M32 32 L36 36 M36 32 L32 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="relative w-full max-w-2xl mx-auto pt-2 pb-8 sm:pb-10">
      <svg
        className="absolute top-[1.5rem] left-[6%] right-[6%] w-auto h-3 z-0 pointer-events-none"
        viewBox="0 0 100 12"
        preserveAspectRatio="none"
      >
        <path
          d="M 12.5 6 L 37.5 6"
          fill="none"
          stroke="#FF8FB1"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 37.5 6 L 87.5 6"
          fill="none"
          stroke="#D48C70"
          strokeWidth="2.5"
          strokeDasharray="5 4"
          strokeLinecap="round"
        />
      </svg>

      <div className="grid grid-cols-4 relative z-10">
        {steps.map((step, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;
          return (
            <div key={step.label} className="flex flex-col items-center gap-1.5 sm:gap-2">
              <div
                className={`rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isDone
                    ? "w-8 h-8 sm:w-10 sm:h-10 bg-[#FF8FB1] border-[#FF8FB1] text-white shadow-[0_4px_12px_rgba(255,143,177,0.4)]"
                    : isActive
                      ? "w-11 h-11 sm:w-12 sm:h-12 bg-[#D48C70] border-[#D48C70] text-white shadow-[0_6px_18px_rgba(212,140,112,0.45)] ring-4 ring-[#D48C70]/15 scale-110"
                      : "w-8 h-8 sm:w-10 sm:h-10 bg-white border-[#E8B37D]/50 text-[#D48C70]"
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                ) : (
                  <span className="font-black text-xs sm:text-sm">{i + 1}</span>
                )}
              </div>

              {isActive && (
                <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-[#D48C70] -mt-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3 L12 9 M18 3 L12 9 M12 9 L12 14" stroke="#D48C70" />
                  <path d="M9 9 L15 9" stroke="#D48C70" />
                  <path d="M9 14 L15 14" stroke="#D48C70" strokeDasharray="2 2" />
                </svg>
              )}

              <span
                className={`text-[9px] sm:text-xs text-center leading-tight ${
                  isActive
                    ? "font-black text-[#D48C70]"
                    : isDone
                      ? "font-bold text-[#FF8FB1]"
                      : "font-semibold text-slate-400"
                }`}
              >
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.short}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { settings } = useSiteSettings();
  
  const productId = searchParams.get('product_id');
  const initialVariant = searchParams.get('variant');
  const initialVariantType = searchParams.get('type');
  const isCartMode = searchParams.get('mode') === 'cart';

  // Core states
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedVariantSize, setSelectedVariantSize] = useState<string | null>(initialVariant);
  const [selectedVariantType, setSelectedVariantType] = useState<string | null>(initialVariantType);
  const [quantity, setQuantity] = useState(1);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Shipping form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [destinationKeyword, setDestinationKeyword] = useState('');
  const [destinations, setDestinations] = useState<any[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

  // Courier/Shipping calculation states
  const [shippingCosts, setShippingCosts] = useState<any[]>([]);
  const [isLoadingCosts, setIsLoadingCosts] = useState(false);
  const [selectedShippingOption, setSelectedShippingOption] = useState<any | null>(null);
  const [isUsingMockShipping, setIsUsingMockShipping] = useState(false);
  
  // Checkout states
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'va'>('qris');
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [placedOrderInfo, setPlacedOrderInfo] = useState<any>(null);

  // 1. Auth check
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/cart');
      } else {
        setUser(session.user);
        setName(session.user.user_metadata?.full_name || '');
        setIsCheckingAuth(false);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setName(session.user.user_metadata?.full_name || '');
        setIsCheckingAuth(false);
      } else {
        setUser(null);
        router.push('/?auth=true');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Fetch Product Info (single product mode) or load cart items
  useEffect(() => {
    if (isCartMode) {
      // Cart mode: load all items from localStorage
      setIsLoadingProduct(true);
      try {
        const savedCart = localStorage.getItem('simoengil_cart');
        if (savedCart) {
          const parsed: CartItem[] = JSON.parse(savedCart);
          if (parsed.length > 0) {
            setCartItems(parsed);
            // Set the first item as the "primary" product for weight/shipping compatibility
            setProduct(parsed[0]);
          }
        }
      } catch (e) {
        console.error('Failed to load cart for checkout', e);
      } finally {
        setIsLoadingProduct(false);
      }
      return;
    }

    if (!productId) return;
    
    const fetchProduct = async () => {
      setIsLoadingProduct(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (!error && data) {
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
            shopeeLink: data.shopee_link || data.shopeeLink || '',
            // Removed tokopedia, lazada, tiktok links
            specifications: specs,
            variants: data.variants || []
          };
          setProduct(mappedProduct);
          // Set initial variant size if not provided
          if (!selectedVariantSize && mappedProduct.variants && mappedProduct.variants.length > 0) {
            setSelectedVariantSize(mappedProduct.variants[0].size);
          }
        } else {
          // Fallback to local
          const localProd = PRODUCTS.find(p => p.id === productId);
          if (localProd) {
            setProduct(localProd);
            if (!selectedVariantSize && localProd.variants && localProd.variants.length > 0) {
              setSelectedVariantSize(localProd.variants[0].size);
            }
          }
        }
      } catch (err) {
        console.error('Error loading product:', err);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [productId, isCartMode]);

  // 3. Search destination hook
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (destinationKeyword.length >= 3 && !selectedDestination) {
        setIsSearchingDestination(true);
        fetch(`/api/biteship/search?keyword=${encodeURIComponent(destinationKeyword)}`)
          .then(res => res.json())
          .then(data => {
            if (data.status === 'success') {
              setDestinations(data.data);
              setShowDestinationDropdown(true);
            }
          })
          .catch(e => console.error(e))
          .finally(() => setIsSearchingDestination(false));
      } else {
        setDestinations([]);
        setShowDestinationDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [destinationKeyword, selectedDestination]);

  // 5. Estimate Product Weight
  const estimateItemWeight = (name: string, size: string, qty: number): number => {
    const nameLower = name.toLowerCase();
    const sizeLower = size?.toLowerCase() || '';

    let baseWeight = 1000; // default 1kg

    if (nameLower.includes('gantungan') || nameLower.includes('keychain') || nameLower.includes('mini')) {
      baseWeight = 150;
    } else if (sizeLower.includes('jumbo') || sizeLower.includes('100cm') || sizeLower.includes('80cm')) {
      baseWeight = 2500;
    } else if (sizeLower.includes('medium') || sizeLower.includes('40cm') || sizeLower.includes('35cm')) {
      baseWeight = 1000;
    } else if (sizeLower.includes('squishy') || sizeLower.includes('30cm')) {
      baseWeight = 700;
    }

    return baseWeight * qty;
  };

  const calculateWeightGrams = (): number => {
    if (isCartMode && cartItems.length > 0) {
      return cartItems.reduce((total, item) => total + estimateItemWeight(item.name, item.selectedVariantSize || '', item.quantity), 0);
    }
    if (!product) return 1000;
    return estimateItemWeight(product.name, selectedVariantSize || '', quantity);
  };

  // 6. Calculate shipping fees when destination is selected
  useEffect(() => {
    if (!selectedDestination) {
      setShippingCosts([]);
      setSelectedShippingOption(null);
      setIsUsingMockShipping(false);
      return;
    }

    const fetchCosts = async () => {
      setIsLoadingCosts(true);
      setSelectedShippingOption(null);
      setIsUsingMockShipping(false);
      const totalWeight = calculateWeightGrams();

      try {
        const res = await fetch('/api/biteship/cost', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destinationId: selectedDestination.id,
            weight: totalWeight
          })
        });

        const json = await res.json();
        const options: any[] = [];
        
        if (json.status === 'success' && Array.isArray(json.data)) {
          const hasMock = json.data.some((courier: any) => courier.isMock);
          setIsUsingMockShipping(hasMock);

          json.data.forEach((courier: any) => {
            courier.costs.forEach((service: any) => {
              options.push({
                courierCode: courier.code,
                courierName: courier.name,
                service: service.service,
                description: service.description,
                cost: service.cost,
                etd: service.etd,
                id: `${courier.code}-${service.service}`,
                isMock: courier.isMock
              });
            });
          });

          // Sort options by cheapest cost
          options.sort((a, b) => a.cost - b.cost);
          setShippingCosts(options);
          
          if (options.length > 0) {
            setSelectedShippingOption(options[0]);
          }
        } else {
           setShippingCosts([]);
           setIsUsingMockShipping(false);
        }
      } catch (e) {
        console.error('Failed to calculate shipping fees:', e);
        setIsUsingMockShipping(false);
      } finally {
        setIsLoadingCosts(false);
      }
    };

    fetchCosts();
  }, [selectedDestination, quantity, selectedVariantSize]);

  // Pricing calculations
  const getProductPrice = (): number => {
    if (!product) return 0;
    
    // Find variant price
    if (selectedVariantSize && product.variants && product.variants.length > 0) {
      const variant = product.variants.find(v => v.size === selectedVariantSize);
      if (variant && variant.price) {
        return variant.price;
      }
    }
    return product.price;
  };

  const productPrice = getProductPrice();
  const subtotal = isCartMode
    ? cartItems.reduce((acc, item) => acc + (item.selectedPrice * item.quantity), 0)
    : productPrice * quantity;
  
  const isJavaOrBali = selectedDestination?.label?.match(/jawa|bali|banten|jakarta|yogyakarta/i);
  const isFreeShippingEligible = subtotal >= 400000 && isJavaOrBali;
  
  const rawShippingFee = selectedShippingOption ? selectedShippingOption.cost : 0;
  const shippingDiscount = (isFreeShippingEligible && rawShippingFee > 0) ? rawShippingFee : 0;
  const shippingFee = rawShippingFee - shippingDiscount;

  const grandTotal = subtotal + shippingFee;

  const totalCartQuantity = isCartMode
    ? cartItems.reduce((acc, item) => acc + item.quantity, 0)
    : quantity;

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // 7. Place Order and Trigger Midtrans Snap
  const handlePayment = async () => {
    if (!user) {
      router.push('/?auth=true');
      return;
    }

    if (!name || !phone || !detailAddress || !selectedDestination || !postalCode) {
      alert('Silakan lengkapi data alamat pengiriman Anda!');
      return;
    }

    if (!selectedShippingOption) {
      alert('Silakan pilih opsi kurir pengiriman terlebih dahulu!');
      return;
    }

    setIsSubmitting(true);

    try {
      const cityName = selectedDestination.label;
      const selectedProvince = cityName.split(',').length > 2 ? cityName.split(',')[2].trim() : '';

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const sessionId = localStorage.getItem('simoengil_chat_session');

      const orderItems = isCartMode
        ? cartItems.map(item => ({
            id: item.id,
            name: item.name,
            size: item.selectedVariantSize || null,
            type: item.selectedVariantType || null,
            price: item.selectedPrice,
            quantity: item.quantity,
            image: item.image
          }))
        : [
            {
              id: product?.id,
              name: product?.name,
              size: selectedVariantSize,
              price: productPrice,
              quantity: quantity,
              image: product?.image
            }
          ];

      const orderPayload = {
        items: orderItems,
        shippingAddress: {
          name: name,
          phone: phone,
          province: selectedProvince,
          city: cityName,
          detailAddress: detailAddress,
          postalCode: postalCode
        },
        courier: {
          code: selectedShippingOption.courierCode,
          name: selectedShippingOption.courierName,
          service: selectedShippingOption.service,
          cost: shippingFee
        },
        totalPrice: grandTotal,
        sessionId: sessionId
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      const json = await res.json();

      if (json.status !== 'success') {
        throw new Error(json.message || 'Gagal membuat transaksi checkout.');
      }

      const snapToken = json.data.token;
      const orderId = json.data.orderId;

      // Check if it is a simulated checkout (when Midtrans credentials are not configure/empty)
      if (json.data.isSimulation) {
        setPlacedOrderId(orderId);
        if (orderId) localStorage.setItem('simoengil_chat_session', orderId);
        setPlacedOrderInfo({
          ...orderPayload,
          orderId: orderId,
          midtransToken: snapToken,
          isSimulation: true
        });
        setOrderSuccess(true);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        setIsSubmitting(false);
        return;
      }

      // Open Midtrans Snap Popup Window
      if ((window as any).snap) {
        (window as any).snap.pay(snapToken, {
          onSuccess: function(result: any) {
            setPlacedOrderId(orderId);
            if (orderId) localStorage.setItem('simoengil_chat_session', orderId);
            setPlacedOrderInfo({
              ...orderPayload,
              orderId: orderId,
              midtransToken: snapToken,
              resultDetails: result
            });
            setOrderSuccess(true);
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 }
            });
          },
          onPending: function(result: any) {
            setPlacedOrderId(orderId);
            if (orderId) localStorage.setItem('simoengil_chat_session', orderId);
            setPlacedOrderInfo({
              ...orderPayload,
              orderId: orderId,
              midtransToken: snapToken,
              isPending: true,
              resultDetails: result
            });
            setOrderSuccess(true);
          },
          onError: function(result: any) {
            alert('Pembayaran ditolak atau terjadi kegagalan. Silakan coba lagi.');
            console.error('Midtrans error:', result);
          },
          onClose: function() {
            alert('Anda menutup popup pembayaran sebelum menyelesaikan transaksi.');
          }
        });
      } else {
        // Fallback if Snap script failed to load (open redirect URL)
        if (json.data.redirectUrl) {
          window.open(json.data.redirectUrl, '_blank');
        } else {
          alert('Snap SDK Midtrans tidak terdeteksi. Silakan muat ulang halaman.');
        }
      }

    } catch (e: any) {
      alert(e.message || 'Gagal memproses pembayaran. Silakan periksa koneksi Anda.');
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingAuth || isLoadingProduct) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#FCE6CB] border-t-[#D48C70] rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-500 mt-4">Memuat detail boneka gemoy...</p>
      </div>
    );
  }

  if (!product && !(isCartMode && cartItems.length > 0)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-[#FFFDFB] rounded-[2rem] p-8 max-w-md w-full text-center border-2 border-[#FCE6CB] shadow-[0_10px_35px_rgba(212,140,112,0.1)] space-y-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 rotate-12"><CrossPatch /></div>
          <div className="w-20 h-20 rounded-full bg-[#FFF0F3] border border-[#FFB6C8]/40 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-9 h-9 text-[#D48C70]" />
          </div>
          <h1 className="font-serif text-xl font-bold text-[#2A1F1A]">{isCartMode ? 'Keranjang Kosong' : 'Produk Tidak Ditemukan'}</h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">{isCartMode ? 'Keranjang belanja Anda kosong. Tambahkan boneka ke keranjang terlebih dahulu.' : 'Pilih boneka dari katalog terlebih dahulu sebelum membeli.'}</p>
          <Link href="/products" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#D48C70] hover:bg-[#C47A5C] text-white rounded-2xl font-black text-sm shadow-[0_6px_18px_rgba(212,140,112,0.35)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF8FB1] focus-visible:ring-offset-2">
            <span>Kembali ke Toko</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // 8. Render Success State
  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="bg-[#FFFDFB] rounded-[2.5rem] p-8 sm:p-12 max-w-2xl w-full text-center border-2 border-[#FCE6CB] shadow-[0_10px_35px_rgba(212,140,112,0.1)] space-y-8 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="h-2 w-full absolute top-0 left-0 bg-gradient-to-r from-[#FF8FB1] via-[#FFB6C8] to-[#E8B37D]" />
          <div className="absolute top-4 right-4 rotate-12"><CrossPatch /></div>
          
          <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1F1A] tracking-tight">Pesanan Berhasil Dibuat!</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {placedOrderInfo?.isPending 
                ? 'Transaksi Anda sedang menunggu pembayaran di Midtrans.'
                : 'Selamat! Boneka Anda siap dipersiapkan untuk diadopsi dan dikirim.'}
            </p>
          </div>

          {/* Order Summary Details */}
          <div className="bg-[#FFF8F3] rounded-3xl p-6 border border-[#E8B37D]/20 text-left space-y-4">
            <div className="flex justify-between items-center pb-3 border-b-2 border-[#E8B37D]/15 text-xs font-black text-[#D48C70] uppercase tracking-widest">
              <span>ID Pesanan</span>
              <span className="text-[#2A1F1A] bg-white px-3 py-1 rounded-full border border-[#FCE6CB] select-all font-mono normal-case tracking-normal">
                {placedOrderId}
              </span>
            </div>

            {isCartMode && cartItems.length > 0 ? (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.cartItemId} className="flex items-start gap-4 py-1">
                    <div className="w-16 h-16 rounded-xl bg-white border border-[#FCE6CB] overflow-hidden shrink-0">
                      <img src={item.image} referrerPolicy="no-referrer" alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-[#2A1F1A] truncate">{item.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Ukuran: {item.selectedVariantSize || 'Standar'} • Jumlah: {item.quantity} pcs
                      </p>
                      <p className="text-xs font-black text-[#D48C70] mt-1">{formatIDR(item.selectedPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : product && (
              <div className="flex items-start gap-4 py-1">
                <div className="w-16 h-16 rounded-xl bg-white border border-[#FCE6CB] overflow-hidden shrink-0">
                  <img src={product.image} referrerPolicy="no-referrer" alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-[#2A1F1A] truncate">{product.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ukuran: {selectedVariantSize || 'Standar'} • Jumlah: {quantity} pcs
                  </p>
                  <p className="text-xs font-black text-[#D48C70] mt-1">{formatIDR(productPrice)}</p>
                </div>
              </div>
            )}

            <div className="pt-3 border-t-2 border-[#E8B37D]/15 space-y-2 text-xs font-medium text-[#4A3B32]">
              <div className="flex justify-between">
                <span>Alamat Pengiriman:</span>
                <span className="font-bold text-[#2A1F1A] text-right max-w-xs truncate">
                  {placedOrderInfo?.shippingAddress?.name} ({placedOrderInfo?.shippingAddress?.phone})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Kota & Detail:</span>
                <span className="font-bold text-[#2A1F1A] text-right max-w-xs truncate">
                  {placedOrderInfo?.shippingAddress?.city}, {placedOrderInfo?.shippingAddress?.detailAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Kurir Ekspedisi:</span>
                <span className="font-bold text-[#2A1F1A]">
                  {placedOrderInfo?.courier?.name?.split(' ')[0]} ({placedOrderInfo?.courier?.service})
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-[#E8B37D]/15 text-sm font-black text-[#2A1F1A]">
                <span>Total Dibayar:</span>
                <span className="text-[#D48C70]">{formatIDR(grandTotal)}</span>
              </div>
            </div>
          </div>

          {placedOrderInfo?.isSimulation && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3 text-amber-800 text-left text-xs">
              <Info className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-extrabold block">Checkout Mode Simulasi</span>
                <p className="leading-relaxed font-medium">
                  Kredensial Midtrans Server Key belum dimasukkan di file `.env.local` server, sehingga pembayaran dijalankan dalam mode demo otomatis.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products" className="flex-1 py-4 bg-[#D48C70] hover:bg-[#C47A5C] text-white rounded-2xl font-black text-xs sm:text-sm text-center shadow-[0_6px_18px_rgba(212,140,112,0.35)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF8FB1] focus-visible:ring-offset-2">
              Belanja Lagi
            </Link>
            <a 
              href={`https://wa.me/${settings.whatsappNumber}?text=Halo%20Admin,%20saya%20sudah%20melakukan%20pembayaran%20untuk%20Order%20ID:%20${placedOrderId}.%20Tolong%20segera%20diproses%20ya!%20Terima%20kasih.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-4 border-2 border-[#D48C70] text-[#D48C70] hover:bg-[#FFF5F0] rounded-2xl font-black text-xs sm:text-sm text-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF8FB1] focus-visible:ring-offset-2"
            >
              Konfirmasi WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-32 sm:pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 rounded-xl bg-[#FFFDFB] border border-[#FCE6CB] text-[#D48C70] hover:bg-[#FFF5F0] hover:border-[#D48C70]/40 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF8FB1] focus-visible:ring-offset-2"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FFF0F3] border border-[#FFB6C8]/60 text-[#FF8FB1] shadow-sm">
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl text-[#2A1F1A] font-bold leading-tight">
                  Checkout Teman Peluk
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {isCartMode
                  ? `Tinggal satu langkah lagi untuk mengadopsi ${totalCartQuantity} boneka kesayanganmu!`
                  : `Tinggal satu langkah lagi untuk mengadopsi ${product?.name} kesayanganmu!`
                }
              </p>
            </div>
          </div>
        </div>

        <StepIndicator currentStep={2} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Side: Form entry */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Shipping Form Card */}
            <div className="bg-[#FFFDFB] rounded-[2rem] p-6 sm:p-8 border-2 border-[#FCE6CB]/80 shadow-[0_6px_22px_rgba(212,140,112,0.08)] space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-[#E8B37D]/20">
                <div className="p-2 rounded-xl bg-[#FFF5F0] border border-[#E8B37D]/25 text-[#D48C70] shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2A1F1A]">Alamat Pengiriman</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#D48C70] uppercase tracking-wider block">
                    Nama Penerima
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Artha Gemoy"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FFF8F3] border border-[#FCE6CB] rounded-2xl text-xs sm:text-sm font-medium text-[#2A1F1A] placeholder:text-[#C4A58C] focus:outline-none focus:bg-white focus:border-[#D48C70]/60 focus:ring-2 focus:ring-[#E8B37D]/25 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#D48C70] uppercase tracking-wider block">
                    No. Telepon / WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FFF8F3] border border-[#FCE6CB] rounded-2xl text-xs sm:text-sm font-medium text-[#2A1F1A] placeholder:text-[#C4A58C] focus:outline-none focus:bg-white focus:border-[#D48C70]/60 focus:ring-2 focus:ring-[#E8B37D]/25 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-black text-[#D48C70] uppercase tracking-wider block">
                  Cari Kecamatan / Kota
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ketik nama kecamatan atau kota..."
                    value={selectedDestination ? selectedDestination.label : destinationKeyword}
                    onChange={(e) => {
                      setDestinationKeyword(e.target.value);
                      setSelectedDestination(null);
                    }}
                    className="w-full px-4 py-2.5 bg-[#FFF8F3] border border-[#FCE6CB] rounded-2xl text-xs sm:text-sm font-medium text-[#2A1F1A] placeholder:text-[#C4A58C] focus:outline-none focus:bg-white focus:border-[#D48C70]/60 focus:ring-2 focus:ring-[#E8B37D]/25 transition-all"
                  />
                  {isSearchingDestination && (
                    <div className="absolute right-3.5 top-3 w-4.5 h-4.5 border-2 border-[#D48C70] border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                
                {showDestinationDropdown && destinations.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-[#FFFDFB] border border-[#FCE6CB] rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {destinations.map((dest) => (
                      <div
                        key={dest.id}
                        className="px-4 py-3 hover:bg-[#FFF5F0] cursor-pointer text-xs font-medium border-b border-[#FCE6CB]/60 last:border-0 text-[#4A3B32]"
                        onClick={() => {
                          setSelectedDestination(dest);
                          setDestinationKeyword('');
                          setShowDestinationDropdown(false);
                        }}
                      >
                        {dest.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#D48C70] uppercase tracking-wider block">
                  Alamat Lengkap (Jalan, RT/RW, Kecamatan, Perumahan)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Jl. Mawar Indah Blok B4 No. 12, RT 03/RW 04, Kel. Kemang, Kec. Kebayoran Baru"
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FFF8F3] border border-[#FCE6CB] rounded-2xl text-xs sm:text-sm font-medium text-[#2A1F1A] placeholder:text-[#C4A58C] focus:outline-none focus:bg-white focus:border-[#D48C70]/60 focus:ring-2 focus:ring-[#E8B37D]/25 transition-all"
                />
              </div>

              <div className="w-1/2 space-y-1.5">
                <label className="text-[10px] font-black text-[#D48C70] uppercase tracking-wider block">
                  Kode Pos
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="12345"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-2.5 bg-[#FFF8F3] border border-[#FCE6CB] rounded-2xl text-xs sm:text-sm font-medium text-[#2A1F1A] placeholder:text-[#C4A58C] focus:outline-none focus:bg-white focus:border-[#D48C70]/60 focus:ring-2 focus:ring-[#E8B37D]/25 transition-all"
                />
              </div>
            </div>

            {/* Courier selection section */}
            <div className="bg-[#FFFDFB] rounded-[2rem] p-6 sm:p-8 border-2 border-[#FCE6CB]/80 shadow-[0_6px_22px_rgba(212,140,112,0.08)] space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-[#E8B37D]/20">
                <div className="p-2 rounded-xl bg-[#FFF5F0] border border-[#E8B37D]/25 text-[#D48C70] shadow-sm">
                  <Truck className="w-5 h-5" />
                </div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2A1F1A]">Opsi Pengiriman</h2>
              </div>

              {isUsingMockShipping && (
                <div className="bg-[#FFF8F3] border border-[#E8B37D]/35 rounded-2xl p-4 flex gap-3 text-slate-700 animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="w-5 h-5 text-[#E8B37D] shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <span className="font-extrabold text-[#E8B37D] block">Catatan Penting (Mode Simulasi)</span>
                    <p className="leading-relaxed font-semibold text-slate-600">
                      Biteship API Key Anda saat ini tidak memiliki saldo yang cukup (balance 0) untuk memanggil API rates secara live.
                    </p>
                    <p className="leading-relaxed text-slate-500 font-medium">
                      Sistem secara otomatis mengaktifkan <strong>tarif simulasi (JNE, SiCepat, J&T)</strong> agar transaksi di toko Anda tetap berjalan dengan lancar tanpa hambatan!
                    </p>
                    <p className="text-[10px] text-[#E8B37D] font-extrabold pt-1">
                      Silakan lakukan top up saldo di dashboard Biteship Anda untuk mengaktifkan tarif asli secara otomatis.
                    </p>
                  </div>
                </div>
              )}

              {!selectedDestination ? (
                <div className="bg-[#FFF8F3] rounded-2xl p-6 text-center border border-dashed border-[#E8B37D]/40 text-xs sm:text-sm text-[#8A6F5F] font-medium">
                  Pilih Kecamatan/Kota terlebih dahulu untuk menghitung ongkos kirim.
                </div>
              ) : isLoadingCosts ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="w-8 h-8 border-3 border-[#E8B37D] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-500 font-bold">Mengkalkulasi ongkos kirim POS, JNE, dan TIKI...</p>
                </div>
              ) : shippingCosts.length === 0 ? (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl text-xs font-semibold">
                  Gagal memuat ongkos kirim kurir. Silakan pilih kembali kota tujuan Anda.
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-[#D48C70] uppercase tracking-widest mb-1.5 block">Opsi Kurir Tersedia:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {shippingCosts.map((option, index) => {
                      const isSelected = selectedShippingOption?.id === option.id;
                      const isCheapest = index === 0;
                      const isFastest = option.etd.includes('1') && !option.etd.includes('10');

                      return (
                        <label
                          key={option.id}
                          className={`border-2 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
                            isSelected
                              ? 'bg-[#FFF0E5] border-[#D48C70]/60 shadow-[0_6px_18px_rgba(212,140,112,0.12)]'
                              : 'bg-[#FFFDFB] border-[#FCE6CB] hover:bg-[#FFF5F0] hover:border-[#E8B37D]/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="shippingOption"
                              className="mt-1 accent-[#D48C70]"
                              checked={isSelected}
                              onChange={() => setSelectedShippingOption(option)}
                            />
                            <div className="min-w-0">
                              <div className="flex flex-wrap gap-1 mb-1">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wide ${
                                  isSelected
                                    ? 'bg-[#D48C70] text-white border-[#D48C70]'
                                    : 'bg-[#FFF0E5] text-[#D48C70] border-[#E8B37D]/30'
                                }`}>
                                  {option.courierCode.toUpperCase()}
                                </span>
                                {isCheapest && (
                                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wide">
                                    Paling Hemat
                                  </span>
                                )}
                                {isFastest && !isCheapest && (
                                  <span className="text-[10px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wide">
                                    Paling Cepat
                                  </span>
                                )}
                              </div>
                              <span className="text-xs font-black text-[#2A1F1A] block">
                                {option.service}
                              </span>
                              <span className="text-[10px] text-[#8A6F5F] font-medium block truncate max-w-[200px]">
                                {option.description}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-xs font-extrabold block ${isSelected ? 'text-[#D48C70]' : 'text-[#FF8FB1]'}`}>
                              {formatIDR(option.cost)}
                            </span>
                            <span className="text-[9px] text-[#8A6F5F] font-medium block">
                              Estimasi: {option.etd.toLowerCase().replace('hari', '')} Hari
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method simulation */}
            <div className="bg-[#FFFDFB] rounded-[2rem] p-6 sm:p-8 border-2 border-[#FCE6CB]/80 shadow-[0_6px_22px_rgba(212,140,112,0.08)] space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-[#E8B37D]/20">
                <div className="p-2 rounded-xl bg-[#FFF5F0] border border-[#E8B37D]/25 text-[#D48C70] shadow-sm">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2A1F1A]">Metode Pembayaran</h2>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-[#8A6F5F] uppercase tracking-wider">Pilih Preferensi Pembayaran untuk Panduan:</p>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* QRIS */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-4 border-2 rounded-2xl text-left cursor-pointer transition-all duration-300 flex items-center justify-between gap-3 ${
                      paymentMethod === 'qris'
                        ? 'bg-[#FFF0E5] border-[#D48C70]/60 shadow-[0_6px_18px_rgba(212,140,112,0.12)]'
                        : 'bg-[#FFFDFB] border-[#FCE6CB] hover:bg-[#FFF5F0] hover:border-[#E8B37D]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 transition-all ${
                        paymentMethod === 'qris'
                          ? 'bg-[#D48C70] text-white border-[#D48C70] shadow-[0_4px_12px_rgba(212,140,112,0.35)]'
                          : 'bg-[#FFF0F3] text-[#FF8FB1] border-[#FFB6C8]/50'
                      }`}>
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-black text-[#2A1F1A]">QRIS / E-Wallet</h4>
                        <p className="text-[10px] text-[#8A6F5F] mt-1 font-medium">GoPay, ShopeePay, OVO, Dana</p>
                      </div>
                    </div>
                    <CheckCircle className={`w-5 h-5 shrink-0 ${paymentMethod === 'qris' ? 'text-[#D48C70]' : 'text-[#E8B37D]/30'}`} />
                  </button>

                  {/* Virtual Account */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('va')}
                    className={`p-4 border-2 rounded-2xl text-left cursor-pointer transition-all duration-300 flex items-center justify-between gap-3 ${
                      paymentMethod === 'va'
                        ? 'bg-[#FFF0E5] border-[#D48C70]/60 shadow-[0_6px_18px_rgba(212,140,112,0.12)]'
                        : 'bg-[#FFFDFB] border-[#FCE6CB] hover:bg-[#FFF5F0] hover:border-[#E8B37D]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 transition-all ${
                        paymentMethod === 'va'
                          ? 'bg-[#D48C70] text-white border-[#D48C70] shadow-[0_4px_12px_rgba(212,140,112,0.35)]'
                          : 'bg-[#FFF0F3] text-[#FF8FB1] border-[#FFB6C8]/50'
                      }`}>
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-black text-[#2A1F1A]">Virtual Account</h4>
                        <p className="text-[10px] text-[#8A6F5F] mt-1 font-medium">BCA, Mandiri, BNI, BRI, Permata</p>
                      </div>
                    </div>
                    <CheckCircle className={`w-5 h-5 shrink-0 ${paymentMethod === 'va' ? 'text-[#D48C70]' : 'text-[#E8B37D]/30'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Cart Summary */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            
            <div className="bg-[#FFF0E5] p-5 sm:p-7 rounded-[2rem] border-2 border-[#E8B37D]/40 shadow-[0_10px_35px_rgba(212,140,112,0.14)] relative overflow-hidden">
              <div className="absolute top-4 right-4 rotate-12"><CrossPatch /></div>
              <div className="absolute bottom-4 left-4 -rotate-12"><CrossPatch /></div>

              <h3 className="font-serif text-lg font-bold text-[#2A1F1A] pb-4 mb-4 border-b-2 border-[#E8B37D]/25 flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FFFDFB] border border-[#E8B37D]/25 text-[#D48C70] shadow-sm">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                Ringkasan Pesanan
              </h3>

              {/* Product description card(s) */}
              {isCartMode && cartItems.length > 0 ? (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.cartItemId} className="flex gap-4 p-3.5 bg-[#FFFDFB] rounded-2xl border border-[#FCE6CB] shadow-sm">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-[#FCE6CB] shrink-0 p-1 flex items-center justify-center">
                        <img src={item.image} referrerPolicy="no-referrer" alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-[#2A1F1A] truncate">{item.name}</h4>
                          {(item.selectedVariantType || item.selectedVariantSize) && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.selectedVariantType && (
                                <span className="text-[9px] font-black text-[#D48C70] bg-[#FFF5F0] px-2 py-0.5 rounded-lg border border-[#E8B37D]/25">
                                  {item.selectedVariantType}
                                </span>
                              )}
                              {item.selectedVariantSize && (
                                <span className="text-[9px] font-black text-[#D48C70] bg-[#FFF5F0] px-2 py-0.5 rounded-lg border border-[#E8B37D]/25">
                                  Ukuran: {item.selectedVariantSize}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-[#8A6F5F] font-semibold">{item.quantity} pcs</span>
                          <span className="text-xs font-black text-[#2A1F1A]">{formatIDR(item.selectedPrice * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : product && (
                <div className="flex gap-4 p-3.5 bg-[#FFFDFB] rounded-2xl border border-[#FCE6CB] shadow-sm">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-[#FCE6CB] shrink-0 p-1 flex items-center justify-center">
                    <img src={product.image} referrerPolicy="no-referrer" alt={product.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#2A1F1A] truncate">{product.name}</h4>
                      {(selectedVariantType || selectedVariantSize) && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedVariantType && (
                            <span className="text-[9px] font-black text-[#D48C70] bg-[#FFF5F0] px-2 py-0.5 rounded-lg border border-[#E8B37D]/25">
                              {selectedVariantType}
                            </span>
                          )}
                          {selectedVariantSize && (
                            <span className="text-[9px] font-black text-[#D48C70] bg-[#FFF5F0] px-2 py-0.5 rounded-lg border border-[#E8B37D]/25">
                              Ukuran: {selectedVariantSize}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Quantity adjuster */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-[#FFF8F3] border border-[#FCE6CB] rounded-xl p-0.5 shadow-xs gap-0.5">
                        <button
                          type="button"
                          disabled={quantity <= 1}
                          onClick={() => setQuantity(quantity - 1)}
                          className="w-6 h-6 bg-amber-100/80 hover:bg-rose-500 text-amber-800 hover:text-white rounded-lg font-bold text-xs flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:hover:bg-amber-100/80 disabled:hover:text-amber-800 disabled:cursor-not-allowed transition-all active:scale-90"
                          title="Kurangi jumlah"
                        >
                          <Minus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-[#2A1F1A]">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-6 h-6 bg-gradient-to-br from-[#FF8FB1] to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-bold text-xs flex items-center justify-center cursor-pointer transition-all active:scale-90 shadow-sm shadow-pink-400/30"
                          title="Tambah jumlah"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                      <span className="text-xs font-black text-[#2A1F1A]">{formatIDR(productPrice)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing Details */}
              <div className="pt-4 mt-4 border-t-2 border-[#E8B37D]/25 space-y-3.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#4A3B32] font-medium">Subtotal Produk</span>
                  <span className="font-bold text-[#2A1F1A]">{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#4A3B32] font-medium flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#D48C70] shrink-0" />
                    Estimasi Biaya Pengiriman
                  </span>
                  {selectedShippingOption ? (
                    <div className="text-right flex flex-col items-end gap-1">
                      {shippingDiscount > 0 ? (
                        <>
                          <span className="line-through text-[#8A6F5F] text-[11px] font-medium">{formatIDR(rawShippingFee)}</span>
                          <span className="font-black text-emerald-600">Gratis!</span>
                        </>
                      ) : (
                        <span className="font-bold text-[#2A1F1A]">{formatIDR(shippingFee)}</span>
                      )}
                    </div>
                  ) : (
                    <span className="font-bold text-[#8A6F5F] text-xs">Pilih Kurir</span>
                  )}
                </div>
                
                <div className="pt-4 border-t-2 border-[#E8B37D]/25 flex justify-between items-center gap-2">
                  <div>
                    <div className="text-xs font-black text-[#4A3B32]">Total Bayar</div>
                    <div className="text-[10px] text-[#8A6F5F] font-medium">
                      {isFreeShippingEligible ? 'gratis ongkir berlaku' : 'termasuk ongkir'}
                    </div>
                  </div>
                  <span className="font-black text-xl sm:text-2xl text-[#D48C70] leading-none">{formatIDR(grandTotal)}</span>
                </div>
              </div>
              
              <div className="bg-[#FFFDFB] border border-[#E8B37D]/25 p-4 rounded-2xl space-y-2 mt-4 text-[10px] text-[#4A3B32] font-medium leading-relaxed">
                <p className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-[#D48C70] shrink-0 mt-0.5" />
                  <span>Ongkir yang tertera adalah <strong>estimasi terbaik</strong> (sudah termasuk margin packing aman bubble wrap tebal).</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Ongkir final akan disesuaikan setelah kami cek berat paket riil. Kami akan konfirmasi ongkir final via WhatsApp maksimal 1x24 jam setelah order jika ada penyesuaian.</span>
                </p>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={handlePayment}
                disabled={isSubmitting || !selectedShippingOption}
                className="w-full py-4 px-5 rounded-2xl bg-[#0F4C5C] hover:bg-[#0B3A46] text-white font-black text-sm transition-all shadow-[0_6px_18px_rgba(15,76,92,0.25)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#FF8FB1] focus-visible:ring-offset-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses Pembayaran...</span>
                  </>
                ) : (
                  <>
                    <span>Bayar Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="pt-2 mt-5 border-t-2 border-[#E8B37D]/25 flex flex-col gap-2.5 text-[10px] font-semibold">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF8FB1] shrink-0" />
                  <span className="text-[#4A3B32] font-bold">Gratis Ongkir untuk pembelian di atas Rp400.000 (Khusus Jawa & Bali)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-[#4A3B32] font-semibold">Transaksi Terenkripsi Aman & Didukung oleh Midtrans</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-[#E8B37D] shrink-0" />
                  <span className="text-[#4A3B32] font-semibold">Garansi Uang Kembali 100% jika Boneka Rusak</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Checkout Bar */}
        <div className="fixed bottom-2 left-2 right-2 z-40 lg:hidden">
          <div className="bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-dashed border-[#E8B37D]/60 rounded-3xl shadow-[0_-10px_35px_rgba(212,140,112,0.25)] p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-black text-[#D48C70] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF8FB1] animate-pulse" />
                Total Bayar
              </div>
              <div className="font-black text-[#4A3B32] text-lg sm:text-xl leading-tight truncate mt-0.5 font-heading">
                {formatIDR(grandTotal)}
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isSubmitting || !selectedShippingOption}
              className="shrink-0 flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl bg-[#4A3B32] hover:bg-[#2A1F1A] text-white font-black text-xs sm:text-sm transition-all duration-200 shadow-md shadow-[#4A3B32]/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF8FB1] focus-visible:ring-offset-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Bayar Sekarang</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          router.push('/?auth=true');
        }}
        onSuccess={() => {
          setIsAuthOpen(false);
        }}
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#FCE6CB] border-t-[#D48C70] rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-500 mt-4">Loading checkout...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
