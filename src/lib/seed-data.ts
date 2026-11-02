/**
 * STARTER CATALOGUE — the products the platform itself sells (Sold by Rebel Fashion).
 *
 * Rebel Fashion sells all kinds of clothing; the current collection is 30 modern
 * kaftans. There are no demo sellers, demo orders or fake listings: marketplace
 * sellers sign up through /seller/signup and their listings go through admin review.
 *
 * Photos live in /public/products (generated product shots: flat lays, hangers and
 * headless mannequins). A colour without its own `image` shows the main photo, and
 * the swatch shows the colour. Drop a real colour photo in by filling `image`.
 *
 * The mock API (src/lib/api/mock.ts) copies this catalogue into the browser's
 * localStorage on first visit. Bump SEED_VERSION after editing so browsers reload it.
 * With a real backend, import these rows into the products table once (see BACKEND.md).
 */

import { PLATFORM_SELLER_ID, SITE_NAME } from "@/lib/config";
import type { Product } from "@/lib/types";

export const SEED_VERSION = 5;

const MEN_SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];
const WOMEN_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const UNI_SIZES = ["S", "M", "L", "XL", "XXL"];
const KIDS_SIZES = ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-12Y"];

/** Stable "listed on" dates so the server and browser render the same order. */
function day(index: number): string {
  return new Date(Date.UTC(2026, 9, 1, 9) + index * 3600_000).toISOString();
}

type CatalogueInput = Omit<Product, "slug" | "status" | "sellerId" | "sellerName" | "category">;

function product(input: CatalogueInput): Product {
  return {
    ...input,
    // The house collection is kaftans for now; more categories will follow.
    category: "kaftans",
    slug: input.id,
    sellerId: PLATFORM_SELLER_ID,
    sellerName: SITE_NAME,
    status: "approved",
  };
}

export const seedProducts: Product[] = [
  product({
    "id": "classic-white-cotton-kaftan",
    "name": "Classic White Cotton Kaftan",
    "description": "A clean, everyday kaftan in crisp white cotton with a short button placket and side slits. Wear it alone or as the matching set with plain trousers.",
    "productType": "Kaftan",
    "gender": "men",
    "price": 38000,
    "badge": "Bestseller",
    "featured": true,
    "typeOption": {
      "label": "Set",
      "values": [
        "Top only",
        "Top + trousers"
      ]
    },
    "images": [
      "/products/classic-white-cotton-kaftan.webp"
    ],
    "colors": [
      {
        "name": "White",
        "hex": "#F7F5F0",
        "image": "/products/classic-white-cotton-kaftan.webp"
      },
      {
        "name": "Sky Blue",
        "hex": "#8DB5DE"
      },
      {
        "name": "Black",
        "hex": "#1E1E1E"
      }
    ],
    "sizes": MEN_SIZES,
    "stock": 24,
    "material": "Breathable cotton poplin",
    "fit": "Relaxed straight cut, knee length, side slits",
    "care": "Machine wash cold, iron on medium",
    "createdAt": day(0)
  }),
  product({
    "id": "charcoal-linen-kaftan",
    "name": "Charcoal Linen Kaftan",
    "description": "A soft washed-linen kaftan with a neat band collar and long sleeves. Light enough for Abuja afternoons, smart enough for evening plans.",
    "productType": "Kaftan",
    "gender": "men",
    "price": 42000,
    "featured": true,
    "typeOption": {
      "label": "Length",
      "values": [
        "Short",
        "Long"
      ]
    },
    "images": [
      "/products/charcoal-linen-kaftan.webp"
    ],
    "colors": [
      {
        "name": "Charcoal",
        "hex": "#4A4A4A",
        "image": "/products/charcoal-linen-kaftan.webp"
      },
      {
        "name": "Stone",
        "hex": "#CFC6B5"
      },
      {
        "name": "Navy",
        "hex": "#1F2A44"
      }
    ],
    "sizes": MEN_SIZES,
    "stock": 18,
    "material": "100% washed linen",
    "fit": "Regular fit with band collar",
    "care": "Machine wash cold, line dry",
    "createdAt": day(1)
  }),
  product({
    "id": "sand-everyday-jalabiya",
    "name": "Sand Everyday Jalabiya",
    "description": "An easy ankle-length jalabiya in a warm sand tone. Collarless neck, long sleeves and a relaxed cut for Jumu'ah or everyday wear.",
    "productType": "Jalabiya",
    "gender": "men",
    "price": 35000,
    "featured": true,
    "typeOption": {
      "label": "Length",
      "values": [
        "Regular",
        "Tall"
      ]
    },
    "images": [
      "/products/sand-everyday-jalabiya.webp"
    ],
    "colors": [
      {
        "name": "Sand",
        "hex": "#D6BC94",
        "image": "/products/sand-everyday-jalabiya.webp"
      },
      {
        "name": "White",
        "hex": "#F7F5F0"
      },
      {
        "name": "Grey",
        "hex": "#A6A6A6"
      }
    ],
    "sizes": MEN_SIZES,
    "stock": 30,
    "material": "Cotton-poly blend",
    "fit": "Loose ankle-length cut",
    "care": "Machine wash 30°C, low iron",
    "createdAt": day(2)
  }),
  product({
    "id": "navy-collared-thobe",
    "name": "Navy Collared Thobe",
    "description": "A sharp thobe with a shirt collar and full button placket in deep navy. Clean lines, no fuss.",
    "productType": "Thobe",
    "gender": "men",
    "price": 39000,
    "typeOption": {
      "label": "Length",
      "values": [
        "Regular",
        "Tall"
      ]
    },
    "images": [
      "/products/navy-collared-thobe.webp"
    ],
    "colors": [
      {
        "name": "Navy",
        "hex": "#1F2A44",
        "image": "/products/navy-collared-thobe.webp"
      },
      {
        "name": "Brown",
        "hex": "#5A3A22"
      },
      {
        "name": "White",
        "hex": "#F7F5F0"
      }
    ],
    "sizes": MEN_SIZES,
    "stock": 20,
    "material": "Fine cotton twill",
    "fit": "Tailored ankle-length thobe with shirt collar",
    "care": "Machine wash cold, iron inside out",
    "createdAt": day(3)
  }),
  product({
    "id": "olive-short-kaftan-shirt",
    "name": "Olive Short Kaftan Shirt",
    "description": "A hip-length kaftan shirt with a mandarin collar, cut for warm days and casual weekends. Pairs with jeans or chinos.",
    "productType": "Kaftan shirt",
    "gender": "men",
    "price": 24000,
    "badge": "New",
    "typeOption": {
      "label": "Sleeve",
      "values": [
        "Short",
        "Long"
      ]
    },
    "images": [
      "/products/olive-short-kaftan-shirt.webp"
    ],
    "colors": [
      {
        "name": "Olive",
        "hex": "#5C6B3A",
        "image": "/products/olive-short-kaftan-shirt.webp"
      },
      {
        "name": "Sand",
        "hex": "#D6BC94"
      },
      {
        "name": "Black",
        "hex": "#1E1E1E"
      }
    ],
    "sizes": MEN_SIZES,
    "stock": 35,
    "material": "Textured cotton",
    "fit": "Hip-length, relaxed",
    "care": "Machine wash cold",
    "createdAt": day(4)
  }),
  product({
    "id": "ivory-moroccan-linen-caftan",
    "name": "Ivory Moroccan Linen Caftan",
    "description": "A Moroccan-inspired caftan in soft ivory linen with a V-neck and a long row of fabric-covered buttons. Light, airy and easy to dress up.",
    "productType": "Moroccan caftan",
    "gender": "women",
    "price": 52000,
    "compareAtPrice": 58000,
    "featured": true,
    "typeOption": {
      "label": "Length",
      "values": [
        "Midi",
        "Maxi"
      ]
    },
    "images": [
      "/products/ivory-moroccan-linen-caftan.webp"
    ],
    "colors": [
      {
        "name": "Ivory",
        "hex": "#F2ECDF",
        "image": "/products/ivory-moroccan-linen-caftan.webp"
      },
      {
        "name": "Blush",
        "hex": "#F2C9C4"
      },
      {
        "name": "Sage",
        "hex": "#9CAF94"
      }
    ],
    "sizes": WOMEN_SIZES,
    "stock": 14,
    "material": "Linen-viscose blend",
    "fit": "Flowing A-line with wide sleeves",
    "care": "Hand wash or gentle cycle, cool iron",
    "createdAt": day(5)
  }),
  product({
    "id": "terracotta-caftan-dress",
    "name": "Terracotta Caftan Dress",
    "description": "A rich terracotta caftan dress with wide bell sleeves and a simple round neck. One-piece easy dressing in a warm earthy colour.",
    "productType": "Moroccan caftan",
    "gender": "women",
    "price": 48000,
    "typeOption": {
      "label": "Length",
      "values": [
        "Midi",
        "Maxi"
      ]
    },
    "images": [
      "/products/terracotta-caftan-dress.webp"
    ],
    "colors": [
      {
        "name": "Terracotta",
        "hex": "#B5532E",
        "image": "/products/terracotta-caftan-dress.webp"
      },
      {
        "name": "Mustard",
        "hex": "#D4A23A"
      },
      {
        "name": "Black",
        "hex": "#1E1E1E"
      }
    ],
    "sizes": WOMEN_SIZES,
    "stock": 16,
    "material": "Crepe",
    "fit": "Relaxed, bell sleeves",
    "care": "Gentle wash, line dry",
    "createdAt": day(6)
  }),
  product({
    "id": "emerald-satin-abaya-kaftan",
    "name": "Emerald Satin Abaya Kaftan",
    "description": "A fluid satin abaya-kaftan in deep emerald with wide sleeves and a self tie belt. Made for weddings, dinners and Eid.",
    "productType": "Abaya kaftan",
    "gender": "women",
    "price": 58000,
    "badge": "New",
    "featured": true,
    "typeOption": {
      "label": "Style",
      "values": [
        "Open front",
        "Closed"
      ]
    },
    "images": [
      "/products/emerald-satin-abaya-kaftan.webp"
    ],
    "colors": [
      {
        "name": "Emerald",
        "hex": "#1F6B45",
        "image": "/products/emerald-satin-abaya-kaftan.webp"
      },
      {
        "name": "Black",
        "hex": "#1E1E1E"
      },
      {
        "name": "Wine",
        "hex": "#6E1E2A"
      }
    ],
    "sizes": WOMEN_SIZES,
    "stock": 12,
    "material": "Satin-back crepe",
    "fit": "Loose floor-length with tie belt",
    "care": "Dry clean or cool hand wash",
    "createdAt": day(7)
  }),
  product({
    "id": "black-crepe-abaya-kaftan",
    "name": "Black Crepe Abaya Kaftan",
    "description": "The everyday black abaya-kaftan: matte crepe, batwing sleeves and a clean round neck that never goes out of style.",
    "productType": "Abaya kaftan",
    "gender": "women",
    "price": 45000,
    "badge": "Bestseller",
    "typeOption": {
      "label": "Length",
      "values": [
        "Regular",
        "Long"
      ]
    },
    "images": [
      "/products/black-crepe-abaya-kaftan.webp"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#1E1E1E",
        "image": "/products/black-crepe-abaya-kaftan.webp"
      },
      {
        "name": "Navy",
        "hex": "#1F2A44"
      },
      {
        "name": "Mocha",
        "hex": "#6B4F3A"
      }
    ],
    "sizes": WOMEN_SIZES,
    "stock": 26,
    "material": "Matte crepe",
    "fit": "Loose batwing cut",
    "care": "Gentle wash, steam to refresh",
    "createdAt": day(8)
  }),
  product({
    "id": "blush-kimono-kaftan",
    "name": "Blush Kimono Kaftan",
    "description": "A soft kimono-style kaftan with square sleeves and a matching sash. Throw it over a dress or wear it belted.",
    "productType": "Kimono kaftan",
    "gender": "women",
    "price": 34000,
    "typeOption": {
      "label": "Length",
      "values": [
        "Short",
        "Midi"
      ]
    },
    "images": [
      "/products/blush-kimono-kaftan.webp"
    ],
    "colors": [
      {
        "name": "Blush",
        "hex": "#F2C9C4",
        "image": "/products/blush-kimono-kaftan.webp"
      },
      {
        "name": "Ivory",
        "hex": "#F2ECDF"
      },
      {
        "name": "Lilac",
        "hex": "#C3B1E1"
      }
    ],
    "sizes": WOMEN_SIZES,
    "stock": 22,
    "material": "Lightweight cotton voile",
    "fit": "Open front with sash",
    "care": "Hand wash cold",
    "createdAt": day(9)
  }),
  product({
    "id": "sage-kimono-wrap-kaftan",
    "name": "Sage Kimono Wrap Kaftan",
    "description": "A wrap kaftan in calm sage crinkle cotton, with kimono sleeves and a tie belt. Packs flat, never needs ironing.",
    "productType": "Kimono kaftan",
    "gender": "women",
    "price": 36000,
    "typeOption": {
      "label": "Length",
      "values": [
        "Midi",
        "Maxi"
      ]
    },
    "images": [
      "/products/sage-kimono-wrap-kaftan.webp"
    ],
    "colors": [
      {
        "name": "Sage",
        "hex": "#9CAF94",
        "image": "/products/sage-kimono-wrap-kaftan.webp"
      },
      {
        "name": "Sand",
        "hex": "#D6BC94"
      },
      {
        "name": "Black",
        "hex": "#1E1E1E"
      }
    ],
    "sizes": WOMEN_SIZES,
    "stock": 18,
    "material": "Crinkle cotton",
    "fit": "Wrap front with fabric belt",
    "care": "Machine wash gentle, no iron needed",
    "createdAt": day(10)
  }),
  product({
    "id": "sky-blue-linen-kaftan",
    "name": "Sky Blue Linen Kaftan",
    "description": "A breezy linen kaftan in sky blue with a notch neck and three-quarter sleeves. Choose the men's or women's cut.",
    "productType": "Linen kaftan",
    "gender": "unisex",
    "price": 33000,
    "typeOption": {
      "label": "For",
      "values": [
        "Men",
        "Women"
      ]
    },
    "images": [
      "/products/sky-blue-linen-kaftan.webp"
    ],
    "colors": [
      {
        "name": "Sky Blue",
        "hex": "#8DB5DE",
        "image": "/products/sky-blue-linen-kaftan.webp"
      },
      {
        "name": "White",
        "hex": "#F7F5F0"
      },
      {
        "name": "Stone",
        "hex": "#CFC6B5"
      }
    ],
    "sizes": UNI_SIZES,
    "stock": 28,
    "material": "100% linen",
    "fit": "Relaxed knee length, side slits",
    "care": "Machine wash cold, line dry",
    "createdAt": day(11)
  }),
  product({
    "id": "mustard-cotton-kaftan-set",
    "name": "Mustard Cotton Kaftan Set",
    "description": "A confident mustard kaftan with mandarin collar and matching trousers. A bright, modern take on the classic set.",
    "productType": "Kaftan",
    "gender": "men",
    "price": 44000,
    "typeOption": {
      "label": "Set",
      "values": [
        "Top only",
        "Top + trousers"
      ]
    },
    "images": [
      "/products/mustard-cotton-kaftan-set.webp"
    ],
    "colors": [
      {
        "name": "Mustard",
        "hex": "#D4A23A",
        "image": "/products/mustard-cotton-kaftan-set.webp"
      },
      {
        "name": "Olive",
        "hex": "#5C6B3A"
      },
      {
        "name": "Navy",
        "hex": "#1F2A44"
      }
    ],
    "sizes": MEN_SIZES,
    "stock": 15,
    "material": "Cotton sateen",
    "fit": "Regular-fit top, straight trousers",
    "care": "Machine wash cold, iron medium",
    "createdAt": day(12)
  }),
  product({
    "id": "burgundy-brushed-kaftan",
    "name": "Burgundy Brushed Kaftan",
    "description": "A deep burgundy kaftan in a soft brushed fabric with a short placket. Rich colour, simple cut.",
    "productType": "Kaftan",
    "gender": "men",
    "price": 46000,
    "compareAtPrice": 52000,
    "typeOption": {
      "label": "Length",
      "values": [
        "Short",
        "Long"
      ]
    },
    "images": [
      "/products/burgundy-brushed-kaftan.webp"
    ],
    "colors": [
      {
        "name": "Burgundy",
        "hex": "#6E1E2A",
        "image": "/products/burgundy-brushed-kaftan.webp"
      },
      {
        "name": "Black",
        "hex": "#1E1E1E"
      },
      {
        "name": "Bottle Green",
        "hex": "#1E4D3A"
      }
    ],
    "sizes": MEN_SIZES,
    "stock": 13,
    "material": "Brushed cotton-blend",
    "fit": "Regular fit, long sleeves",
    "care": "Wash inside out, cold",
    "createdAt": day(13)
  }),
  product({
    "id": "grey-marl-lounge-kaftan",
    "name": "Grey Marl Lounge Kaftan",
    "description": "A cosy jersey kaftan for home, travel and slow Sundays. Soft, stretchy and relaxed.",
    "productType": "Lounge kaftan",
    "gender": "unisex",
    "price": 22000,
    "typeOption": {
      "label": "For",
      "values": [
        "Men",
        "Women"
      ]
    },
    "images": [
      "/products/grey-marl-lounge-kaftan.webp"
    ],
    "colors": [
      {
        "name": "Grey Marl",
        "hex": "#A6A6A6",
        "image": "/products/grey-marl-lounge-kaftan.webp"
      },
      {
        "name": "Black",
        "hex": "#1E1E1E"
      },
      {
        "name": "Oat",
        "hex": "#E3D9C6"
      }
    ],
    "sizes": UNI_SIZES,
    "stock": 40,
    "material": "Cotton jersey",
    "fit": "Relaxed knee length, dolman sleeves",
    "care": "Machine wash warm",
    "createdAt": day(14)
  }),
  product({
    "id": "kids-white-jalabiya",
    "name": "Kids' White Jalabiya",
    "description": "A little white jalabiya for Jumu'ah, Eid and family photos. Soft cotton that's easy to wash. Add the matching knitted cap.",
    "productType": "Jalabiya",
    "gender": "kids",
    "price": 18000,
    "featured": true,
    "typeOption": {
      "label": "Set",
      "values": [
        "Robe only",
        "Robe + cap"
      ]
    },
    "images": [
      "/products/kids-white-jalabiya.webp"
    ],
    "colors": [
      {
        "name": "White",
        "hex": "#F7F5F0",
        "image": "/products/kids-white-jalabiya.webp"
      },
      {
        "name": "Sand",
        "hex": "#D6BC94"
      },
      {
        "name": "Sky Blue",
        "hex": "#8DB5DE"
      }
    ],
    "sizes": KIDS_SIZES,
    "stock": 30,
    "material": "Soft cotton",
    "fit": "Ankle length, roomy",
    "care": "Machine wash 30°C",
    "createdAt": day(15)
  }),
  product({
    "id": "kids-navy-kaftan-set",
    "name": "Kids' Navy Kaftan Set",
    "description": "A smart navy kaftan with a mandarin collar and matching easy-on trousers, sized for little ones.",
    "productType": "Kaftan",
    "gender": "kids",
    "price": 21000,
    "typeOption": {
      "label": "Set",
      "values": [
        "Top only",
        "Top + trousers"
      ]
    },
    "images": [
      "/products/kids-navy-kaftan-set.webp"
    ],
    "colors": [
      {
        "name": "Navy",
        "hex": "#1F2A44",
        "image": "/products/kids-navy-kaftan-set.webp"
      },
      {
        "name": "Wine",
        "hex": "#6E1E2A"
      },
      {
        "name": "Olive",
        "hex": "#5C6B3A"
      }
    ],
    "sizes": KIDS_SIZES,
    "stock": 24,
    "material": "Cotton twill",
    "fit": "Knee-length top, elastic-waist trousers",
    "care": "Machine wash 30°C",
    "createdAt": day(16)
  }),
  product({
    "id": "kids-pink-kaftan-dress",
    "name": "Kids' Pink Kaftan Dress",
    "description": "A floaty pastel kaftan dress with flutter sleeves for girls. Light and comfy for parties and naming ceremonies.",
    "productType": "Kaftan dress",
    "gender": "kids",
    "price": 19500,
    "typeOption": {
      "label": "Length",
      "values": [
        "Midi",
        "Maxi"
      ]
    },
    "images": [
      "/products/kids-pink-kaftan-dress.webp"
    ],
    "colors": [
      {
        "name": "Pink",
        "hex": "#F4C2C2",
        "image": "/products/kids-pink-kaftan-dress.webp"
      },
      {
        "name": "Lilac",
        "hex": "#C3B1E1"
      },
      {
        "name": "Ivory",
        "hex": "#F2ECDF"
      }
    ],
    "sizes": KIDS_SIZES,
    "stock": 20,
    "material": "Cotton lawn",
    "fit": "Flowy with flutter sleeves",
    "care": "Machine wash gentle",
    "createdAt": day(17)
  }),
  product({
    "id": "kids-sage-linen-kaftan",
    "name": "Kids' Sage Linen Kaftan",
    "description": "A breathable linen kaftan for kids with a short button placket. Easy to wear on hot days.",
    "productType": "Linen kaftan",
    "gender": "kids",
    "price": 17500,
    "typeOption": {
      "label": "For",
      "values": [
        "Boy",
        "Girl"
      ]
    },
    "images": [
      "/products/kids-sage-linen-kaftan.webp"
    ],
    "colors": [
      {
        "name": "Sage",
        "hex": "#9CAF94",
        "image": "/products/kids-sage-linen-kaftan.webp"
      },
      {
        "name": "Sky Blue",
        "hex": "#8DB5DE"
      },
      {
        "name": "White",
        "hex": "#F7F5F0"
      }
    ],
    "sizes": KIDS_SIZES,
    "stock": 26,
    "material": "Linen-cotton blend",
    "fit": "Knee length, short sleeves",
    "care": "Machine wash cold",
    "createdAt": day(18)
  }),
  product({
    "id": "cream-hooded-djellaba",
    "name": "Cream Hooded Djellaba",
    "description": "A Moroccan-style djellaba with a pointed hood in a warm cream weave. Perfect for cool harmattan mornings.",
    "productType": "Moroccan djellaba",
    "gender": "men",
    "price": 62000,
    "typeOption": {
      "label": "Length",
      "values": [
        "Regular",
        "Tall"
      ]
    },
    "images": [
      "/products/cream-hooded-djellaba.webp"
    ],
    "colors": [
      {
        "name": "Cream",
        "hex": "#EFE6D2",
        "image": "/products/cream-hooded-djellaba.webp"
      },
      {
        "name": "Grey",
        "hex": "#A6A6A6"
      },
      {
        "name": "Brown",
        "hex": "#5A3A22"
      }
    ],
    "sizes": MEN_SIZES,
    "stock": 10,
    "material": "Wool-cotton weave",
    "fit": "Loose ankle length with hood",
    "care": "Dry clean or cool hand wash",
    "createdAt": day(19)
  }),
  product({
    "id": "chocolate-brown-thobe",
    "name": "Chocolate Brown Thobe",
    "description": "A chocolate-brown thobe with a shirt collar, hidden placket and cuffed sleeves. Polished and easy to care for.",
    "productType": "Thobe",
    "gender": "men",
    "price": 39000,
    "typeOption": {
      "label": "Length",
      "values": [
        "Regular",
        "Tall"
      ]
    },
    "images": [
      "/products/chocolate-brown-thobe.webp"
    ],
    "colors": [
      {
        "name": "Chocolate",
        "hex": "#5A3A22",
        "image": "/products/chocolate-brown-thobe.webp"
      },
      {
        "name": "Navy",
        "hex": "#1F2A44"
      },
      {
        "name": "Grey",
        "hex": "#A6A6A6"
      }
    ],
    "sizes": MEN_SIZES,
    "stock": 18,
    "material": "Cotton-poly blend",
    "fit": "Ankle length, shirt collar, cuffed sleeves",
    "care": "Machine wash cold",
    "createdAt": day(20)
  }),
  product({
    "id": "lilac-chiffon-beach-kaftan",
    "name": "Lilac Chiffon Beach Kaftan",
    "description": "A sheer chiffon kaftan cover-up in soft lilac. Wear it at the pool, on the beach or over a slip dress.",
    "productType": "Beach kaftan",
    "gender": "women",
    "price": 27000,
    "typeOption": {
      "label": "Length",
      "values": [
        "Midi",
        "Maxi"
      ]
    },
    "images": [
      "/products/lilac-chiffon-beach-kaftan.webp"
    ],
    "colors": [
      {
        "name": "Lilac",
        "hex": "#C3B1E1",
        "image": "/products/lilac-chiffon-beach-kaftan.webp"
      },
      {
        "name": "White",
        "hex": "#F7F5F0"
      },
      {
        "name": "Coral",
        "hex": "#F27C5C"
      }
    ],
    "sizes": WOMEN_SIZES,
    "stock": 25,
    "material": "Sheer chiffon",
    "fit": "Loose, floaty cover-up",
    "care": "Hand wash cold",
    "createdAt": day(21)
  }),
  product({
    "id": "coral-cotton-maxi-kaftan",
    "name": "Coral Cotton Maxi Kaftan",
    "description": "A bright coral maxi kaftan with wide sleeves and a keyhole neck. Cool, easy and full of colour.",
    "productType": "Kaftan",
    "gender": "women",
    "price": 31000,
    "badge": "Summer",
    "typeOption": {
      "label": "Length",
      "values": [
        "Midi",
        "Maxi"
      ]
    },
    "images": [
      "/products/coral-cotton-maxi-kaftan.webp"
    ],
    "colors": [
      {
        "name": "Coral",
        "hex": "#F27C5C",
        "image": "/products/coral-cotton-maxi-kaftan.webp"
      },
      {
        "name": "Sunshine",
        "hex": "#F2C14E"
      },
      {
        "name": "Turquoise",
        "hex": "#2BA6A0"
      }
    ],
    "sizes": WOMEN_SIZES,
    "stock": 22,
    "material": "Cotton voile",
    "fit": "Loose with keyhole neck",
    "care": "Machine wash gentle",
    "createdAt": day(22)
  }),
  product({
    "id": "teal-silk-blend-kaftan",
    "name": "Teal Silk-Blend Kaftan",
    "description": "An elegant floor-length kaftan in a deep teal silk blend with butterfly sleeves and a simple V-neck.",
    "productType": "Kaftan",
    "gender": "women",
    "price": 64000,
    "compareAtPrice": 72000,
    "featured": true,
    "typeOption": {
      "label": "Length",
      "values": [
        "Midi",
        "Maxi"
      ]
    },
    "images": [
      "/products/teal-silk-blend-kaftan.webp"
    ],
    "colors": [
      {
        "name": "Teal",
        "hex": "#145A5A",
        "image": "/products/teal-silk-blend-kaftan.webp"
      },
      {
        "name": "Wine",
        "hex": "#6E1E2A"
      },
      {
        "name": "Gold",
        "hex": "#C9A24A"
      }
    ],
    "sizes": WOMEN_SIZES,
    "stock": 9,
    "material": "Silk-blend satin",
    "fit": "Floor length, butterfly sleeves",
    "care": "Dry clean only",
    "createdAt": day(23)
  }),
  product({
    "id": "stone-linen-short-kaftan",
    "name": "Stone Linen Short Kaftan",
    "description": "A short linen kaftan in natural stone with a band collar and side slits. Add the drawstring trousers for an easy set.",
    "productType": "Kaftan shirt",
    "gender": "men",
    "price": 29000,
    "typeOption": {
      "label": "Set",
      "values": [
        "Top only",
        "Top + trousers"
      ]
    },
    "images": [
      "/products/stone-linen-short-kaftan.webp"
    ],
    "colors": [
      {
        "name": "Stone",
        "hex": "#CFC6B5",
        "image": "/products/stone-linen-short-kaftan.webp"
      },
      {
        "name": "White",
        "hex": "#F7F5F0"
      },
      {
        "name": "Olive",
        "hex": "#5C6B3A"
      }
    ],
    "sizes": MEN_SIZES,
    "stock": 27,
    "material": "100% linen",
    "fit": "Hip length, band collar",
    "care": "Machine wash cold, line dry",
    "createdAt": day(24)
  }),
  product({
    "id": "black-minimal-kaftan-set",
    "name": "Black Minimal Kaftan Set",
    "description": "An all-black kaftan and trousers with a hidden placket and clean round neck. Minimal, modern, sharp.",
    "productType": "Kaftan",
    "gender": "men",
    "price": 47000,
    "badge": "Bestseller",
    "featured": true,
    "typeOption": {
      "label": "Length",
      "values": [
        "Short",
        "Long"
      ]
    },
    "images": [
      "/products/black-minimal-kaftan-set.webp"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#1E1E1E",
        "image": "/products/black-minimal-kaftan-set.webp"
      },
      {
        "name": "Navy",
        "hex": "#1F2A44"
      },
      {
        "name": "Charcoal",
        "hex": "#4A4A4A"
      }
    ],
    "sizes": MEN_SIZES,
    "stock": 16,
    "material": "Matte cotton",
    "fit": "Regular-fit top, tapered trousers",
    "care": "Wash inside out, cold",
    "createdAt": day(25)
  }),
  product({
    "id": "off-white-pinstripe-jalabiya",
    "name": "Off-White Pinstripe Jalabiya",
    "description": "A light jalabiya in off-white cotton with a fine grey pinstripe. Fresh, cool and easy to wear.",
    "productType": "Jalabiya",
    "gender": "men",
    "price": 37000,
    "typeOption": {
      "label": "Length",
      "values": [
        "Regular",
        "Tall"
      ]
    },
    "images": [
      "/products/off-white-pinstripe-jalabiya.webp"
    ],
    "colors": [
      {
        "name": "Off-White Pinstripe",
        "hex": "#F4F1EA",
        "image": "/products/off-white-pinstripe-jalabiya.webp"
      },
      {
        "name": "Blue Pinstripe",
        "hex": "#C9D8E8"
      }
    ],
    "sizes": MEN_SIZES,
    "stock": 19,
    "material": "Cotton shirting",
    "fit": "Loose ankle length",
    "care": "Machine wash cold",
    "createdAt": day(26)
  }),
  product({
    "id": "dusty-rose-abaya-kaftan",
    "name": "Dusty Rose Abaya Kaftan",
    "description": "An open-front abaya-kaftan in dusty rose with wide sleeves. Choose it alone or with the matching inner slip dress.",
    "productType": "Abaya kaftan",
    "gender": "women",
    "price": 49000,
    "typeOption": {
      "label": "Set",
      "values": [
        "Kaftan only",
        "With inner slip"
      ]
    },
    "images": [
      "/products/dusty-rose-abaya-kaftan.webp"
    ],
    "colors": [
      {
        "name": "Dusty Rose",
        "hex": "#C98C8C",
        "image": "/products/dusty-rose-abaya-kaftan.webp"
      },
      {
        "name": "Sage",
        "hex": "#9CAF94"
      },
      {
        "name": "Navy",
        "hex": "#1F2A44"
      }
    ],
    "sizes": WOMEN_SIZES,
    "stock": 14,
    "material": "Soft crepe",
    "fit": "Open front, ankle length",
    "care": "Gentle wash, cool iron",
    "createdAt": day(27)
  }),
  product({
    "id": "indigo-adire-kaftan",
    "name": "Indigo Adire Kaftan",
    "description": "A relaxed kaftan in hand-dyed indigo adire cotton. Every piece has its own pattern.",
    "productType": "Adire kaftan",
    "gender": "unisex",
    "price": 34000,
    "badge": "Handmade",
    "typeOption": {
      "label": "For",
      "values": [
        "Men",
        "Women"
      ]
    },
    "images": [
      "/products/indigo-adire-kaftan.webp"
    ],
    "colors": [
      {
        "name": "Indigo",
        "hex": "#2E3F7F",
        "image": "/products/indigo-adire-kaftan.webp"
      },
      {
        "name": "Rust",
        "hex": "#9C4A2F"
      }
    ],
    "sizes": UNI_SIZES,
    "stock": 12,
    "material": "Hand-dyed adire cotton",
    "fit": "Relaxed knee length, short sleeves",
    "care": "Hand wash cold separately",
    "createdAt": day(28)
  }),
  product({
    "id": "camel-linen-kaftan-set",
    "name": "Camel Linen Kaftan Set",
    "description": "A camel linen kaftan with band collar and matching trousers. Warm tone, light fabric, easy elegance.",
    "productType": "Kaftan",
    "gender": "men",
    "price": 55000,
    "featured": true,
    "typeOption": {
      "label": "Set",
      "values": [
        "Top only",
        "Top + trousers"
      ]
    },
    "images": [
      "/products/camel-linen-kaftan-set.webp"
    ],
    "colors": [
      {
        "name": "Camel",
        "hex": "#B07A45",
        "image": "/products/camel-linen-kaftan-set.webp"
      },
      {
        "name": "Ivory",
        "hex": "#F2ECDF"
      },
      {
        "name": "Olive",
        "hex": "#5C6B3A"
      }
    ],
    "sizes": MEN_SIZES,
    "stock": 11,
    "material": "100% linen",
    "fit": "Regular fit, band collar",
    "care": "Machine wash cold, line dry",
    "createdAt": day(29)
  }),
];

/** Photos used by the homepage "Rebel Fashion's own collection: Kaftans" feature. */
export const KAFTAN_FEATURE_IMAGES = {
  men: "/products/camel-linen-kaftan-set.webp",
  women: "/products/emerald-satin-abaya-kaftan.webp",
  kids: "/products/kids-pink-kaftan-dress.webp",
};

export function findSeedProduct(idOrSlug: string): Product | undefined {
  return seedProducts.find((item) => item.id === idOrSlug || item.slug === idOrSlug);
}
