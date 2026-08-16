import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Share2, Heart } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Product } from '@/data/products';
import confetti from 'canvas-confetti';

interface ProductCardProps {
  product: Product;
  cartItemCount: number;
  onDetailClick: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  hideBadge?: boolean;
  hideRating?: boolean;
}

const SvgPria = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="50" fill="#E0F2FE"/>
    <path d="M42 55 L58 55 L58 68 L42 68 Z" fill="#FDBA74"/>
    <circle cx="50" cy="40" r="16" fill="#FED7AA"/>
    <path d="M34 38 C34 25 42 21 50 21 C58 21 66 25 66 38 C66 30 60 25 50 25 C40 25 34 30 34 38 Z" fill="#1E293B"/>
    <path d="M20 90 C20 72 32 68 50 68 C68 68 80 72 80 90 L80 100 L20 100 Z" fill="#0284C7"/>
    <polygon points="50,78 43,68 57,68" fill="#0369A1"/>
  </svg>
);

const SvgHijab = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="50" fill="#FFF1F2"/>
    <ellipse cx="50" cy="42" rx="11" ry="14" fill="#FED7AA"/>
    <path d="M40 34 C43 31 57 31 60 34 C57 33 43 33 40 34 Z" fill="#DB2777"/>
    <path d="M50 16 C35 16 30 28 30 46 C30 55 33 65 38 72 C42 78 58 78 62 72 C67 65 70 55 70 46 C70 28 65 16 50 16 Z
             M50 58 C43 58 39 50 39 42 C39 33 44 28 50 28 C56 28 61 33 61 42 C61 50 57 58 50 58 Z" 
          fill="#EC4899" fillRule="evenodd"/>
    <path d="M38 72 C28 80 18 85 18 95 C18 98 20 100 23 100 L77 100 C80 100 82 98 82 95 C82 85 72 80 62 72 C58 78 42 78 38 72 Z" fill="#DB2777"/>
    <path d="M35 76 C42 84 58 84 65 76 C58 86 42 86 35 76 Z" fill="#BE185D"/>
    <ellipse cx="50" cy="60" rx="6" ry="2" fill="#BE185D" opacity="0.3"/>
  </svg>
);

const SvgWanita = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="50" fill="#FEF3C7"/>
    <path d="M28 42 C28 22 38 18 50 18 C62 18 72 22 72 42 C72 68 65 80 65 80 L35 80 C35 80 28 68 28 42 Z" fill="#27272A"/>
    <path d="M43 55 L57 55 L57 68 L43 68 Z" fill="#FDBA74"/>
    <circle cx="50" cy="42" r="15" fill="#FED7AA"/>
    <path d="M30 40 C30 25 38 18 50 18 C62 18 70 25 70 40 C70 32 60 24 50 28 C42 24 30 32 30 40 Z" fill="#18181B"/>
    <path d="M20 90 C20 72 32 68 50 68 C68 68 80 72 80 90 L80 100 L20 100 Z" fill="#78350F"/>
    <polygon points="50,78 43,68 57,68" fill="#92400E"/>
  </svg>
);

const SvgUmum = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="50" fill="#E5E7EB"/>
    <circle cx="50" cy="38" r="16" fill="#9CA3AF"/>
    <path d="M50 58 C32 58 24 72 24 82 C24 88 30 92 50 92 C70 92 76 88 76 82 C76 72 68 58 50 58 Z" fill="#9CA3AF"/>
  </svg>
);

const SvgPalette = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="50" fill="#F3F4F6"/>
    <path d="M 50 50 L 50 4 A 46 46 0 0 1 96 50 Z" fill="#FF8FB1" />
    <path d="M 50 50 L 96 50 A 46 46 0 0 1 50 96 Z" fill="#38BDF8" />
    <path d="M 50 50 L 50 96 A 46 46 0 0 1 4 50 Z" fill="#FACC15" />
    <path d="M 50 50 L 4 50 A 46 46 0 0 1 50 4 Z" fill="#34D399" />
    <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
  </svg>
);

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  if (name === 'CustomPria') return <SvgPria className={className} />;
  if (name === 'CustomHijab') return <SvgHijab className={className} />;
  if (name === 'CustomWanita') return <SvgWanita className={className} />;
  if (name === 'CustomUmum') return <SvgUmum className={className} />;
  if (name === 'CustomPalette' || name === 'CustomWarna' || name === 'CustomColor') return <SvgPalette className={className} />;
  
  // If it's an emoji (single or double char, no uppercase letter), just render it as text
  if (name.length <= 2 || /[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(name)) {
    return <span className="text-sm leading-none">{name}</span>;
  }
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <span className="text-xs font-bold leading-none">{name.charAt(0)}</span>;
  return <IconComponent className={className} />;
};

export const ProductCard: React.FC<ProductCardProps & { index?: number, animate?: boolean }> = ({
  product,
  cartItemCount,
  onDetailClick,
  onAddToCart,
  index = 0,
  animate = true,
  hideBadge = false,
  hideRating = false,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('simoengil_favorites') || '[]');
      setIsFavorite(favs.includes(product.id));
    } catch(e) {}
  }, [product.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const favs = JSON.parse(localStorage.getItem('simoengil_favorites') || '[]');
      if (isFavorite) {
        const newFavs = favs.filter((id: string) => id !== product.id);
        localStorage.setItem('simoengil_favorites', JSON.stringify(newFavs));
        setIsFavorite(false);
      } else {
        if (!favs.includes(product.id)) {
          favs.push(product.id);
          localStorage.setItem('simoengil_favorites', JSON.stringify(favs));
        }
        setIsFavorite(true);
      }
      window.dispatchEvent(new Event('favorites_updated'));
    } catch(e) {}
  };
  // Format price to IDR
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getPriceDisplay = () => {
    const prices: number[] = [];
    
    // Check base product availability
    const shopeeAvail = product.shopeeAvailable !== false;

    if (shopeeAvail) prices.push(product.shopeePrice || product.price);
    
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(v => {
        const vShopeeAvail = v.shopeeAvailable !== false;

        if (vShopeeAvail) prices.push(v.shopeePrice || v.price || product.price);
      });
    }

    const validPrices = Array.from(new Set(prices.filter(p => typeof p === 'number' && !isNaN(p))));

    if (validPrices.length === 0) {
      return "Tidak tersedia";
    }

    const minPrice = Math.min(...validPrices);
    const maxPrice = Math.max(...validPrices);

    if (minPrice === maxPrice) {
      return formatIDR(minPrice);
    }
    return `${formatIDR(minPrice)} - ${formatIDR(maxPrice)}`;
  };

  // Variant Icons
  const getVariantIcons = () => {
    if (product.specifications?.types && product.specifications.types.length > 0) {
      return product.specifications.types;
    }
    // Default variations as requested if not specified
    return [
      { name: 'Umum (Tanpa Gender)', icon: 'CustomUmum' },
      { name: 'Custom Warna (Palette)', icon: 'CustomPalette' }
    ];
  };

  const variantIcons = getVariantIcons();

  return (
    <div
      className="group relative bg-[#FFFDFB] rounded-2xl sm:rounded-3xl hover:shadow-[0_20px_45px_rgba(212,140,112,0.12)] transition-all duration-500 flex flex-col justify-between border border-[#FCE6CB]/50 hover:border-[#D48C70]/40 cursor-pointer overflow-hidden h-full w-full"
      style={animate ? { animation: `cardBounce 0.8s ease-out ${index * 0.1}s both` } : undefined}
      onClick={() => onDetailClick(product)}
    >


      <div className="relative z-10 flex flex-col h-full">
        {/* Product Image with Badges */}
        <div 
          className="relative w-full aspect-[4/5] overflow-hidden bg-gradient-to-tr from-[#FFF8F3] to-white mb-3 sm:mb-4 border-b border-[#FCE6CB]/30 flex items-center justify-center shrink-0"
        >
          {/* Subtle Background Circle */}
          <div className="absolute w-[85%] aspect-square rounded-full bg-[#FFE8D6] blur-2xl z-0 opacity-60 pointer-events-none"></div>

          {/* Top Left Heart (Favorite) */}
          <button 
            className={`absolute top-2 left-2 sm:top-3 sm:left-3 z-20 p-1.5 sm:p-2 backdrop-blur-md rounded-full border shadow-sm transition-all duration-300 hover:scale-110 ${isFavorite ? 'bg-white border-[#FF8FB1]' : 'bg-white/90 border-[#FCE6CB]/50 hover:bg-white'}`}
            onClick={toggleFavorite}
            title={isFavorite ? "Hapus dari Favorit" : "Tambah ke Favorit"}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${isFavorite ? 'text-[#FF8FB1] fill-[#FF8FB1]' : 'text-[#FF8FB1] hover:fill-[#FF8FB1]'}`} />
          </button>



          <img
            src={product.image}
            referrerPolicy="no-referrer"
            alt={product.name}
            className="relative z-10 w-full h-full object-cover group-hover:scale-105 group-hover:animate-bobble transition-transform duration-700 ease-out origin-bottom"
          />
        </div>



        {/* Product Info */}
        <div className="flex flex-col flex-grow justify-between px-3 pb-3 sm:px-4 sm:pb-4">
          <div>
            {/* Product Name */}
            <h3 
              className="font-bold text-[#2A1F1A] text-xs sm:text-base group-hover:text-[#D48C70] transition-colors duration-300 line-clamp-2 min-h-[2rem] sm:min-h-[2.75rem] mb-2 sm:mb-4 leading-snug"
            >
              {product.name}
            </h3>
          </div>

          {/* Price and Rating Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-auto gap-2 sm:gap-0">
            {/* Price in Pink Box */}
            <div className="border border-[#FFB6C8] bg-[#FFF0F3] rounded-md px-1.5 py-0.5 sm:px-2 sm:py-1">
              <span className="font-black text-[#FF8FB1] text-[10px] sm:text-sm">{getPriceDisplay()}</span>
            </div>

            {/* Rating */}
            {!hideRating && (
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold text-slate-700">{Number(product.rating).toFixed(1)}</span>
                <span className="text-[9px] sm:text-xs text-slate-400 font-medium inline">({product.reviewsCount || Math.floor(Math.random() * 100) + 10})</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};