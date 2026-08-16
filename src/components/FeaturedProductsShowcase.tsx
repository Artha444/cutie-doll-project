"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Product } from "@/data/products";
import { Editable } from "@/app/Editable";
import { Sparkles, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { ProductCard } from "./ProductCard";

interface FeaturedProductsShowcaseProps {
  products: Product[];
  isAdmin: boolean;
  siteSettings: {
    featuredTopTitle?: string;
    featuredTitle?: string;
    featuredSubtitle?: string;
    featuredCtaText?: string;
    [key: string]: unknown;
  };
  onSaveSettings: (key: string, value: any) => Promise<void>;
  onOpenAdminModal: () => void;
  onProductDetailClick: (product: Product) => void;
}

export const FeaturedProductsShowcase: React.FC<FeaturedProductsShowcaseProps> = ({
  products,
  isAdmin,
  siteSettings,
  onSaveSettings,
  onOpenAdminModal,
  onProductDetailClick,
}) => {
  const row1Ref = useRef<HTMLDivElement>(null);

  const scrollRow = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="katalog"
      className="relative z-20 w-full bg-[#e7c79f] overflow-hidden"
    >
      {/* Bullet Journal Dotted Pattern Overlay */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#2A1F1A_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />

      {/* Soft warm glowing orbs */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-[#FFFDF9]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-[#FF8FB1]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24 relative z-10 antialiased">
        
        {/* Top Centered Huge Title & Floating Badge */}
        <div className="text-center mb-16 lg:mb-24">
          <div className="relative inline-block mx-auto text-center">
            {/* Floating Scalloped Badge - Top Right of the title */}
            <div className="absolute -top-16 -right-12 sm:-top-20 sm:-right-20 w-[90px] h-[90px] sm:w-[120px] sm:h-[120px] flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-500 z-50">
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#FCD571] drop-shadow-md">
                <path fill="currentColor" d="M 50,0 C 55,0 58,4 63,5 C 67,6 71,2 75,5 C 79,8 77,12 81,16 C 85,19 90,19 92,24 C 95,28 91,32 94,37 C 97,41 100,45 100,50 C 100,55 97,59 94,63 C 91,68 95,72 92,76 C 90,81 85,81 81,84 C 77,88 79,92 75,95 C 71,98 67,94 63,95 C 58,96 55,100 50,100 C 45,100 42,96 37,95 C 33,94 29,98 25,95 C 21,92 23,88 19,84 C 15,81 10,81 8,76 C 5,72 9,68 6,63 C 3,59 0,55 0,50 C 0,45 3,41 6,37 C 9,32 5,28 8,24 C 10,19 15,19 19,16 C 23,12 21,8 25,5 C 29,2 33,6 37,5 C 42,4 45,0 50,0 Z" />
              </svg>
              <div className="relative z-10 flex flex-col items-center justify-center text-[#2A1F1A] font-black leading-tight text-center mt-[2px]">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1 text-[#2A1F1A] fill-[#2A1F1A]" />
                <span className="text-[11px] sm:text-sm">100%</span>
                <span className="text-[7px] sm:text-[10px]">Jahit Tangan,</span>
                <span className="text-[7px] sm:text-[10px]">Penuh Kasih!</span>
              </div>
            </div>

            <Editable
              isAdmin={isAdmin}
              itemKey="featuredTopTitle"
              initialValue={(siteSettings.featuredTopTitle as string) || "Kado Spesial. Penuh Makna."}
              onSave={onSaveSettings}
              as="h2"
              className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-[#2A1F1A] tracking-tight leading-tight max-w-[280px] sm:max-w-4xl mx-auto relative z-10"
            />
          </div>
          
          {isAdmin && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={onOpenAdminModal}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#D48C70] hover:text-[#2A1F1A] underline underline-offset-4 transition-colors bg-[#FFFDF9] px-4 py-2 rounded-full shadow-sm border border-[#D48C70]/30"
              >
                <span>⚙️ Atur Koleksi Produk Unggulan di Admin Panel</span>
              </button>
            </div>
          )}
        </div>

        {/* 1 Row Layout - Scrapbook Aesthetic */}
        <div className="w-full relative z-20 mt-8 sm:mt-12">
          
          {products.length > 0 && (
            <div className="relative w-full max-w-6xl mx-auto">
              
              {/* Washi Tape Decorations */}
              <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 w-24 sm:w-32 h-8 sm:h-10 bg-[#FCE6CB] -rotate-6 shadow-[0_2px_4px_rgba(0,0,0,0.1)] border-l-2 border-r-2 border-white/40 z-30 pointer-events-none opacity-90" />
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-24 sm:w-32 h-8 sm:h-10 bg-[#FF8FB1] rotate-3 shadow-[0_2px_4px_rgba(0,0,0,0.1)] border-l-2 border-r-2 border-white/40 z-30 pointer-events-none opacity-80" />
              <div className="absolute -top-3 right-10 w-16 h-6 bg-[#D48C70] rotate-12 shadow-[0_2px_4px_rgba(0,0,0,0.1)] border-l-2 border-r-2 border-white/40 z-30 pointer-events-none hidden sm:block opacity-80" />

              {/* Scrapbook Paper Container */}
              <div className="relative w-full bg-[#FFFDF9] rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-[0_15px_40px_rgba(42,31,26,0.08)]">
                
                {/* Dashed Stitching Border */}
                <div className="absolute inset-3 sm:inset-4 border-[3px] border-dashed border-[#D48C70]/40 rounded-[1.5rem] sm:rounded-[2.5rem] pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 px-2 sm:px-4">
                    <div className="flex flex-col">
                      <h3 className="font-serif text-3xl sm:text-4xl lg:text-4xl font-bold text-[#2A1F1A] tracking-tight flex items-center gap-3">
                        Cocok Buat Kamu
                      </h3>
                      <p className="font-sans text-[#D48C70] font-semibold text-sm sm:text-base ml-0.5 mt-1">
                        Pilihan spesial khusus hari ini!
                      </p>
                    </div>

                    {/* Actions: "Lihat Semua ->" and Navigation Arrows */}
                    <div className="flex items-center gap-4 sm:gap-6 self-between sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
                      <Link
                        href="/products"
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold bg-[#FFFDF9] border-2 border-[#D48C70] text-[#D48C70] hover:bg-[#D48C70] hover:text-white rounded-full shadow-[2px_2px_0_0_#D48C70] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none transition-all group cursor-pointer"
                      >
                        <span>Lihat semua</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>

                      {/* Retro/Handmade Navigation Arrows */}
                      <div className="hidden sm:flex items-center gap-3">
                        <button 
                          onClick={() => scrollRow(row1Ref, 'left')} 
                          className="w-10 h-10 rounded-full bg-[#FFFDF9] border-2 border-[#D48C70] text-[#D48C70] hover:bg-[#D48C70] hover:text-white shadow-[2px_2px_0_0_#D48C70] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none flex items-center justify-center transition-all cursor-pointer"
                          aria-label="Scroll Left"
                        >
                          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                        </button>
                        <button 
                          onClick={() => scrollRow(row1Ref, 'right')} 
                          className="w-10 h-10 rounded-full bg-[#FFFDF9] border-2 border-[#D48C70] text-[#D48C70] hover:bg-[#D48C70] hover:text-white shadow-[2px_2px_0_0_#D48C70] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none flex items-center justify-center transition-all cursor-pointer"
                          aria-label="Scroll Right"
                        >
                          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Scroll Container */}
                  <div 
                    ref={row1Ref} 
                    className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto pb-8 pt-4 -mx-6 sm:-mx-10 px-6 sm:px-10 snap-x snap-mandatory scrollbar-hide" 
                    style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}
                  >
                    {products.map((product, idx) => {
                      const clipColors = ["text-[#FCD571]", "text-[#8FD37B]", "text-[#80C9E8]", "text-[#FF8FB1]", "text-[#F15A24]"];
                      const clipColor = clipColors[idx % clipColors.length];
                      const rotation = idx % 2 === 0 ? "rotate-[-15deg]" : "rotate-[15deg]";
                      return (
                      <div key={product.id} className="min-w-[240px] sm:min-w-[280px] max-w-[280px] sm:max-w-[320px] snap-start shrink-0 hover:-rotate-1 transition-transform duration-300 relative pt-6 sm:pt-8">
                        {/* Decorative Giant Paperclip (Flat Plastic Aesthetic) */}
                        <div className={`absolute -top-1 left-2 sm:left-4 z-30 pointer-events-none transition-transform duration-300 ${rotation}`}>
                          <svg viewBox="0 0 65 130" className={`w-10 sm:w-12 h-auto ${clipColor}`} fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(1px 4px 6px rgba(42,31,26,0.15))" }}>
                            <path d="M 25 85 L 25 40 A 7.5 7.5 0 0 1 40 40 L 40 100 A 15 15 0 0 1 10 100 L 10 30 A 22.5 22.5 0 0 1 55 30 L 55 95" />
                          </svg>
                        </div>
                        
                        <div 
                          className="bg-white p-2.5 sm:p-3 rounded-2xl sm:rounded-[2rem] shadow-sm hover:shadow-lg transition-all cursor-pointer relative h-[320px] sm:h-[400px] w-full flex flex-col group border border-[#FCE6CB]"
                          onClick={() => onProductDetailClick(product)}
                          style={{
                            backgroundImage: "linear-gradient(90deg, transparent 16px, #FCA5A5 16px, #FCA5A5 17px, transparent 17px), repeating-linear-gradient(transparent, transparent 23px, #E5E7EB 23px, #E5E7EB 24px)"
                          }}
                        >
                          {/* Image filling the inner bounds */}
                          <div className="relative w-full h-full rounded-xl sm:rounded-3xl overflow-hidden bg-[#FFF8F0]">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                            />
                            {/* Dark gradient for text legibility if needed, though we use a white overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </div>
                          
                          {/* Text Overlay */}
                          <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-md flex flex-col gap-1 sm:translate-y-2 sm:group-hover:translate-y-0 transition-transform duration-300 border border-[#FCE6CB]/50">
                             <h4 className="font-bold text-[#2A1F1A] text-xs sm:text-sm line-clamp-2 leading-tight">{product.name}</h4>
                             <p className="text-[#FF8FB1] font-black text-sm sm:text-base">
                               {product.shopeeAvailable && product.specifications?.shopeePrice
                                ? `Rp ${Number(product.specifications.shopeePrice).toLocaleString("id-ID")}`
                                : `Rp ${product.price.toLocaleString("id-ID")}`}
                             </p>
                          </div>
                        </div>
                      </div>
                    )})}
                    {/* Spacer for mobile scroll edge */}
                    <div className="w-2 sm:w-4 shrink-0 pointer-events-none" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
