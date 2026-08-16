const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Helper to load env vars manually from .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '../../.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found!');
    process.exit(1);
  }
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = match[2] || '';
      if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
        value = value.substring(1, value.length - 1);
      }
      env[key] = value.trim();
    }
  });
  return env;
}

const MOCK_PRODUCTS = [
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
    tokopediaLink: 'https://tokopedia.com',
    specifications: {
      material: '100% Kain Flanel Premium & Isian Dacron Grade A',
      size: 'Tinggi 15 cm, Lebar 10 cm (Range 10–20 cm)',
      washing: 'Tidak disarankan dicuci basah (cukup bersihkan debu secara kering/dry wipe)',
      safeForKids: false
    },
    variants: [
      { size: "Standard (15cm)", price: 89000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" },
      { size: "Maxi (20cm)", price: 119000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" }
    ]
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
    tokopediaLink: 'https://tokopedia.com',
    specifications: {
      material: '100% Kain Flanel Premium & Isian Dacron Grade A',
      size: 'Tinggi 18 cm, Lebar 11 cm (Range 10–20 cm)',
      washing: 'Tidak disarankan dicuci basah (cukup bersihkan debu secara kering/dry wipe)',
      safeForKids: false
    },
    variants: [
      { size: "Standard (16cm)", price: 95000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" },
      { size: "Maxi (20cm)", price: 125000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" }
    ]
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
    tokopediaLink: 'https://tokopedia.com',
    specifications: {
      material: '100% Kain Flanel Premium & Isian Dacron Grade A',
      size: 'Panjang 16 cm, Tinggi 12 cm (Range 10–20 cm)',
      washing: 'Tidak disarankan dicuci basah (cukup bersihkan debu secara kering/dry wipe)',
      safeForKids: false
    },
    variants: [
      { size: "Standard (16cm)", price: 110000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" },
      { size: "Maxi (20cm)", price: 135000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" }
    ]
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
    tokopediaLink: 'https://tokopedia.com',
    specifications: {
      material: '100% Kain Flanel Premium & Isian Dacron Grade A',
      size: 'Diameter 15 cm (Range 10–20 cm)',
      washing: 'Tidak disarankan dicuci basah (cukup bersihkan debu secara kering/dry wipe)',
      safeForKids: false
    },
    variants: [
      { size: "Mini (10cm)", price: 79000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" },
      { size: "Maxi (20cm)", price: 109000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" }
    ]
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
    tokopediaLink: 'https://tokopedia.com',
    specifications: {
      material: '100% Kain Flanel Premium & Isian Dacron Grade A',
      size: 'Tinggi 18 cm (posisi duduk, Range 10–20 cm)',
      washing: 'Tidak disarankan dicuci basah (cukup bersihkan debu secara kering/dry wipe)',
      safeForKids: false
    },
    variants: [
      { size: "Standard (15cm)", price: 125000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" },
      { size: "Maxi (20cm)", price: 155000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" }
    ]
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
    tokopediaLink: 'https://tokopedia.com',
    specifications: {
      material: '100% Kain Flanel Premium & Isian Dacron Grade A',
      size: 'Tinggi 12 cm',
      washing: 'Tidak disarankan dicuci basah (cukup bersihkan debu secara kering/dry wipe)',
      safeForKids: false
    },
    variants: [
      { size: "Mini (12cm)", price: 29000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" }
    ]
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
    tokopediaLink: 'https://tokopedia.com',
    specifications: {
      material: '100% Kain Flanel Premium & Isian Dacron Grade A',
      size: 'Tinggi 12 cm',
      washing: 'Tidak disarankan dicuci basah (cukup bersihkan debu secara kering/dry wipe)',
      safeForKids: false
    },
    variants: [
      { size: "Mini (12cm)", price: 29000, shopeeUrl: "https://shopee.co.id", tokopediaUrl: "https://tokopedia.com" }
    ]
  }
];

async function main() {
  const env = loadEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log('Mapping seed products to DB schema...');
  const dbProducts = MOCK_PRODUCTS.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    image: p.image,
    status: p.status,
    description: p.description,
    rating: p.rating,
    reviews_count: p.reviewsCount,
    shopee_link: p.shopeeLink,
    tokopedia_link: p.tokopediaLink,
    specifications: p.specifications,
    variants: p.variants
  }));

  console.log(`Upserting ${dbProducts.length} products to database...`);
  const { data, error } = await supabase.from('products').upsert(dbProducts);

  if (error) {
    console.error('Failed to seed products:', error.message);
    process.exit(1);
  }

  console.log('🎉 Seeded products table successfully!');
}

main().catch(err => {
  console.error(err);
});
