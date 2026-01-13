// Product data - extracted from server.js
const PRODUCTS = [
  {
    id: 'soundbar-mivi-fort',
    sku: 'SN-001',
    name: 'Mivi Fort Sonic 150 Soundbar, 2.1 Channel',
    category: 'Electronics',
    brand: 'Mivi',
    price: 249.0,
    mrp: 329.0,
    badge: 'Deal',
    description: '150W 2.1 channel Bluetooth soundbar with EQ modes and multi-input.',
    bullets: ['150W output', 'BT v5.3', 'Multi-input + EQ modes', 'Wireless subwoofer'],
    specs: [
      ['Power', '150W RMS'],
      ['Channels', '2.1'],
      ['Wireless', 'Bluetooth 5.3']
    ],
    position: 1,
    image: './public/images/electronics/Mivi Fort Sonic 150 Soundbar, 2.1 Channel, Multi-Input & EQ Modes, BT v5.3 150 W Bluetooth Soundbar  (Black, Silver, 2.1 Channel.png',
    productImageUrl: './public/images/electronics/Mivi Fort Sonic 150 Soundbar, 2.1 Channel, Multi-Input & EQ Modes, BT v5.3 150 W Bluetooth Soundbar  (Black, Silver, 2.1 Channel.png',
    availableColors: ['Black', 'Silver']
  },
  {
    id: 'tv-tcl-uhd',
    sku: 'SN-002',
    name: 'FALCON by TCL U65 43" 4K Google TV 2025',
    category: 'Electronics',
    brand: 'TCL',
    price: 499.0,
    mrp: 699.0,
    badge: 'Best Seller',
    description: 'Ultra HD 4K Google TV with vivid picture, Dolby support, and streaming apps.',
    bullets: ['4K UHD', 'Google TV', 'Dolby Vision/Atmos', 'Built-in Chromecast'],
    specs: [
      ['Resolution', '3840x2160'],
      ['OS', 'Google TV'],
      ['Size', '43 inch']
    ],
    position: 2,
    image: './public/images/electronics/FALCON by TCL U65 108 cm (43 inch) Ultra HD (4K) LED Smart Google TV 2025.png',
    productImageUrl: './public/images/electronics/FALCON by TCL U65 108 cm (43 inch) Ultra HD (4K) LED Smart Google TV 2025.png'
  },
  {
    id: 'trimmer-philips',
    sku: 'SN-003',
    name: 'PHILIPS BT3101/15 Beard Trimmer',
    category: 'Electronics',
    brand: 'Philips',
    price: 29.0,
    mrp: 39.0,
    badge: 'Trending',
    description: 'Lift & Trim tech for even trims, 45 min runtime, 10 length settings.',
    bullets: ['45 min cordless', '10 length settings', 'Lift & Trim tech', 'USB charging'],
    specs: [
      ['Runtime', '45 min'],
      ['Settings', '10'],
      ['Charging', 'USB']
    ],
    position: 3,
    image: './public/images/electronics/PHILIPS BT310115, Lift & Trim Tech, Effortless Even Trim Trimmer 45 min Runtime 10 Length Settings  (White).png',
    productImageUrl: './public/images/electronics/PHILIPS BT310115, Lift & Trim Tech, Effortless Even Trim Trimmer 45 min Runtime 10 Length Settings  (White).png',
    availableColors: ['White', 'Black']
  },
  {
    id: 'headphones-jbl',
    sku: 'SN-004',
    name: 'JBL Tune 770NC Wireless ANC Headphones',
    category: 'Electronics',
    brand: 'JBL',
    price: 119.0,
    mrp: 149.0,
    badge: 'Deal',
    description: 'Over-ear ANC headphones with 70 hrs battery and speed charge.',
    bullets: ['ANC with transparency', '70 hrs battery', 'Speed charge 5 min = 3 hrs', 'Multipoint BT'],
    specs: [
      ['Battery', 'Up to 70 hrs'],
      ['Charging', 'Speed charge'],
      ['ANC', 'Active']
    ],
    position: 4,
    image: './public/images/electronics/JBL Tune 770NC Wireless Over Ear ANC Headphones with Mic, Upto 70 Hrs Battery, Speed Charge  5 min Charge Gives up to 3H of Playback.png',
    productImageUrl: './public/images/electronics/JBL Tune 770NC Wireless Over Ear ANC Headphones with Mic, Upto 70 Hrs Battery, Speed Charge  5 min Charge Gives up to 3H of Playback.png',
    availableColors: ['Black', 'Blue', 'White']
  },
  {
    id: 'pixel-10-pro',
    sku: 'SN-005',
    name: 'Google Pixel 10 Pro (Moonstone, 256 GB)',
    category: 'Mobiles',
    brand: 'Google',
    price: 999.0,
    mrp: 1099.0,
    badge: 'Best Seller',
    description: 'Flagship Pixel with Gemini features, pro camera, and smooth display.',
    bullets: ['Gemini on-device', 'Pro camera', 'All-day battery', '120Hz display'],
    specs: [
      ['Storage', '256 GB'],
      ['RAM', '16 GB'],
      ['Display', '120Hz AMOLED']
    ],
    position: 5,
    image: './public/images/mobiles/Google Pixel 10 Pro (Moonstone, 256 GB)  (16 GB RAM).png',
    productImageUrl: './public/images/mobiles/Google Pixel 10 Pro (Moonstone, 256 GB)  (16 GB RAM).png',
    availableColors: ['Moonstone', 'Obsidian', 'Porcelain', 'Hazel']
  },
  {
    id: 'iphone-16',
    sku: 'SN-006',
    name: 'Apple iPhone 16 (Black, 128 GB)',
    category: 'Mobiles',
    brand: 'Apple',
    price: 899.0,
    mrp: 999.0,
    badge: 'Trending',
    description: 'Latest iPhone with advanced cameras and smooth performance.',
    bullets: ['Advanced dual camera', 'A-series performance', 'iOS ecosystem', 'OLED display'],
    specs: [
      ['Storage', '128 GB'],
      ['Display', 'OLED'],
      ['Security', 'Face ID']
    ],
    position: 6,
    image: './public/images/mobiles/Apple iPhone 16 (Black, 128 GB).png',
    productImageUrl: './public/images/mobiles/Apple iPhone 16 (Black, 128 GB).png',
    availableColors: ['Black', 'Blue', 'Green', 'Pink', 'Yellow']
  },
  {
    id: 'galaxy-s28',
    sku: 'SN-007',
    name: 'Samsung Galaxy S28',
    category: 'Mobiles',
    brand: 'Samsung',
    price: 949.0,
    mrp: 1049.0,
    badge: 'Deal',
    description: 'Premium Galaxy with pro-grade camera and S-series performance.',
    bullets: ['Dynamic AMOLED', 'Pro camera system', 'Fast charging', 'One UI'],
    specs: [
      ['Display', 'AMOLED'],
      ['Camera', 'Pro-grade'],
      ['Charging', 'Fast']
    ],
    position: 7,
    image: './public/images/mobiles/Samsung Galaxy S28.png',
    productImageUrl: './public/images/mobiles/Samsung Galaxy S28.png',
    availableColors: ['Phantom Black', 'Cream', 'Green', 'Lavender']
  },
  {
    id: 'oppo-find-x9',
    sku: 'SN-008',
    name: 'OPPO Find X9',
    category: 'Mobiles',
    brand: 'OPPO',
    price: 799.0,
    mrp: 899.0,
    badge: 'Trending',
    description: 'Sleek design with powerful camera array and fast charging.',
    bullets: ['Triple camera', 'Fast charge', 'AMOLED display', 'Premium finish'],
    specs: [
      ['Camera', 'Triple'],
      ['Display', 'AMOLED'],
      ['Charging', 'Fast']
    ],
    position: 8,
    image: './public/images/mobiles/OPPO Find X9.png',
    productImageUrl: './public/images/mobiles/OPPO Find X9.png',
    availableColors: ['Black', 'Gold', 'Silver']
  },
  {
    id: 'sneakers-yoho',
    sku: 'SN-009',
    name: 'YOHO Colored Suede Fashion Sneakers',
    category: 'Fashion',
    brand: 'YOHO',
    price: 69.0,
    mrp: 89.0,
    badge: 'Deal',
    description: 'Comfortable suede sneakers with colorful accents.',
    bullets: ['Suede upper', 'Cushioned sole', 'Casual wear', 'Lightweight'],
    specs: [
      ['Material', 'Suede'],
      ['Type', 'Sneakers'],
      ['Use', 'Casual']
    ],
    position: 9,
    image: './public/images/fashion/YOHO Colored Suede Fashion Sneakers.png',
    productImageUrl: './public/images/fashion/YOHO Colored Suede Fashion Sneakers.png',
    availableSizes: ['7', '8', '9', '10', '11'],
    availableColors: ['Multi-color', 'Blue', 'Red']
  },
  {
    id: 'denim-jacket',
    sku: 'SN-010',
    name: 'Men Solid Denim Jacket',
    category: 'Fashion',
    brand: 'DenimCo',
    price: 79.0,
    mrp: 109.0,
    badge: 'Best Seller',
    description: 'Classic denim jacket with solid wash and structured fit.',
    bullets: ['Solid wash', 'Button closure', 'Chest pockets', 'Everyday wear'],
    specs: [
      ['Material', 'Denim'],
      ['Fit', 'Regular'],
      ['Closure', 'Buttons']
    ],
    position: 10,
    image: './public/images/fashion/Men Solid Denim Jacket.png',
    productImageUrl: './public/images/fashion/Men Solid Denim Jacket.png',
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    availableColors: ['Blue', 'Black']
  },
  {
    id: 'striped-tee',
    sku: 'SN-011',
    name: 'Men Striped Zip Neck Tshirt',
    category: 'Fashion',
    brand: 'ActiveWear',
    price: 39.0,
    mrp: 59.0,
    badge: 'Trending',
    description: 'Striped zip-neck tee with sporty collar.',
    bullets: ['Zip neck', 'Striped design', 'Soft fabric', 'Casual sporty'],
    specs: [
      ['Material', 'Cotton blend'],
      ['Neck', 'Zip'],
      ['Fit', 'Regular']
    ],
    position: 11,
    image: './public/images/fashion/Men Striped ZiP Neck Tshirt.png',
    productImageUrl: './public/images/fashion/Men Striped ZiP Neck Tshirt.png',
    availableSizes: ['S', 'M', 'L', 'XL'],
    availableColors: ['Navy/White', 'Black/Grey', 'Red/Blue']
  },
  {
    id: 'jeans-loose-fit',
    sku: 'SN-012',
    name: 'Men Loose Fit Mid Rise Light Blue Jeans',
    category: 'Fashion',
    brand: 'UrbanFit',
    price: 59.0,
    mrp: 79.0,
    badge: 'Deal',
    description: 'Relaxed mid-rise jeans in light blue wash.',
    bullets: ['Loose fit', 'Mid rise', 'Light blue wash', 'Comfort stretch'],
    specs: [
      ['Fit', 'Loose'],
      ['Rise', 'Mid'],
      ['Wash', 'Light blue']
    ],
    position: 12,
    image: './public/images/fashion/Men Loose Fit Mid Rise Light Blue Jeans.png',
    productImageUrl: './public/images/fashion/Men Loose Fit Mid Rise Light Blue Jeans.png',
    availableSizes: ['28', '30', '32', '34', '36', '38'],
    availableColors: ['Light Blue', 'Dark Blue', 'Black']
  },
  {
    id: 'key-holder',
    sku: 'SN-013',
    name: 'Premium Home Decor Wood Key Holder (7 Hooks)',
    category: 'Home',
    brand: 'Home Decor',
    price: 24.0,
    mrp: 34.0,
    badge: 'Trending',
    description: 'Wall-mounted wooden key holder with 7 hooks and engraved design.',
    bullets: ['7 hooks', 'Wood build', 'Wall mount', 'Decorative engraving'],
    specs: [
      ['Hooks', '7'],
      ['Material', 'Wood'],
      ['Mount', 'Wall']
    ],
    position: 13,
    image: './public/images/home/Premium HomePremium Home is Our Happy Place for Home and Office Decor Wood Key Holder  (7 Hooks, Brown).png',
    productImageUrl: './public/images/home/Premium HomePremium Home is Our Happy Place for Home and Office Decor Wood Key Holder  (7 Hooks, Brown).png',
    availableColors: ['Brown', 'Black']
  },
  {
    id: 'home-temple',
    sku: 'SN-014',
    name: 'Homewey Decor Engineered Wood Home Temple',
    category: 'Home',
    brand: 'Homewey',
    price: 119.0,
    mrp: 149.0,
    badge: 'Best Seller',
    description: 'Engineered wood temple with bells and storage shelf, DIY assembly.',
    bullets: ['Engineered wood', 'DIY assembly', 'Includes bells', 'Compact size'],
    specs: [
      ['Material', 'Engineered wood'],
      ['Assembly', 'DIY'],
      ['Height', '47']
    ],
    position: 14,
    image: './public/images/home/homewey decor Engineered Wood Home Temple  (Height 47, DIY(Do-It-Yourself)).png',
    productImageUrl: './public/images/home/homewey decor Engineered Wood Home Temple  (Height 47, DIY(Do-It-Yourself)).png',
    availableColors: ['Walnut', 'Teak']
  },
  {
    id: 'cookware-impex',
    sku: 'SN-015',
    name: 'IMPEX 6 Pcs Nonstick Granite Cookware Set',
    category: 'Home',
    brand: 'Impex',
    price: 89.0,
    mrp: 129.0,
    badge: 'Deal',
    description: '6-piece nonstick granite cookware set with induction base.',
    bullets: ['6-piece set', 'Granite nonstick', 'Induction bottom', 'Gift ready'],
    specs: [
      ['Pieces', '6'],
      ['Material', 'Granite nonstick'],
      ['Base', 'Induction']
    ],
    position: 15,
    image: './public/images/home/IMPEX 6 Pcs Nonstick Granite FKTM 6 Festival Gift Set Induction Bottom Non-Stick Coated Cookware Set  (Aluminium, 6 - Piece).png',
    productImageUrl: './public/images/home/IMPEX 6 Pcs Nonstick Granite FKTM 6 Festival Gift Set Induction Bottom Non-Stick Coated Cookware Set  (Aluminium, 6 - Piece).png',
    availableColors: ['Red', 'Black', 'Grey']
  },
  {
    id: 'makeup-brush-set',
    sku: 'SN-016',
    name: 'MINARA Makeup Brush Applicator Set of 15',
    category: 'Beauty',
    brand: 'MINARA',
    price: 39.0,
    mrp: 59.0,
    badge: 'Deal',
    description: '15-piece makeup brush set with premium leather pouch.',
    bullets: ['15 brushes', 'Leather pouch', 'Soft bristles', 'Face & eye set'],
    specs: [
      ['Pieces', '15'],
      ['Case', 'Leather pouch'],
      ['Use', 'Face and eye']
    ],
    position: 16,
    image: './public/images/beauty/MINARA Makeup Brush Applicator Set of 15 with Premium Leather Pouch  (Pack of 15).png',
    productImageUrl: './public/images/beauty/MINARA Makeup Brush Applicator Set of 15 with Premium Leather Pouch  (Pack of 15).png',
    availableColors: ['Black', 'Pink']
  },
  {
    id: 'eye-cream',
    sku: 'SN-017',
    name: 'Minimalist Vitamin K + Retinal 01% Eye Cream',
    category: 'Beauty',
    brand: 'Minimalist',
    price: 15.0,
    mrp: 22.0,
    badge: 'Trending',
    description: 'Eye cream for dark circles and puffiness with Vitamin K & Retinal.',
    bullets: ['Vitamin K + Retinal', 'Reduces dark circles', 'For puffiness', 'Derm-tested'],
    specs: [
      ['Use', 'Eye area'],
      ['Key', 'Vitamin K + Retinal'],
      ['Size', '14g']
    ],
    position: 17,
    image: './public/images/beauty/Minimalist Vitamin K + Retinal 01% Eye Cream for under-eye dark circles & Puffiness  (14 g).png',
    productImageUrl: './public/images/beauty/Minimalist Vitamin K + Retinal 01% Eye Cream for under-eye dark circles & Puffiness  (14 g).png'
  },
  {
    id: 'ponds-facewash',
    sku: 'SN-018',
    name: "POND's Bright Beauty Face Wash 200g",
    category: 'Beauty',
    brand: "POND's",
    price: 9.0,
    mrp: 14.0,
    badge: 'Best Seller',
    description: 'Niacinamide facewash for brightness and anti-dullness.',
    bullets: ['Niacinamide (B3)', 'Anti-dullness', 'Glass skin shine', '200g tube'],
    specs: [
      ['Ingredient', 'Niacinamide B3'],
      ['Benefit', 'Anti-dullness'],
      ['Size', '200g']
    ],
    position: 18,
    image: "/images/beauty/POND's Bright Beauty Infused with vitamin B3 & Niacinamide for Anti Dullness & glass skin shine Face Wash  (200 g).png",
    productImageUrl: "/images/beauty/POND's Bright Beauty Infused with vitamin B3 & Niacinamide for Anti Dullness & glass skin shine Face Wash  (200 g).png"
  }
];

// Make PRODUCTS available globally for client.js
if (typeof window !== 'undefined') {
  window.PRODUCTS = PRODUCTS;
}
