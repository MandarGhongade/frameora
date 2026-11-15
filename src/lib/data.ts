export type FinishId = "black" | "white" | "oak" | "walnut" | "gold" | "acrylic";

export const FINISHES: Record<FinishId, { name: string; swatch: string }> = {
  black: { name: "Matte Black", swatch: "#1d1a18" },
  white: { name: "Gallery White", swatch: "#f4f1ec" },
  oak: { name: "Natural Oak", swatch: "#c69a62" },
  walnut: { name: "Dark Walnut", swatch: "#573620" },
  gold: { name: "Antique Gold", swatch: "#c9a052" },
  acrylic: { name: "Clear Acrylic", swatch: "#e6edf1" },
};

export type Size = { label: string; w: number; h: number; price: number };

export type Category = {
  slug: string;
  name: string;
  blurb: string;
  art: ArtId;
  finish: FinishId;
};

export type ArtId =
  | "dusk"
  | "coast"
  | "bloom"
  | "hills"
  | "temple"
  | "petal"
  | "noir"
  | "meadow";

export type Frame = {
  slug: string;
  name: string;
  category: string;
  kind: "custom" | "ready";
  description: string;
  finishes: FinishId[];
  sizes: Size[];
  art: ArtId;
  mat: boolean;
  badge?: string;
  /** Art style slug (see ART_STYLE_GROUPS) — mainly for ready-made art */
  style?: string;
  /** Product photo / artwork (uploaded by admin). When missing, the built-in illustration `art` is shown. */
  image?: string;
  /** Starred by admin to be shown on the home page */
  featured?: boolean;
  orientation: "portrait" | "landscape" | "square";
};

export const CATEGORIES: Category[] = [
  { slug: "wall", name: "Wall Frames", blurb: "Statement pieces for every wall", art: "hills", finish: "oak" },
  { slug: "tabletop", name: "Table Top", blurb: "Desks, shelves & bedside", art: "bloom", finish: "white" },
  { slug: "couple", name: "Couple & Love", blurb: "Anniversaries, proposals, forever", art: "petal", finish: "gold" },
  { slug: "collage", name: "Collage", blurb: "Many memories, one frame", art: "meadow", finish: "black" },
  { slug: "acrylic", name: "Acrylic", blurb: "Frameless, glossy, modern", art: "coast", finish: "acrylic" },
  { slug: "spiritual", name: "Pooja & Spiritual", blurb: "For your home mandir", art: "temple", finish: "gold" },
  { slug: "wedding", name: "Wedding", blurb: "The day, framed forever", art: "dusk", finish: "walnut" },
  { slug: "ready-made", name: "Ready-made Art", blurb: "Curated prints, ready to hang", art: "noir", finish: "black" },
];

export type ArtStyle = { slug: string; name: string };
export type ArtStyleGroup = { slug: string; name: string; blurb: string; art: ArtId; styles: ArtStyle[] };

export const ART_STYLE_GROUPS: ArtStyleGroup[] = [
  {
    slug: "indian-folk",
    name: "Indian & Folk Art",
    blurb: "Centuries-old traditions from across India",
    art: "temple",
    styles: [
      { slug: "madhubani", name: "Madhubani" },
      { slug: "warli", name: "Warli" },
      { slug: "gond", name: "Gond" },
      { slug: "pattachitra", name: "Pattachitra" },
      { slug: "kalamkari", name: "Kalamkari" },
      { slug: "tanjore", name: "Tanjore" },
      { slug: "rajasthani-miniature", name: "Rajasthani Miniature" },
      { slug: "mughal-miniature", name: "Mughal Miniature" },
      { slug: "phad-painting", name: "Phad Painting" },
      { slug: "kerala-mural", name: "Kerala Mural" },
      { slug: "saura-art", name: "Saura Art" },
      { slug: "bhil-art", name: "Bhil Art" },
    ],
  },
  {
    slug: "modern-minimal",
    name: "Modern & Minimal",
    blurb: "Calm, clean pieces for contemporary homes",
    art: "coast",
    styles: [
      { slug: "minimal-line-art", name: "Minimal Line Art" },
      { slug: "geometric-art", name: "Geometric Art" },
      { slug: "abstract-art", name: "Abstract Art" },
      { slug: "botanical-art", name: "Botanical Art" },
      { slug: "continuous-line-art", name: "Continuous Line Art" },
      { slug: "scandinavian-art", name: "Scandinavian Art" },
      { slug: "japandi-art", name: "Japandi Art" },
      { slug: "mid-century-modern", name: "Mid-Century Modern" },
      { slug: "organic-abstract", name: "Organic Abstract" },
      { slug: "minimalist-watercolor", name: "Minimalist Watercolor" },
    ],
  },
  {
    slug: "hand-drawn",
    name: "Artistic / Hand-Drawn",
    blurb: "The texture of real brush, pencil and ink",
    art: "hills",
    styles: [
      { slug: "watercolor", name: "Watercolor" },
      { slug: "ink-and-wash", name: "Ink & Wash" },
      { slug: "pencil-sketch", name: "Pencil Sketch" },
      { slug: "charcoal", name: "Charcoal" },
      { slug: "colored-pencil", name: "Colored Pencil" },
      { slug: "ink-illustration", name: "Ink Illustration" },
      { slug: "gouache", name: "Gouache" },
      { slug: "acrylic", name: "Acrylic" },
      { slug: "pen-and-ink", name: "Pen & Ink" },
      { slug: "mixed-media", name: "Mixed Media" },
    ],
  },
  {
    slug: "pattern",
    name: "Pattern-Based",
    blurb: "Intricate, repeating, endlessly detailed",
    art: "bloom",
    styles: [
      { slug: "dot-art-pointillism", name: "Dot Art / Pointillism" },
      { slug: "mandala-art", name: "Mandala Art" },
      { slug: "zentangle", name: "Zentangle" },
      { slug: "tribal-patterns", name: "Tribal Patterns" },
      { slug: "islamic-geometric-art", name: "Islamic Geometric Art" },
      { slug: "floral-pattern-art", name: "Floral Pattern Art" },
      { slug: "doodle-art", name: "Doodle Art" },
      { slug: "ornamental-art", name: "Ornamental Art" },
    ],
  },
];

export const ART_STYLES: ArtStyle[] = ART_STYLE_GROUPS.flatMap((g) => g.styles);

const S = {
  small: [
    { label: "5×7", w: 5, h: 7, price: 449 },
    { label: "6×8", w: 6, h: 8, price: 549 },
    { label: "8×10", w: 8, h: 10, price: 749 },
  ],
  wall: [
    { label: "8×10", w: 8, h: 10, price: 799 },
    { label: "12×16", w: 12, h: 16, price: 1299 },
    { label: "16×20", w: 16, h: 20, price: 1899 },
    { label: "20×30", w: 20, h: 30, price: 2799 },
  ],
  square: [
    { label: "8×8", w: 8, h: 8, price: 699 },
    { label: "12×12", w: 12, h: 12, price: 1199 },
    { label: "16×16", w: 16, h: 16, price: 1699 },
  ],
};

export const FRAMES: Frame[] = [
  {
    slug: "classic-gallery",
    name: "The Classic Gallery",
    category: "wall",
    kind: "custom",
    description: "A clean profile with a soft white mat — the frame that makes every photo look like it belongs in a gallery.",
    finishes: ["black", "white", "oak", "walnut"],
    sizes: S.wall,
    art: "hills",
    mat: true,
    badge: "Bestseller",
    orientation: "portrait",
  },
  {
    slug: "heirloom-gold",
    name: "Heirloom Gold",
    category: "couple",
    kind: "custom",
    description: "Antique gold finish with a deep bevel. Made for anniversaries and the photos you'll keep for a lifetime.",
    finishes: ["gold", "walnut"],
    sizes: S.wall,
    art: "petal",
    mat: true,
    badge: "Gift favourite",
    orientation: "portrait",
  },
  {
    slug: "desk-mini",
    name: "Desk Mini",
    category: "tabletop",
    kind: "custom",
    description: "A compact table-top frame with a fold-out stand. Small enough for any desk, big enough to make you smile.",
    finishes: ["white", "black", "oak"],
    sizes: S.small,
    art: "bloom",
    mat: false,
    orientation: "portrait",
  },
  {
    slug: "crystal-acrylic",
    name: "Crystal Acrylic",
    category: "acrylic",
    kind: "custom",
    description: "Your photo printed directly behind 5mm crystal-clear acrylic. Glossy, vivid and completely frameless.",
    finishes: ["acrylic"],
    sizes: S.wall,
    art: "coast",
    mat: false,
    badge: "New",
    orientation: "landscape",
  },
  {
    slug: "memory-grid",
    name: "Memory Grid",
    category: "collage",
    kind: "custom",
    description: "A square frame that holds your favourite memory front and centre — collage layouts coming soon.",
    finishes: ["black", "white", "oak"],
    sizes: S.square,
    art: "meadow",
    mat: true,
    orientation: "square",
  },
  {
    slug: "mandir-blessings",
    name: "Mandir Blessings",
    category: "spiritual",
    kind: "custom",
    description: "A rich gold frame for your family deity or a cherished photo of elders, made for the home mandir.",
    finishes: ["gold", "walnut"],
    sizes: S.small,
    art: "temple",
    mat: true,
    orientation: "portrait",
  },
  {
    slug: "saat-phere",
    name: "Saat Phere",
    category: "wedding",
    kind: "custom",
    description: "Wide walnut moulding with a warm mat — built for the big wedding portrait on the living room wall.",
    finishes: ["walnut", "gold", "black"],
    sizes: S.wall,
    art: "dusk",
    mat: true,
    badge: "Wedding season",
    orientation: "landscape",
  },
  {
    slug: "noir-city",
    name: "Noir City — Print",
    category: "ready-made",
    kind: "ready",
    description: "A moody monochrome art print, framed and ready to hang. No upload needed.",
    finishes: ["black", "white"],
    sizes: S.wall,
    art: "noir",
    style: "charcoal",
    mat: true,
    orientation: "portrait",
  },
  {
    slug: "golden-meadow",
    name: "Golden Meadow — Print",
    category: "ready-made",
    kind: "ready",
    description: "Warm, sunlit botanical art that brightens any room. Arrives framed and ready to hang.",
    finishes: ["oak", "white"],
    sizes: S.wall,
    art: "meadow",
    style: "botanical-art",
    mat: true,
    orientation: "landscape",
  },
];

export const ADDONS = [
  { id: "photofix", name: "Free photo touch-up", note: "Our team brightens & fixes your photo before printing", price: 0 },
  { id: "qr", name: "QR voice / video message", note: "A QR on the back plays your message", price: 99 },
  { id: "gift", name: "Gift wrap + handwritten note", note: "No price on the invoice", price: 79 },
] as const;

export type AddonId = (typeof ADDONS)[number]["id"];

/** Built-in catalogue only. Pages should use getProducts() / useLiveProducts(). */
export const getFrame = (slug: string) => FRAMES.find((f) => f.slug === slug);
export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const fromPrice = (f: Frame) => Math.min(...f.sizes.map((s) => s.price));
/** Short label for the border choice on an order line ("" for old items without one). */
export const borderLabel = (mat?: boolean) => (mat === undefined ? "" : mat ? " · White border" : " · No border");

/** Links work on static hosting (GitHub Pages): product & order pages read their id from the address. */
export const productHref = (slug: string) => `/frame?p=${encodeURIComponent(slug)}`;
export const orderHref = (id: string) => `/orders/view?id=${encodeURIComponent(id)}`;

export const getArtStyle = (slug: string) => ART_STYLES.find((s) => s.slug === slug);
export const getStyleGroup = (slug: string) => ART_STYLE_GROUPS.find((g) => g.styles.some((s) => s.slug === slug));
