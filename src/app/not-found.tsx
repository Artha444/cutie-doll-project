import React from "react";
import Link from "next/link";
import { SearchX, Home, ShoppingBag, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 font-sans text-slate-800">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 pt-28 sm:pt-36 pb-20 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-100/50 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-100/40 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="max-w-2xl w-full mx-auto text-center relative z-10">
          {/* Animated Icon */}
          <div className="relative inline-flex justify-center items-center mb-8">
            <div className="absolute inset-0 bg-pink-100 rounded-full scale-150 animate-ping opacity-20"></div>
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full shadow-xl shadow-pink-100 flex items-center justify-center relative z-10 animate-bounce" style={{ animationDuration: '3s' }}>
              <SearchX className="w-16 h-16 sm:w-20 sm:h-20 text-[#FF8FB1]" />
            </div>
            
            {/* Floating particles */}
            <div className="absolute -top-4 -right-8 w-6 h-6 bg-rose-200 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }} />
            <div className="absolute -bottom-2 -left-6 w-4 h-4 bg-pink-300 rounded-full opacity-50 animate-bounce" style={{ animationDelay: '1.2s', animationDuration: '2s' }} />
          </div>

          <h1 className="text-8xl sm:text-9xl font-black text-slate-900 mb-4 tracking-tighter drop-shadow-sm">
            4<span className="text-[#FF8FB1]">0</span>4
          </h1>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-4">
            Oops! Halaman Tidak Ditemukan
          </h2>
          
          <p className="text-slate-500 text-sm sm:text-base mb-10 max-w-md mx-auto leading-relaxed">
            Sepertinya boneka yang Anda cari sedang bermain petak umpet, atau halaman ini mungkin telah dipindahkan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold hover:border-[#FF8FB1] hover:text-[#FF8FB1] hover:bg-pink-50/30 transition-all active:scale-95 shadow-sm"
            >
              <Home className="w-5 h-5" />
              <span>Kembali ke Beranda</span>
            </Link>
            
            <Link 
              href="/products"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#FF8FB1] hover:bg-[#ff7aa4] text-white font-bold transition-all shadow-md shadow-pink-200 hover:shadow-lg active:scale-95 group"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Lihat Katalog</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter showCloudDivider={false} />
    </div>
  );
}
