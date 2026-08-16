export interface ProductType {
  name: string;
  image?: string;
  icon?: string;
  extraPrice?: number;
}

export interface ProductSize {
  name: string;
  extraPrice?: number;
}

export interface ProductFeature {
  icon: string;
  title: string;
  description: string;
}

export interface ProductTestimonial {
  name: string;
  rating: number;
  message: string;
  date?: string;
  avatar?: string;
}

export interface ProductSpecification {
  material: string;
  size: string;
  washing: string;
  safeForKids: boolean;
  shopeePrice?: number;
  shopeeAvailable?: boolean;
  images?: string[];
  features?: ProductFeature[];
  soldCount?: number;
  testimonials?: ProductTestimonial[];
  types?: ProductType[];
  sizes?: ProductSize[];
}

export interface ProductVariant {
  type?: string;
  size: string;
  price?: number;
  shopeePrice?: number;
  shopeeUrl: string;
  shopeeAvailable?: boolean;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  rating: number;
  reviewsCount: number;
  shopeeLink: string;
  shopeePrice?: number;
  shopeeAvailable?: boolean;
  originalPrice?: number;
  images?: string[];
  specifications: ProductSpecification;
  variants?: ProductVariant[];
}

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Teddy Bear Klasik Cokelat',
    price: 89000,
    category: 'Boneka Beruang',
    image: '/images/plushie_teddy.png',
    description: 'Boneka beruang flanel klasik berwarna cokelat hangat hasil jahitan tangan rapi berukuran mungil (10-20cm). Sangat pas untuk kado ulang tahun, suvenir manis, maupun pajangan estetik di meja kerja.',
    rating: 4.9,
    reviewsCount: 142,
    shopeeLink: 'https://shopee.co.id',
    shopeePrice: 94000,
    specifications: {
      material: '100% Kain Flanel Premium & Isian Dacron Grade A',
      size: 'Tinggi 15 cm, Lebar 10 cm (Range 10–20 cm)',
      washing: 'Tidak disarankan dicuci basah (cukup bersihkan debu secara kering/dry wipe)',
      safeForKids: false,
      types: [
        { name: "Cokelat Klasik", extraPrice: 0 }
      ],
      sizes: [
        { name: "Mini (10cm)", extraPrice: 0 },
        { name: "Standard (15cm)", extraPrice: 15000 },
        { name: "Maxi (20cm)", extraPrice: 35000 }
      ],
      features: [
        { icon: "🪡", title: "100% Jahit Tangan", description: "Pola dipotong dan dijahit manual penuh ketelitian untuk hasil rapi & presisi." },
        { icon: "✨", title: "Kain Flanel & Dacron", description: "Menggunakan bahan flanel berkualitas dan isian dacron silikon murni anti-kempes." },
        { icon: "🎁", title: "Ukuran Mungil 10–20cm", description: "Sangat cocok untuk kado ulang tahun, wisuda, gantungan kunci, maupun pajangan estetik." },
        { icon: "🇮🇩", title: "100% Produk Lokal", description: "Karya handmade pengrajin lokal Indonesia dengan detail berkarakter." }
      ],
      soldCount: 520,
      testimonials: [
        {
          name: 'Ratih Ningsih',
          rating: 5,
          message: 'Bahan flanelnya bagus, jahitannya sangat rapi dan detail. Isian dacronnya padat dan ukurannya mungil pas banget buat pajangan di meja belajar!',
          date: '12 Mei 2026',
          avatar: 'RN'
        },
        {
          name: 'Budi Santoso',
          rating: 5,
          message: 'Beli untuk kado wisuda pacar, respon admin cepat dan dapet custom kemasan rapi. Worth the price banget buat kado spesial.',
          date: '04 Mei 2026',
          avatar: 'BS'
        }
      ]
    },
    variants: []
  },
  {
    id: '2',
    name: 'Bunny Kuping Panjang Pink',
    price: 95000,
    category: 'Boneka Beruang',
    image: '/images/plushie_bunny.png',
    description: 'Boneka kelinci flanel lucu berwarna pink pastel dengan telinga panjang bertekstur lembut. Didesain khusus dalam ukuran 10-20cm sebagai kado berkesan maupun pajangan kamar yang manis.',
    rating: 4.8,
    reviewsCount: 96,
    shopeeLink: 'https://shopee.co.id',
    shopeePrice: 99000,
    specifications: {
      material: '100% Kain Flanel Premium & Isian Dacron Grade A',
      size: 'Tinggi 18 cm, Lebar 11 cm (Range 10–20 cm)',
      washing: 'Tidak disarankan dicuci basah (cukup bersihkan debu secara kering/dry wipe)',
      safeForKids: false,
      types: [
        { name: "Pink Pastel", extraPrice: 0 }
      ],
      sizes: [
        { name: "Mini (12cm)", extraPrice: 0 },
        { name: "Standard (16cm)", extraPrice: 15000 },
        { name: "Maxi (20cm)", extraPrice: 35000 }
      ],
      features: [
        { icon: "🪡", title: "100% Jahit Tangan", description: "Pola dipotong dan dijahit manual penuh ketelitian untuk hasil rapi & presisi." },
        { icon: "✨", title: "Kain Flanel & Dacron", description: "Menggunakan bahan flanel berkualitas dan isian dacron silikon murni anti-kempes." },
        { icon: "🎁", title: "Ukuran Mungil 10–20cm", description: "Sangat cocok untuk kado ulang tahun, wisuda, gantungan kunci, maupun pajangan estetik." },
        { icon: "🇮🇩", title: "100% Produk Lokal", description: "Karya handmade pengrajin lokal Indonesia dengan detail berkarakter." }
      ]
    },
    variants: []
  },
  {
    id: '3',
    name: 'Dino Hijau Imut Spiky',
    price: 110000,
    category: 'Boneka Beruang',
    image: '/images/plushie_dino.png',
    description: 'Boneka dinosaurus flanel berwarna hijau cerah dengan ornamen gerigi kuning lembut di punggungnya. Koleksi pajangan berkarakter unik dalam ukuran mungil 10-20cm.',
    rating: 5.0,
    reviewsCount: 64,
    shopeeLink: 'https://shopee.co.id',
    shopeePrice: 115000,
    specifications: {
      material: '100% Kain Flanel Premium & Isian Dacron Grade A',
      size: 'Panjang 16 cm, Tinggi 12 cm (Range 10–20 cm)',
      washing: 'Tidak disarankan dicuci basah (cukup bersihkan debu secara kering/dry wipe)',
      safeForKids: false,
      types: [
        { name: "Hijau Cerah", extraPrice: 0 }
      ],
      sizes: [
        { name: "Mini (12cm)", extraPrice: 0 },
        { name: "Standard (16cm)", extraPrice: 15000 },
        { name: "Maxi (20cm)", extraPrice: 35000 }
      ],
      features: [
        { icon: "🪡", title: "100% Jahit Tangan", description: "Pola dipotong dan dijahit manual penuh ketelitian untuk hasil rapi & presisi." },
        { icon: "✨", title: "Kain Flanel & Dacron", description: "Menggunakan bahan flanel berkualitas dan isian dacron silikon murni anti-kempes." },
        { icon: "🎁", title: "Ukuran Mungil 10–20cm", description: "Sangat cocok untuk kado ulang tahun, wisuda, gantungan kunci, maupun pajangan estetik." },
        { icon: "🇮🇩", title: "100% Produk Lokal", description: "Karya handmade pengrajin lokal Indonesia dengan detail berkarakter." }
      ]
    },
    variants: []
  },
  {
    id: '4',
    name: 'Mochi Neko Squishy Bulat',
    price: 79000,
    category: 'Boneka Beruang',
    image: '/images/plushie_neko.png',
    description: 'Boneka kucing flanel bulat dengan detail jahitan wajah yang imut. Cocok sebagai hiasan rak buku atau meja rias berukuran mungil nan estetik.',
    rating: 4.7,
    reviewsCount: 81,
    shopeeLink: 'https://shopee.co.id',
    shopeePrice: 84000,
    specifications: {
      material: '100% Kain Flanel Premium & Isian Dacron Grade A',
      size: 'Diameter 15 cm (Range 10–20 cm)',
      washing: 'Tidak disarankan dicuci basah (cukup bersihkan debu secara kering/dry wipe)',
      safeForKids: false,
      types: [
        { name: "Putih", extraPrice: 0 }
      ],
      sizes: [
        { name: "Mini (10cm)", extraPrice: 0 },
        { name: "Standard (15cm)", extraPrice: 15000 },
        { name: "Maxi (20cm)", extraPrice: 35000 }
      ],
      features: [
        { icon: "🪡", title: "100% Jahit Tangan", description: "Pola dipotong dan dijahit manual penuh ketelitian untuk hasil rapi & presisi." },
        { icon: "✨", title: "Kain Flanel & Dacron", description: "Menggunakan bahan flanel berkualitas dan isian dacron silikon murni anti-kempes." },
        { icon: "🎁", title: "Ukuran Mungil 10–20cm", description: "Sangat cocok untuk kado ulang tahun, wisuda, gantungan kunci, maupun pajangan estetik." },
        { icon: "🇮🇩", title: "100% Produk Lokal", description: "Karya handmade pengrajin lokal Indonesia dengan detail berkarakter." }
      ]
    },
    variants: []
  },
  {
    id: '5',
    name: 'Teddy Bear Kado Wisuda',
    price: 125000,
    category: 'Kado Wisuda',
    image: '/images/plushie_grad_bear.png',
    description: 'Teddy Bear flanel spesial wisuda lengkap dengan topi toga hitam dan gulungan ijazah dengan pita merah cantik. Hadiah kelulusan terbaik yang awet dan rapi.',
    rating: 4.9,
    reviewsCount: 52,
    shopeeLink: 'https://shopee.co.id',
    shopeePrice: 135000,
    specifications: {
      material: '100% Kain Flanel Premium & Isian Dacron Grade A',
      size: 'Tinggi 18 cm (posisi duduk, Range 10–20 cm)',
      washing: 'Tidak disarankan dicuci basah (cukup bersihkan debu secara kering/dry wipe)',
      safeForKids: false,
      types: [
        { name: "Kado Wisuda Biasa", extraPrice: 0 },
        { name: "Kustom Nama (+Selempang)", extraPrice: 15000 }
      ],
      sizes: [
        { name: "Standard (15cm)", extraPrice: 0 },
        { name: "Maxi (20cm)", extraPrice: 35000 }
      ],
      features: [
        { icon: "🪡", title: "100% Jahit Tangan", description: "Pola dipotong dan dijahit manual penuh ketelitian untuk hasil rapi & presisi." },
        { icon: "✨", title: "Kain Flanel & Dacron", description: "Menggunakan bahan flanel berkualitas dan isian dacron silikon murni anti-kempes." },
        { icon: "🎁", title: "Ukuran Mungil 10–20cm", description: "Sangat cocok untuk kado ulang tahun, wisuda, gantungan kunci, maupun pajangan estetik." },
        { icon: "🇮🇩", title: "100% Produk Lokal", description: "Karya handmade pengrajin lokal Indonesia dengan detail berkarakter." }
      ]
    },
    variants: []
  },
  {
    id: '6',
    name: 'Gantungan Kunci Fluffy Bear',
    price: 29000,
    category: 'Gantungan Kunci',
    image: '/images/plushie_keychain_bear.png',
    description: 'Gantungan kunci boneka beruang flanel mini (10-12cm) yang dijahit tangan rapi. Dilengkapi gantungan logam anti karat untuk tas ransel ataupun tas sekolah.',
    rating: 4.9,
    reviewsCount: 215,
    shopeeLink: 'https://shopee.co.id',
    shopeePrice: 34900,
    specifications: {
      material: '100% Kain Flanel Premium & Isian Dacron Grade A',
      size: 'Tinggi 12 cm',
      washing: 'Tidak disarankan dicuci basah (cukup bersihkan debu secara kering/dry wipe)',
      safeForKids: false,
      types: [
        { name: "Cokelat", extraPrice: 0 },
        { name: "Krem", extraPrice: 0 }
      ],
      sizes: [
        { name: "Mini (12cm)", extraPrice: 0 }
      ]
    },
    variants: []
  },
  {
    id: '7',
    name: 'Gantungan Kunci Fluffy Bunny',
    price: 29000,
    category: 'Gantungan Kunci',
    image: '/images/plushie_keychain_bunny.png',
    description: 'Gantungan kunci boneka kelinci flanel putih mini (10-12cm) yang imut dengan detail telinga pink lembut. Sentuhan gemas untuk aksesoris tas Anda.',
    rating: 4.7,
    reviewsCount: 38,
    shopeeLink: 'https://shopee.co.id',
    shopeePrice: 34900,
    specifications: {
      material: '100% Kain Flanel Premium & Isian Dacron Grade A',
      size: 'Tinggi 12 cm',
      washing: 'Tidak disarankan dicuci basah (cukup bersihkan debu secara kering/dry wipe)',
      safeForKids: false,
      types: [
        { name: "Pink Telinga", extraPrice: 0 }
      ],
      sizes: [
        { name: "Mini (12cm)", extraPrice: 0 }
      ]
    },
    variants: []
  }
];

export interface CartItem extends Product {
  cartItemId: string;
  selectedVariantType?: string;
  selectedVariantSize?: string;
  quantity: number;
  selectedPrice: number;
}
