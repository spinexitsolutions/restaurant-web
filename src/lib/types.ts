// ───────────────────────────────────────────────────────────
// Domain model for NOOR — every piece of the public site is
// driven by these records and editable from /admin.
// ───────────────────────────────────────────────────────────

export type ID = string;

export type DietTag = "veg" | "vegan" | "spicy" | "chef" | "new" | "gf" | "bestseller";

export interface Category {
  id: ID;
  name: string;
  slug: string;
  description: string;
  order: number;
}

export interface MenuItem {
  id: ID;
  name: string;
  description: string;
  price: number;
  categoryId: ID;
  image: string;
  tags: DietTag[];
  available: boolean;
  featured: boolean; // shows in "Signatures" on the home page
  order: number;
}

export type ReservationStatus = "pending" | "confirmed" | "seated" | "completed" | "cancelled" | "no-show";

export interface Reservation {
  id: ID;
  name: string;
  email: string;
  phone: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  guests: number;
  occasion: string;
  notes: string;
  status: ReservationStatus;
  table: string;
  createdAt: string;
}

export type OrderStatus = "new" | "preparing" | "ready" | "out-for-delivery" | "completed" | "cancelled";
export type OrderType = "delivery" | "pickup";

export interface OrderLine {
  itemId: ID;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: ID;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  type: OrderType;
  items: OrderLine[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  coupon: string;
  total: number;
  payment: "cod" | "upi" | "card";
  status: OrderStatus;
  notes: string;
  createdAt: string;
}

export interface Customer {
  id: ID;
  name: string;
  email: string;
  phone: string;
  tags: string[];
  notes: string;
  visits: number;
  orders: number;
  totalSpent: number;
  lastSeen: string;
  source: string;
  birthday: string;
  createdAt: string;
}

export interface Message {
  id: ID;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Subscriber {
  id: ID;
  email: string;
  createdAt: string;
}

export interface Testimonial {
  id: ID;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatar: string;
}

export interface GalleryImage {
  id: ID;
  image: string;
  caption: string;
  span: "normal" | "tall" | "wide";
  order: number;
}

export interface TeamMember {
  id: ID;
  name: string;
  role: string;
  bio: string;
  image: string;
  order: number;
}

export interface EventItem {
  id: ID;
  title: string;
  date: string;
  time: string;
  description: string;
  image: string;
  price: number;
  seats: number;
  published: boolean;
}

export interface Post {
  id: ID;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // paragraphs separated by blank lines; lines starting with "## " are headings
  cover: string;
  author: string;
  date: string;
  tags: string[];
  published: boolean;
}

export interface Offer {
  id: ID;
  title: string;
  description: string;
  code: string;
  discount: number; // percent
  minOrder: number;
  active: boolean;
  image: string;
}

export interface Faq {
  id: ID;
  q: string;
  a: string;
  order: number;
}

export interface HourRow {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export type HomeSectionId =
  | "hero"
  | "manifesto"
  | "signatures"
  | "menu"
  | "story"
  | "stats"
  | "experiences"
  | "gallery"
  | "testimonials"
  | "offers"
  | "journal"
  | "reserve"
  | "visit";

export interface HomeSection {
  id: HomeSectionId;
  label: string;
  visible: boolean;
}

export type IntroStyle = "curtain" | "counter" | "words";

export interface Settings {
  brand: {
    name: string;
    tagline: string;
    description: string;
    accent: string;
    accentSoft: string;
    ink: string;
    paper: string;
  };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    city: string;
    mapQuery: string;
  };
  hours: HourRow[];
  socials: { instagram: string; facebook: string; x: string; youtube: string };
  intro: {
    enabled: boolean;
    style: IntroStyle;
    words: string[];
    durationMs: number;
    oncePerSession: boolean;
  };
  announcement: { enabled: boolean; text: string; link: string };
  hero: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    image: string;
    ctaPrimary: string;
    ctaSecondary: string;
    marquee: string[];
  };
  manifesto: string;
  story: {
    eyebrow: string;
    title: string;
    body: string;
    image: string;
    imageAlt: string;
    signature: string;
  };
  stats: { label: string; value: number; suffix: string }[];
  sections: HomeSection[];
  reservations: {
    enabled: boolean;
    maxGuests: number;
    slots: string[];
    note: string;
  };
  ordering: {
    enabled: boolean;
    currency: string;
    taxRate: number; // percent
    deliveryFee: number;
    freeDeliveryAbove: number;
    minOrder: number;
    etaMinutes: number;
  };
  seo: { title: string; description: string; ogImage: string };
}

export interface Database {
  settings: Settings;
  categories: Category[];
  menuItems: MenuItem[];
  reservations: Reservation[];
  orders: Order[];
  customers: Customer[];
  messages: Message[];
  subscribers: Subscriber[];
  testimonials: Testimonial[];
  gallery: GalleryImage[];
  team: TeamMember[];
  events: EventItem[];
  posts: Post[];
  offers: Offer[];
  faqs: Faq[];
}

export type CollectionName = Exclude<keyof Database, "settings">;

export const COLLECTIONS: CollectionName[] = [
  "categories",
  "menuItems",
  "reservations",
  "orders",
  "customers",
  "messages",
  "subscribers",
  "testimonials",
  "gallery",
  "team",
  "events",
  "posts",
  "offers",
  "faqs",
];
