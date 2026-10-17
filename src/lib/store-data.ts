export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  accent: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  badge?: string;
  featured?: boolean;
  images: string[];
  colors: string[];
  sizes: string[];
  description: string;
  material: string;
  fit: string;
  care: string;
  shipping: string;
};

export const announcement =
  "🇳🇬 Free express delivery across Lagos & Abuja on orders over ₦100,000 • Paystack & Instant Transfer supported";

export const categories: Category[] = [
  {
    id: "graphic-tees",
    slug: "graphic-tees",
    name: "Oversized Graphic T-shirts",
    description: "280 GSM heavyweight drop-shoulder tees with bespoke high-density typography.",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
    accent: "#C49A78",
  },
  {
    id: "plain-tees",
    slug: "plain-tees",
    name: "Premium Plain T-shirts",
    description: "260 GSM combed single-jersey staples with resilient bound ribbed collars.",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    accent: "#D8B99A",
  },
  {
    id: "hoodies",
    slug: "hoodies",
    name: "Streetwear Hoodies",
    description: "450 GSM luxury brushed French terry pullovers with stringless architectural hoods.",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80",
    accent: "#5B4032",
  },
  {
    id: "blazers",
    slug: "blazers",
    name: "Lightweight Jackets or Blazers",
    description: "Unstructured soft-shoulder silhouettes crafted in breathable tropical wool & linen.",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80",
    accent: "#C49A78",
  },
  {
    id: "cargos",
    slug: "cargos",
    name: "Cargo Trousers",
    description: "Durable cotton ripstop pants with 3D modular utility pockets and hem adjusters.",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80",
    accent: "#3D2B22",
  },
  {
    id: "jeans",
    slug: "jeans",
    name: "Relaxed-fit Jeans",
    description: "13.5 oz ring-spun vintage wash denim engineered to stack effortlessly.",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
    accent: "#8B7355",
  },
  {
    id: "co-ords",
    slug: "co-ords",
    name: "Matching Co-ord Sets",
    description: "European washed linen camp-collar shirt & tailored short combinations.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    accent: "#D8B99A",
  },
  {
    id: "shirts",
    slug: "shirts",
    name: "Casual Button-up Shirts",
    description: "Breathable double-gauze crinkled cotton with natural mother-of-pearl buttons.",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80",
    accent: "#E8D5C0",
  },
  {
    id: "women-tops",
    slug: "women-tops",
    name: "Women's Stylish Tops",
    description: "Sculpted micro-ribbed modal with asymmetric one-shoulder drapes and clean hems.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
    accent: "#C49A78",
  },
  {
    id: "dresses",
    slug: "dresses",
    name: "Minimalist Dresses",
    description: "Bias-cut 100% mulberry silk column dresses with fluid movement for tropical evenings.",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    accent: "#3D2B22",
  },
  {
    id: "accessories",
    slug: "accessories",
    name: "Sneakers or Fashion Accessories",
    description: "Italian calfskin low-tops with caramel suede accents and artisanal leather carryalls.",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80",
    accent: "#5B4032",
  },
];

export const products: Product[] = [
  {
    id: "archives-heavyweight-graphic-tee",
    slug: "archives-heavyweight-graphic-tee",
    name: "Archives Heavyweight Graphic T-Shirt",
    category: "graphic-tees",
    price: 28500,
    compareAtPrice: 35000,
    badge: "Hot Drop",
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=900&q=80",
    ],
    colors: ["Washed Caramel", "Pitch Black", "Vintage Ivory"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "Engineered with a substantial 280 GSM combed organic cotton body, this piece combines an authentic boxy drop-shoulder cut with archival high-density typographic silkscreening. Built to withstand continuous wash cycles while retaining its structured drape.",
    material: "100% Heavy Combed Cotton (280 GSM)",
    fit: "Oversized, relaxed boxy cut with dropped shoulders",
    care: "Machine wash cold inside-out. Line dry recommended.",
    shipping: "Same-day dispatch in Lagos & Abuja. 2-3 days nationwide.",
  },
  {
    id: "rebel-signature-plain-tee",
    slug: "rebel-signature-plain-tee",
    name: "Rebel Signature Plain Heavyweight Tee",
    category: "plain-tees",
    price: 22000,
    compareAtPrice: 26000,
    badge: "Core Essential",
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=900&q=80",
    ],
    colors: ["Warm Cream", "Chocolate Brown", "Heather Grey", "Onyx"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "The definitive wardrobe cornerstone. Built from 260 GSM single jersey with an anti-sag 1x1 bound rib collar that stays crisp throughout the day. Pre-shrunk with a clean, modern silhouette that wears seamlessly under blazers or on its own.",
    material: "100% Long-Staple Ring-Spun Cotton (260 GSM)",
    fit: "Tailored regular fit with clean drape",
    care: "Cool wash at 30°C. Reshape while damp.",
    shipping: "In stock. Dispatch within 24 hours.",
  },
  {
    id: "nocturne-heavy-fleece-hoodie",
    slug: "nocturne-heavy-fleece-hoodie",
    name: "Nocturne 450 GSM Heavy Fleece Hoodie",
    category: "hoodies",
    price: 64000,
    compareAtPrice: 78000,
    badge: "Bestseller",
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=900&q=80",
    ],
    colors: ["Deep Cocoa", "Desert Sand", "Carbon Black"],
    sizes: ["S", "M", "L", "XL"],
    description:
      "A testament to heavyweight streetwear engineering. Weighing in at 450 GSM of ultra-dense brushed French terry, this hoodie features an architectural double-layer hood without drawstrings for a streamlined sculptural profile, complemented by blind-stitched kangaroo pockets.",
    material: "450 GSM Heavy French Terry (85% Organic Cotton, 15% Recycled Poly)",
    fit: "Boxy streetwear fit with ribbed hem and cuffs",
    care: "Gentle wash cold. Do not tumble dry.",
    shipping: "Dispatches from Lagos Fulfilment Hub.",
  },
  {
    id: "atelier-unstructured-blazer",
    slug: "atelier-unstructured-blazer",
    name: "Atelier Relaxed Unstructured Blazer",
    category: "blazers",
    price: 95000,
    compareAtPrice: 115000,
    badge: "Editorial Pick",
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=900&q=80",
    ],
    colors: ["Toasted Caramel", "Raw Ivory", "Midnight Navy"],
    sizes: ["38R", "40R", "42R", "44R"],
    description:
      "Effortless tailoring reimagined for tropical and temperate climates. Designed with zero shoulder padding and half-canvassed construction in a lightweight tropical wool & linen weave. Features patch pockets and genuine horn buttons for modern elegance.",
    material: "55% Tropical Wool, 45% Natural Linen",
    fit: "Relaxed contemporary tailored fit with soft natural shoulders",
    care: "Dry clean only. Steam refresh between wears.",
    shipping: "Complimentary Express Delivery in garment protective bag.",
  },
  {
    id: "nomad-multi-pocket-cargos",
    slug: "nomad-multi-pocket-cargos",
    name: "Nomad Multi-Pocket Cargo Trousers",
    category: "cargos",
    price: 52000,
    compareAtPrice: 62000,
    badge: "Trending",
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    ],
    colors: ["Military Khaki", "Dark Coffee", "Matte Black"],
    sizes: ["30", "32", "34", "36", "38"],
    description:
      "Crafted from heavy cross-woven ripstop cotton for exceptional durability with articulated knee darts and 6 utility cargo pockets with hidden snaps. Includes bungee hem toggles to switch seamlessly between straight-leg drape and tapered sneaker cuffs.",
    material: "100% Heavyweight Ripstop Cotton",
    fit: "Relaxed straight fit with adjustable bungee ankle toggles",
    care: "Cold machine wash with similar colours. Warm iron.",
    shipping: "Standard dispatch nationwide via GIG Logistics.",
  },
  {
    id: "heritage-washed-denim",
    slug: "heritage-washed-denim",
    name: "Heritage Washed Relaxed-Fit Denim",
    category: "jeans",
    price: 58000,
    compareAtPrice: 69000,
    badge: "New Season",
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=900&q=80",
    ],
    colors: ["Vintage Sun-Washed", "Raw Indigo", "Faded Bone"],
    sizes: ["30", "32", "34", "36"],
    description:
      "Cut from rigid 13.5 oz non-stretch selvedge cotton denim with artisanal enzyme whisker washing. Designed with a medium rise, roomy thighs, and a subtle straight leg designed to puddle naturally over sneakers or boots.",
    material: "100% Ring-Spun Cotton Denim (13.5 oz)",
    fit: "Relaxed mid-rise with straight leg opening",
    care: "Wash inside-out in cold water. Air dry.",
    shipping: "Dispatches within 24 hours.",
  },
  {
    id: "solstice-linen-coord-set",
    slug: "solstice-linen-coord-set",
    name: "Solstice Resort Linen Two-Piece Co-Ord",
    category: "co-ords",
    price: 75000,
    compareAtPrice: 88000,
    badge: "Exclusive",
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    ],
    colors: ["Buttercream & Tan", "Espresso", "Terracotta"],
    sizes: ["S", "M", "L", "XL"],
    description:
      "A complete summer uniform comprising an open camp-collar shirt and pleated drawstring shorts. Crafted from European certified linen blended with soft organic cotton to achieve breezy breathability without excessive wrinkling.",
    material: "65% Washed European Linen, 35% Organic Cotton",
    fit: "Breezy relaxed vacation fit with elasticated drawstring waist",
    care: "Machine wash cold on delicate cycle. Hang to dry.",
    shipping: "Includes matching two-piece set in presentation box.",
  },
  {
    id: "aura-textured-cotton-shirt",
    slug: "aura-textured-cotton-shirt",
    name: "Aura Textured Cotton Gauze Shirt",
    category: "shirts",
    price: 38000,
    compareAtPrice: 45000,
    badge: "Restocked",
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80",
    ],
    colors: ["Cream Oat", "Warm Cocoa", "Olive Sand"],
    sizes: ["S", "M", "L", "XL"],
    description:
      "Crafted with Japanese-style double-gauze crinkled cotton that floats lightly against the skin. Completed with mother-of-pearl buttons and convertible camp collar for effortless transition from workday to rooftop evening drinks.",
    material: "100% Organic Double-Gauze Cotton",
    fit: "Fluid relaxed silhouette with dropped shoulder seams",
    care: "Hand or machine wash cold. Light iron or steam.",
    shipping: "Lagos & Abuja 24h delivery.",
  },
  {
    id: "sculpt-asymmetrical-draped-top",
    slug: "sculpt-asymmetrical-draped-top",
    name: "Sculpt Asymmetrical Draped Ribbed Top",
    category: "women-tops",
    price: 32000,
    compareAtPrice: 38000,
    badge: "Trending",
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    ],
    colors: ["Caramel Nude", "Rich Chocolate", "Alabaster White"],
    sizes: ["XS", "S", "M", "L"],
    description:
      "Sculptural minimalism at its peak. Designed in ultra-soft high-gauge micro-ribbed modal with an asymmetric one-shoulder twist and internal double-lined bust support. Hugs natural curves comfortably without shifting.",
    material: "92% Micro-Ribbed Modal, 8% Elastane",
    fit: "Form-fitting contour silhouette with high stretch memory",
    care: "Hand wash cold. Flat dry to preserve garment shape.",
    shipping: "Same-day dispatch in Lagos.",
  },
  {
    id: "seraphina-silk-column-dress",
    slug: "seraphina-silk-column-dress",
    name: "Seraphina Minimalist Silk Column Dress",
    category: "dresses",
    price: 68000,
    compareAtPrice: 82000,
    badge: "Luxury Edit",
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
    ],
    colors: ["Champagne Ivory", "Smoked Espresso", "Deep Bronze"],
    sizes: ["XS", "S", "M", "L"],
    description:
      "Pure liquid luxury. Cut on the bias from 100% mulberry silk satin (19mm momme weight) with delicate adjustable rouleau straps, subtle cowl neckline, and a gentle side slit that glides gracefully with every step.",
    material: "100% Grade 6A Mulberry Silk Satin",
    fit: "Bias-cut fluid drape conforming to curves",
    care: "Specialist dry clean or delicate cool silk wash.",
    shipping: "Delivered in signature protective keepsake box.",
  },
  {
    id: "architecte-low-top-sneakers",
    slug: "architecte-low-top-sneakers",
    name: "Architecte Low-Top Calfskin Sneakers",
    category: "accessories",
    price: 85000,
    compareAtPrice: 105000,
    badge: "Crafted in Italy",
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80",
    ],
    colors: ["Caramel & Off-White", "Chocolate Mono", "Pure White"],
    sizes: ["40", "41", "42", "43", "44", "45"],
    description:
      "Handcrafted in Civitanova Marche using supple Italian full-grain calf leather paired with velvety caramel suede overlays. Constructed on an Margom-style vulcanized rubber cupsole with memory foam leather footbeds for supreme walking comfort.",
    material: "Full-Grain Italian Calf Leather, Suede Overlays, Rubber Cupsole",
    fit: "True to EU size. If between sizes, size down.",
    care: "Wipe with damp cloth. Apply neutral leather balm regularly.",
    shipping: "Includes spare cotton laces and dust bag.",
  },
  {
    id: "parisian-leather-crossbody",
    slug: "parisian-leather-crossbody",
    name: "Parisian Caramel Leather Crossbody",
    category: "accessories",
    price: 46000,
    compareAtPrice: 55000,
    badge: "Boutique Favorite",
    featured: false,
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
    ],
    colors: ["Caramel Tan", "Rich Espresso", "Ivory Cream"],
    sizes: ["One Size"],
    description:
      "An understated everyday companion crafted in vegetable-tanned grain leather with brushed matte brass hardware. Features magnetic flap closure, dual internal compartments, and an adjustable shoulder strap for crossbody or shoulder styling.",
    material: "Vegetable-Tanned Cowhide Leather, Suede Lining",
    fit: "Dimensions: 22cm x 16cm x 7cm",
    care: "Condition with natural leather balm periodically.",
    shipping: "Includes cotton dust bag.",
  },
];

export const featuredProducts = products.filter((product) => product.featured);

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getRelatedProducts(currentProductId: string) {
  return products.filter((product) => product.id !== currentProductId).slice(0, 4);
}

export function formatPrice(value: number): string {
  return (
    "₦" +
    new Intl.NumberFormat("en-NG", {
      maximumFractionDigits: 0,
    }).format(value)
  );
}
