import type { Category } from "@/lib/types";
import { fmtDate, money, to12h } from "@/lib/format";

export type FieldType = "text" | "textarea" | "number" | "toggle" | "select" | "image" | "tags" | "multiselect" | "date" | "time" | "color";

export type Ctx = { categories: Category[]; currency: string };
type Row = Record<string, unknown>;

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  hint?: string;
  placeholder?: string;
  full?: boolean;
  rows?: number;
  options?: (ctx: Ctx) => { value: string; label: string }[];
}

export interface CollectionConfig {
  title: string;
  singular: string;
  description: string;
  fields: Field[];
  primary: string;
  secondary?: (r: Row, ctx: Ctx) => string;
  image?: string;
  toggles?: { key: string; label: string }[];
  orderable?: boolean;
  layout: "grid" | "list";
  slugFrom?: string;
  groupBy?: (r: Row, ctx: Ctx) => string;
  defaults: (ctx: Ctx) => Row;
}

const s = (v: unknown) => String(v ?? "");

export const DIET_TAGS = ["veg", "vegan", "spicy", "chef", "new", "gf", "bestseller"];

export const SCHEMAS: Record<string, CollectionConfig> = {
  menuItems: {
    title: "Menu",
    singular: "dish",
    description: "Dishes, prices and dietary tags. Featured dishes appear in the homepage Signatures reel.",
    layout: "grid",
    primary: "name",
    image: "image",
    orderable: true,
    secondary: (r, c) => `${money(Number(r.price), c.currency)} · ${c.categories.find((x) => x.id === r.categoryId)?.name || "Uncategorised"}`,
    groupBy: (r, c) => c.categories.find((x) => x.id === r.categoryId)?.name || "Uncategorised",
    toggles: [
      { key: "available", label: "Available" },
      { key: "featured", label: "Featured" },
    ],
    fields: [
      { key: "name", label: "Dish name", type: "text", full: true },
      { key: "description", label: "Description", type: "textarea", full: true, rows: 3 },
      { key: "price", label: "Price", type: "number" },
      { key: "categoryId", label: "Category", type: "select", options: (c) => c.categories.map((x) => ({ value: x.id, label: x.name })) },
      { key: "image", label: "Photo", type: "image", full: true },
      { key: "tags", label: "Dietary & badges", type: "multiselect", full: true, options: () => DIET_TAGS.map((t) => ({ value: t, label: t })) },
      { key: "available", label: "Available to order", type: "toggle" },
      { key: "featured", label: "Featured signature", type: "toggle" },
    ],
    defaults: (c) => ({ name: "", description: "", price: 0, categoryId: c.categories[0]?.id || "", image: "", tags: [], available: true, featured: false }),
  },
  categories: {
    title: "Categories",
    singular: "category",
    description: "Menu sections, in the order guests see them.",
    layout: "list",
    primary: "name",
    orderable: true,
    secondary: (r) => s(r.description),
    slugFrom: "name",
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "slug", label: "Slug", type: "text", hint: "Auto from name" },
      { key: "description", label: "Short description", type: "text", full: true },
    ],
    defaults: () => ({ name: "", slug: "", description: "" }),
  },
  gallery: {
    title: "Gallery",
    singular: "photo",
    description: "Photos for the homepage gallery and the gallery page. Tall and wide photos span more space.",
    layout: "grid",
    primary: "caption",
    image: "image",
    orderable: true,
    secondary: (r) => `${s(r.span)} tile`,
    fields: [
      { key: "image", label: "Photo", type: "image", full: true },
      { key: "caption", label: "Caption", type: "text" },
      { key: "span", label: "Tile size", type: "select", options: () => [{ value: "normal", label: "Normal" }, { value: "tall", label: "Tall" }, { value: "wide", label: "Wide" }] },
    ],
    defaults: () => ({ image: "", caption: "", span: "normal" }),
  },
  team: {
    title: "Team",
    singular: "team member",
    description: "The people behind the pass.",
    layout: "grid",
    primary: "name",
    image: "image",
    orderable: true,
    secondary: (r) => s(r.role),
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "role", label: "Role", type: "text" },
      { key: "image", label: "Portrait", type: "image", full: true },
      { key: "bio", label: "Short bio", type: "textarea", full: true, rows: 3 },
    ],
    defaults: () => ({ name: "", role: "", image: "", bio: "" }),
  },
  events: {
    title: "Events & experiences",
    singular: "event",
    description: "Tasting menus, supper clubs and masterclasses.",
    layout: "grid",
    primary: "title",
    image: "image",
    secondary: (r, c) => `${fmtDate(s(r.date))} · ${to12h(s(r.time))} · ${money(Number(r.price), c.currency)}`,
    toggles: [{ key: "published", label: "Published" }],
    fields: [
      { key: "title", label: "Title", type: "text", full: true },
      { key: "date", label: "Date", type: "date" },
      { key: "time", label: "Time", type: "time" },
      { key: "price", label: "Price per guest", type: "number" },
      { key: "seats", label: "Seats", type: "number" },
      { key: "image", label: "Cover image", type: "image", full: true },
      { key: "description", label: "Description", type: "textarea", full: true },
      { key: "published", label: "Published", type: "toggle" },
    ],
    defaults: () => ({ title: "", date: new Date().toISOString().slice(0, 10), time: "19:30", price: 0, seats: 20, image: "", description: "", published: true }),
  },
  posts: {
    title: "Journal",
    singular: "post",
    description: "Stories from the kitchen. Shown on /journal and the homepage.",
    layout: "list",
    primary: "title",
    image: "cover",
    slugFrom: "title",
    secondary: (r) => `${fmtDate(s(r.date))} · ${s(r.author)}`,
    toggles: [{ key: "published", label: "Published" }],
    fields: [
      { key: "title", label: "Title", type: "text", full: true },
      { key: "slug", label: "URL slug", type: "text", hint: "Auto from title" },
      { key: "author", label: "Author", type: "text" },
      { key: "date", label: "Publish date", type: "date" },
      { key: "tags", label: "Tags", type: "tags", hint: "Comma separated" },
      { key: "cover", label: "Cover image", type: "image", full: true },
      { key: "excerpt", label: "Excerpt", type: "textarea", full: true, rows: 2 },
      { key: "content", label: "Content", type: "textarea", full: true, rows: 14, hint: "Blank line = new paragraph · start a line with ## for a heading" },
      { key: "published", label: "Published", type: "toggle" },
    ],
    defaults: () => ({ title: "", slug: "", author: "", date: new Date().toISOString().slice(0, 10), tags: [], cover: "", excerpt: "", content: "", published: false }),
  },
  offers: {
    title: "Offers & coupons",
    singular: "offer",
    description: "Promo codes guests can apply at checkout.",
    layout: "grid",
    primary: "title",
    image: "image",
    secondary: (r, c) => `${s(r.code)} · ${s(r.discount)}% off over ${money(Number(r.minOrder), c.currency)}`,
    toggles: [{ key: "active", label: "Active" }],
    fields: [
      { key: "title", label: "Title", type: "text", full: true },
      { key: "description", label: "Description", type: "text", full: true },
      { key: "code", label: "Coupon code", type: "text", placeholder: "NOOR15" },
      { key: "discount", label: "Discount %", type: "number" },
      { key: "minOrder", label: "Minimum order", type: "number" },
      { key: "image", label: "Image", type: "image", full: true },
      { key: "active", label: "Active", type: "toggle" },
    ],
    defaults: () => ({ title: "", description: "", code: "", discount: 10, minOrder: 0, image: "", active: true }),
  },
  testimonials: {
    title: "Testimonials",
    singular: "testimonial",
    description: "Kind words from guests and critics.",
    layout: "list",
    primary: "name",
    secondary: (r) => `“${s(r.quote).slice(0, 90)}…”`,
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "role", label: "Role / source", type: "text" },
      { key: "quote", label: "Quote", type: "textarea", full: true },
      { key: "rating", label: "Rating (1–5)", type: "number" },
      { key: "avatar", label: "Avatar (optional)", type: "image", full: true },
    ],
    defaults: () => ({ name: "", role: "", quote: "", rating: 5, avatar: "" }),
  },
  faqs: {
    title: "FAQs",
    singular: "question",
    description: "Answers shown on the contact page.",
    layout: "list",
    primary: "q",
    orderable: true,
    secondary: (r) => s(r.a),
    fields: [
      { key: "q", label: "Question", type: "text", full: true },
      { key: "a", label: "Answer", type: "textarea", full: true },
    ],
    defaults: () => ({ q: "", a: "" }),
  },
};
