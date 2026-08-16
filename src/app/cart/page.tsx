"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  RotateCcw,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Check,
  ShieldCheck,
  Truck,
  CheckCircle,
  X,
  Heart,
  MessageSquare,
  User,
  LogIn,
} from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { CartItem } from "@/data/products";
import { lockBodyScroll } from "@/lib/scrollLock";
import { supabase } from "@/lib/supabase";
import AuthModal from "@/components/AuthModal";

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

function EmptyCartArt() {
  return (
    <div className="relative w-28 h-28 mx-auto mb-5">
      <div className="absolute inset-0 rounded-full bg-[#FFE8D6] blur-2xl opacity-70" />
      <svg viewBox="0 0 120 120" className="relative w-full h-full drop-shadow-sm">
        <circle cx="60" cy="62" r="48" fill="#FFFDFB" stroke="#FCE6CB" strokeWidth="2" />
        <circle cx="60" cy="52" r="22" fill="#FFF0E5" stroke="#D48C70" strokeWidth="2" />
        <circle cx="51" cy="46" r="3" fill="#4A3B32" />
        <circle cx="69" cy="46" r="3" fill="#4A3B32" />
        <path d="M54 58 Q60 62 66 58" stroke="#4A3B32" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="60" cy="52" r="8" fill="#FFF0F3" />
        <path d="M60 52 L60 56" stroke="#FF8FB1" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="60" cy="86" rx="16" ry="20" fill="#FFB6C8" />
        <circle cx="51" cy="74" r="5.5" fill="#FFB6C8" />
        <circle cx="69" cy="74" r="5.5" fill="#FFB6C8" />
        <path d="M44 66 Q30 60 34 50 Q38 42 46 48" fill="#FFF0E5" stroke="#D48C70" strokeWidth="1.5" />
        <path d="M76 66 Q90 60 86 50 Q82 42 74 48" fill="#FFF0E5" stroke="#D48C70" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "Batal",
  footerNote,
  icon,
  confirmIcon,
  variant = "danger",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  footerNote: string;
  icon?: React.ReactNode;
  confirmIcon?: React.ReactNode;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    lockBodyScroll(true, "cart-confirm");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lockBodyScroll(false, "cart-confirm");
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const isPrimary = variant === "primary";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#0A0F1D]/45 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="relative bg-[#FFFDFB] rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl border border-[#FCE6CB] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="h-2 w-full bg-gradient-to-r from-[#FF8FB1] via-[#FFB6C8] to-[#E8B37D] shrink-0" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#FFF0F3] hover:bg-[#FFE4EC] text-[#D48C70] hover:text-rose-500 transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-7 sm:p-8 text-center flex flex-col items-center">
          <div className={`relative w-20 h-20 rounded-full border-2 flex items-center justify-center mb-5 ${
            isPrimary 
              ? 'bg-pink-50 border-pink-100 text-[#FF8FB1]' 
              : 'bg-rose-50 border-rose-100 text-rose-500'
          }`}>
            <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
              isPrimary ? 'bg-pink-100/40' : 'bg-rose-100/40'
            }`} />
            <span className="relative z-10">
              {icon || <Trash2 className="w-8 h-8" />}
            </span>
          </div>

          <h3 className="font-serif text-xl font-bold text-[#2A1F1A] tracking-tight">
            {title}
          </h3>

          <div className="text-slate-500 text-xs sm:text-sm mt-2.5 font-medium leading-relaxed max-w-[280px]">
            {message}
          </div>

          <div className="w-full space-y-3 mt-7">
            <button
              onClick={onConfirm}
              className={`w-full py-3.5 text-white rounded-2xl font-black text-xs sm:text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isPrimary
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 shadow-pink-200 hover:shadow-lg focus-visible:ring-pink-300'
                  : 'bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600 shadow-rose-200 hover:shadow-lg focus-visible:ring-rose-300'
              }`}
            >
              {confirmIcon !== undefined ? confirmIcon : <Trash2 className="w-4 h-4" />}
              <span>{confirmLabel}</span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 border border-[#FCE6CB] hover:border-[#E8B37D]/70 text-[#4A3B32] hover:text-[#D48C70] hover:bg-[#FFF5F0] rounded-2xl font-bold text-xs transition-all text-center cursor-pointer active:scale-[0.98]"
            >
              {cancelLabel}
            </button>
          </div>
        </div>

        <div className="py-3 px-6 bg-[#FFF5F0] border-t border-[#FCE6CB] flex items-center justify-center gap-1.5 text-[9px] font-bold text-[#D48C70]">
          <Heart className="w-3.5 h-3.5 fill-[#FF8FB1] text-[#FF8FB1]" />
          <span>{footerNote}</span>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showAuthNoticeModal, setShowAuthNoticeModal] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem("simoengil_cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    } else {
      setCartItems([]);
    }
    setIsLoaded(true);
  };

  useEffect(() => {
    const t = window.setTimeout(loadCart, 0);

    const handleCartUpdate = () => loadCart();
    window.addEventListener("cart_updated", handleCartUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "simoengil_cart") loadCart();
    });

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("cart_updated", handleCartUpdate);
    };
  }, []);

  const updateQuantity = (cartItemId: string, delta: number) => {
    const updated = cartItems
      .map((item) => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter((item): item is CartItem => item !== null);

    setCartItems(updated);
    localStorage.setItem("simoengil_cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cart_updated"));
  };

  const removeItem = (cartItemId: string) => {
    const updated = cartItems.filter((item) => item.cartItemId !== cartItemId);
    setCartItems(updated);
    localStorage.setItem("simoengil_cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cart_updated"));
  };

  const confirmDeleteItem = () => {
    if (!itemToDelete) return;
    removeItem(itemToDelete.cartItemId);
    setItemToDelete(null);
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("simoengil_cart");
    window.dispatchEvent(new Event("cart_updated"));
    setShowClearModal(false);
  };

  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.selectedPrice * item.quantity), 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setShowAuthNoticeModal(true);
    } else {
      router.push("/checkout?mode=cart");
    }
  };

  const checkoutButton = (
    <button
      onClick={handleCheckout}
      className="w-full py-4 px-5 rounded-2xl bg-[#0F4C5C] hover:bg-[#0B3A46] text-white font-black text-sm sm:text-base shadow-[0_6px_18px_rgba(15,76,92,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF8FB1] focus-visible:ring-offset-2"
    >
      <span>Lanjut Isi Alamat</span>
      <ArrowRight className="w-4 h-4" />
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-transparent font-sans text-[#2A1F1A]">
      <main className="flex-1 w-full overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-28 sm:pb-20">
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
                    Keranjang Belanja
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Cek kembali boneka pilihanmu sebelum lanjut isi alamat pengiriman.
                </p>
              </div>
            </div>

            {cartItems.length > 0 && (
              <button
                onClick={() => setShowClearModal(true)}
                className="text-xs font-bold text-amber-800 hover:text-rose-600 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-200/80 bg-amber-50 hover:bg-rose-50 transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF8FB1]"
                title="Kosongkan seluruh keranjang"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Kosongkan</span>
              </button>
            )}
          </div>

          {cartItems.length > 0 && <StepIndicator currentStep={1} />}

          {!isLoaded ? (
            <div className="py-24 text-center">
              <div className="w-12 h-12 border-4 border-[#FCE6CB] border-t-[#D48C70] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-500">Memuat keranjang...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="bg-[#FFFDFB] rounded-[2rem] p-8 sm:p-12 text-center border-2 border-[#FCE6CB] shadow-[0_10px_35px_rgba(212,140,112,0.1)] max-w-md mx-auto my-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 rotate-12"><CrossPatch /></div>
              <EmptyCartArt />
              <h3 className="font-serif text-xl font-bold text-[#2A1F1A] mb-2">
                Keranjangmu Masih Kosong
              </h3>
              <p className="text-sm text-slate-500 font-medium mb-6 max-w-xs mx-auto leading-relaxed">
                Boneka-boneka lucu buatan tangan udah siap nemenin kamu. Yuk pilih favoritmu dulu!
              </p>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-[#D48C70] hover:bg-[#C47A5C] text-white font-black text-sm transition-all shadow-[0_6px_18px_rgba(212,140,112,0.35)] hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF8FB1] focus-visible:ring-offset-2"
              >
                <span>Lihat Katalog Produk</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center justify-between px-1 mb-1">
                    <h2 className="font-serif text-base sm:text-lg font-bold text-[#2A1F1A]">
                      {totalItemCount} boneka dipilih
                    </h2>
                    <span className="text-[10px] sm:text-xs font-bold text-[#D48C70] bg-[#FFF0E5] border border-[#E8B37D]/30 px-2.5 py-1 rounded-full">
                      Semua {cartItems.length} item sudah siap dikirim
                    </span>
                  </div>

                  {cartItems.map((item) => {
                    const subtotal = item.selectedPrice * item.quantity;
                    return (
                      <div
                        key={item.cartItemId}
                        className="bg-[#FFFDFB] p-4 sm:p-5 rounded-3xl border-2 border-[#FCE6CB]/80 shadow-[0_6px_22px_rgba(212,140,112,0.08)] flex gap-4 sm:gap-5 relative group transition-all duration-300 hover:border-[#E8B37D]/60"
                      >
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-[#FFF8F3] to-white border border-[#FCE6CB]/40 overflow-hidden shrink-0 relative p-1.5 flex items-center justify-center">
                          <div className="absolute w-[80%] aspect-square rounded-full bg-[#FFE8D6] blur-xl opacity-50 pointer-events-none" />
                          <img
                            src={item.image}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="relative w-full h-full object-contain"
                          />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-[#2A1F1A] text-sm sm:text-base line-clamp-1 pr-1">
                              {item.name}
                            </h3>
                            <button
                              onClick={() => setItemToDelete(item)}
                              className="bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-200/60 p-2 rounded-xl transition-all duration-200 shrink-0 cursor-pointer shadow-xs hover:scale-105 active:scale-95 flex items-center justify-center"
                              title="Hapus dari keranjang"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {(item.selectedVariantType || item.selectedVariantSize) && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {item.selectedVariantType && (
                                <span className="text-[10px] font-bold text-[#D48C70] bg-[#FFF5F0] border border-[#E8B37D]/25 px-2 py-0.5 rounded-lg">
                                  {item.selectedVariantType}
                                </span>
                              )}
                              {item.selectedVariantSize && (
                                <span className="text-[10px] font-bold text-[#D48C70] bg-[#FFF5F0] border border-[#E8B37D]/25 px-2 py-0.5 rounded-lg">
                                  Ukuran: {item.selectedVariantSize}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="mt-auto pt-3 flex flex-col gap-2">
                            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                              <span>Harga satuan</span>
                              <span className="font-black text-[#2A1F1A] text-sm">
                                {formatIDR(item.selectedPrice)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center bg-[#FFF8F3] border border-[#FCE6CB] rounded-2xl p-1 shadow-xs gap-1">
                                <button
                                  onClick={() => updateQuantity(item.cartItemId, -1)}
                                  disabled={item.quantity <= 1}
                                  className="w-8 h-8 flex items-center justify-center bg-amber-100/80 hover:bg-rose-500 text-amber-800 hover:text-white rounded-xl font-bold transition-all duration-200 disabled:opacity-40 disabled:hover:bg-amber-100/80 disabled:hover:text-amber-800 disabled:cursor-not-allowed cursor-pointer active:scale-90 shadow-xs"
                                  title="Kurangi jumlah"
                                >
                                  <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                                <span className="w-8 text-center text-sm font-black text-[#2A1F1A]">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.cartItemId, 1)}
                                  className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#FF8FB1] to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-bold transition-all duration-200 cursor-pointer active:scale-90 shadow-sm shadow-pink-400/30"
                                  title="Tambah jumlah"
                                >
                                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>

                              <div className="text-right">
                                <div className="text-[10px] text-slate-400 font-semibold">
                                  Subtotal ({item.quantity} × {formatIDR(item.selectedPrice)})
                                </div>
                                <div className="font-black text-[#FF8FB1] text-sm sm:text-base">
                                  {formatIDR(subtotal)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <aside className="lg:col-span-4 lg:sticky lg:top-28">
                  <div className="bg-[#FFF0E5] p-5 sm:p-7 rounded-[2rem] border-2 border-[#E8B37D]/40 shadow-[0_10px_35px_rgba(212,140,112,0.14)] relative overflow-hidden">
                    <div className="absolute top-4 right-4 rotate-12"><CrossPatch /></div>
                    <div className="absolute bottom-4 left-4 -rotate-12"><CrossPatch /></div>

                    <h3 className="font-serif text-lg font-bold text-[#2A1F1A] pb-4 mb-4 border-b-2 border-[#E8B37D]/25">
                      Ringkasan Belanja
                    </h3>

                    <div className="space-y-3.5 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[#4A3B32] font-medium">Boneka</span>
                        <span className="font-bold text-[#2A1F1A]">
                          {totalItemCount} pcs
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#4A3B32] font-medium">Harga boneka</span>
                        <span className="font-bold text-[#2A1F1A]">{formatIDR(totalPrice)}</span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-[#4A3B32] font-medium flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-[#D48C70] shrink-0" />
                          Ongkir
                        </span>
                        <span className="text-right">
                          <span className="font-bold text-emerald-600">Gratis atau berbayar</span>
                          <span className="block text-[10px] text-slate-400 font-medium leading-tight">
                            dihitung di langkah berikutnya
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t-2 border-[#E8B37D]/25 flex items-end justify-between gap-2">
                      <div>
                        <div className="text-[11px] text-[#4A3B32] font-semibold">Total Harga</div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          belum termasuk ongkir
                        </div>
                      </div>
                      <span className="font-black text-2xl sm:text-[1.7rem] text-[#2A1F1A] leading-none">
                        {formatIDR(totalPrice)}
                      </span>
                    </div>

                    <div className="pt-5">
                      <div className="hidden lg:block">{checkoutButton}</div>
                      <p className="mt-3 text-[11px] text-center text-[#4A3B32] font-semibold">
                        Langkah 2 dari 4 · Isi alamat lalu pilih ongkir
                      </p>
                    </div>

                    <div className="pt-4 mt-5 border-t-2 border-[#E8B37D]/25 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#4A3B32]">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>100% jahitan tangan, bukan produksi massal</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#4A3B32]">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Pembayaran aman, data terproteksi</span>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>

              <div className="fixed bottom-2 left-2 right-2 z-40 lg:hidden">
                <div className="bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-dashed border-[#E8B37D]/60 rounded-3xl shadow-[0_-10px_35px_rgba(212,140,112,0.25)] p-3.5 sm:p-4 flex items-center justify-between gap-3 relative">
                  <div className="min-w-0 relative z-10">
                    <div className="text-[10px] font-black text-[#D48C70] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF8FB1] animate-pulse" />
                      Total ({totalItemCount} pcs)
                    </div>
                    <div className="font-black text-[#4A3B32] text-lg sm:text-xl leading-tight truncate mt-0.5 font-heading">
                      {formatIDR(totalPrice)}
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="relative z-10 shrink-0 flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl bg-[#4A3B32] hover:bg-[#2A1F1A] text-white font-black text-xs sm:text-sm transition-all duration-200 shadow-md shadow-[#4A3B32]/30 active:scale-95 cursor-pointer"
                  >
                    <span>Lanjut Isi Alamat</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <SiteFooter showCloudDivider={false} />
      </main>

      {/* Hapus satu produk */}
      <ConfirmDialog
        open={!!itemToDelete}
        title="Hapus Boneka Ini?"
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal, Simpan"
        footerNote="Boneka ini bisa kamu tambahkan lagi kapan pun."
        onConfirm={confirmDeleteItem}
        onClose={() => setItemToDelete(null)}
        message={
          <>
            Boneka ini akan dikeluarkan dari keranjangmu:
            {itemToDelete && (
              <div className="flex items-center gap-3 bg-[#FFF8F3] border border-[#FCE6CB] rounded-2xl p-2.5 mt-3 w-full text-left">
                <div className="w-14 h-14 rounded-xl bg-white border border-[#FCE6CB]/60 overflow-hidden shrink-0 p-1 flex items-center justify-center">
                  <img
                    src={itemToDelete.image}
                    alt={itemToDelete.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#2A1F1A] truncate">
                    {itemToDelete.name}
                  </div>
                  {(itemToDelete.selectedVariantType || itemToDelete.selectedVariantSize) && (
                    <div className="text-[10px] font-bold text-[#D48C70] mt-0.5">
                      {[itemToDelete.selectedVariantType, itemToDelete.selectedVariantSize]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {itemToDelete.quantity} pcs · {formatIDR(itemToDelete.selectedPrice * itemToDelete.quantity)}
                  </div>
                </div>
              </div>
            )}
          </>
        }
      />

      {/* Kosongkan seluruh keranjang */}
      <ConfirmDialog
        open={showClearModal}
        title="Kosongkan Keranjang?"
        confirmLabel="Ya, Kosongkan"
        cancelLabel="Batal, Simpan"
        footerNote="Keranjang bisa kamu isi lagi kapan saja."
        icon={<RotateCcw className="w-8 h-8" />}
        onConfirm={clearCart}
        onClose={() => setShowClearModal(false)}
        message={
          <>
            Semua{" "}
            <span className="font-black text-[#2A1F1A]">{totalItemCount} boneka</span> yang
            kamu pilih akan dikeluarkan dari keranjang. Tindakan ini tidak bisa dibatalkan.
          </>
        }
      />

      {/* Peringatan Harus Login Sebelum Checkout */}
      <ConfirmDialog
        open={showAuthNoticeModal}
        title="Yuk, Masuk Akun Dulu!"
        confirmLabel="Masuk / Daftar Akun"
        cancelLabel="Nanti Dulu"
        footerNote="Boneka pilihanmu di keranjang tetap tersimpan aman."
        icon={<User className="w-8 h-8 text-[#FF8FB1]" />}
        confirmIcon={<LogIn className="w-4 h-4" />}
        variant="primary"
        onConfirm={() => {
          setShowAuthNoticeModal(false);
          setIsAuthModalOpen(true);
        }}
        onClose={() => setShowAuthNoticeModal(false)}
        message={
          <>
            Untuk melanjutkan ke pengisian alamat pengiriman dan pembayaran, kamu perlu masuk atau buat akun dulu ya kak.
          </>
        }
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          router.push("/checkout?mode=cart");
        }}
      />
    </div>
  );
}
