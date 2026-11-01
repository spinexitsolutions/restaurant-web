import type { Database, MenuItem, Reservation, Order, Customer } from "./types";

export const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const IMG = {
  interiorDark: u("1517248135467-4c7edcad34c4"),
  fineDining: u("1414235077428-338989a2e8c0"),
  curryNaan: u("1565557623262-b51c2513a641", 1000),
  curries: u("1585937421612-70a008356fbe", 1000),
  samosa: u("1601050690597-df0568f70950", 1000),
  kebabs: u("1599487488170-d11ec9c172f0", 1000),
  biryani: u("1563379091339-03b21ab4a4f8", 1000),
  biryaniPlate: u("1589302168068-964664d93dc0", 1000),
  terrace: u("1559339352-11d035aa65de"),
  chefCopper: u("1577219491135-ce391730fb2c", 1200),
  chefPortrait: u("1583394293214-28ded15ee548", 1000),
  knife: u("1551218808-94e220e084d2", 1200),
  pannaCotta: u("1488477181946-6428a0291777", 1000),
  cocktail: u("1514362545857-3bc16c4c7d1b", 1000),
  oldFashioned: u("1470337458703-46ad1756a187", 1000),
  darkInterior: u("1590846406792-0adc7f938f1d"),
  flameChef: u("1600565193348-f74bd3c7ccdf", 1200),
  openKitchen: u("1556910103-1c02745aae4d", 1200),
  pavBhaji: u("1606491956689-2ea866880c84", 1000),
  paneerMakhani: u("1631452180519-c014fe946bc7", 1000),
  curryPan: u("1596797038530-2c107229654b", 1000),
  prawnCurry: u("1559847844-5315695dadae", 1000),
  diningRoom: u("1552566626-52f8b828add9"),
  peopleDining: u("1592861956120-e524fc739696", 1200),
  platedDark: u("1542528180-a1208c5169a5", 1000),
  fishCurry: u("1574484284002-952d92456975", 1000),
  paneerTikka: u("1567188040759-fb8a883dc6d8", 1000),
  chaat: u("1610192244261-3f33de3f55e4", 1000),
  thali: u("1626777552726-4a6b54c97e46", 1200),
  chickenTikka: u("1628294895950-9805252327bc", 1000),
  dough: u("1517686469429-8bdb88b9f907", 1000),
  crowd: u("1528605248644-14dd04022da1", 1200),
  aerial: u("1559329007-40df8a9345d8", 1200),
  pulao: u("1512058564366-18510be2db19", 1000),
  barInterior: u("1578474846511-04ba529f0b88", 1400),
  darkRoom: u("1525648199074-cee30ba79a4a", 1400),
  momos: u("1534422298391-e4f8c172dddb", 1000),
  whisky: u("1470337458703-46ad1756a187", 1000),
  steak: u("1600891964092-4316c288032e", 1000),
  spread: u("1504674900247-0877df9cc836", 1000),
};
export { IMG };

const now = new Date();
const iso = (d: Date) => d.toISOString();
const day = (offset: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};
const ago = (hours: number) => iso(new Date(now.getTime() - hours * 3600_000));

const menu: Omit<MenuItem, "order">[] = [
  // Small plates
  { id: "m1", name: "Smoked Samosa", description: "Potato, green pea & fennel, tamarind glass, mint snow.", price: 345, categoryId: "c1", image: IMG.samosa, tags: ["veg", "bestseller"], available: true, featured: true },
  { id: "m2", name: "Dahi Puri Chaat", description: "Crisp shells, hung curd, pomegranate, beetroot chutney.", price: 395, categoryId: "c1", image: IMG.chaat, tags: ["veg", "new"], available: true, featured: false },
  { id: "m3", name: "Gunpowder Momos", description: "Hand-pleated dumplings, smoked chilli oil, sesame.", price: 425, categoryId: "c1", image: IMG.momos, tags: ["spicy"], available: true, featured: false },
  { id: "m4", name: "Pav Bhaji Brioche", description: "Butter-toasted brioche, slow bhaji, pickled shallot.", price: 365, categoryId: "c1", image: IMG.pavBhaji, tags: ["veg"], available: true, featured: false },
  // Tandoor
  { id: "m5", name: "Malai Paneer Tikka", description: "Cream-cheese marinade, charred peppers, kasundi.", price: 545, categoryId: "c2", image: IMG.paneerTikka, tags: ["veg", "gf", "chef"], available: true, featured: true },
  { id: "m6", name: "Seekh of the Day", description: "Hand-minced lamb, bone-marrow butter, ember onion.", price: 745, categoryId: "c2", image: IMG.kebabs, tags: ["spicy", "gf"], available: true, featured: true },
  { id: "m7", name: "Tandoori Murgh", description: "48-hour yoghurt cure, kashmiri chilli, lime ash.", price: 695, categoryId: "c2", image: IMG.chickenTikka, tags: ["gf", "bestseller"], available: true, featured: false },
  // Mains
  { id: "m8", name: "Noor Butter Chicken", description: "Our 1986 recipe. Tomato, fenugreek, cultured butter.", price: 795, categoryId: "c3", image: IMG.curryNaan, tags: ["chef", "bestseller"], available: true, featured: true },
  { id: "m9", name: "Paneer Makhani", description: "House-pressed paneer, velvet makhani, smoked cream.", price: 645, categoryId: "c3", image: IMG.paneerMakhani, tags: ["veg", "gf"], available: true, featured: false },
  { id: "m10", name: "Malabar Prawn Curry", description: "Tiger prawns, raw mango, coconut, curry leaf tempering.", price: 945, categoryId: "c3", image: IMG.prawnCurry, tags: ["spicy", "gf"], available: true, featured: true },
  { id: "m11", name: "Goan Fish Caldine", description: "Line-caught seer, turmeric coconut, kokum.", price: 895, categoryId: "c3", image: IMG.fishCurry, tags: ["gf", "new"], available: true, featured: false },
  { id: "m12", name: "Laal Maas", description: "Mathania chilli, slow-braised lamb shoulder, bajra roti.", price: 895, categoryId: "c3", image: IMG.curryPan, tags: ["spicy", "chef"], available: true, featured: false },
  // Rice & breads
  { id: "m13", name: "Dum Gosht Biryani", description: "Aged basmati, saffron, lamb, sealed under pastry.", price: 845, categoryId: "c4", image: IMG.biryani, tags: ["bestseller"], available: true, featured: true },
  { id: "m14", name: "Subz Pulao", description: "Garden vegetables, whole spice, crisp onion.", price: 495, categoryId: "c4", image: IMG.pulao, tags: ["veg", "vegan", "gf"], available: true, featured: false },
  { id: "m15", name: "The Noor Thali", description: "A daily-changing tasting of eight small bowls.", price: 1295, categoryId: "c4", image: IMG.thali, tags: ["veg", "chef"], available: true, featured: false },
  // Desserts
  { id: "m16", name: "Saffron Panna Cotta", description: "Kesar milk set, strawberry rose, pistachio dust.", price: 395, categoryId: "c5", image: IMG.pannaCotta, tags: ["veg", "gf", "new"], available: true, featured: true },
  // Bar
  { id: "m17", name: "Monsoon Negroni", description: "Gin, jamun vermouth, bitter orange, smoke.", price: 695, categoryId: "c6", image: IMG.cocktail, tags: ["chef"], available: true, featured: false },
  { id: "m18", name: "Masala Old Fashioned", description: "Indian single malt, jaggery, chai bitters.", price: 795, categoryId: "c6", image: IMG.oldFashioned, tags: ["bestseller"], available: true, featured: false },
];

const firstNames = ["Aarav", "Ananya", "Kabir", "Meera", "Rohan", "Isha", "Vihaan", "Saanvi", "Arjun", "Diya", "Kiara", "Reyansh", "Zoya", "Aditya", "Tara", "Nikhil"];
const lastNames = ["Sharma", "Kapoor", "Mehta", "Iyer", "Reddy", "Khan", "Bose", "Malhotra", "Desai", "Nair", "Gill", "Verma"];

const customers: Customer[] = firstNames.map((f, i) => {
  const l = lastNames[i % lastNames.length];
  const visits = (i * 7) % 13 + 1;
  return {
    id: `cu${i + 1}`,
    name: `${f} ${l}`,
    email: `${f.toLowerCase()}.${l.toLowerCase()}@mail.com`,
    phone: `+91 98${String(10000000 + i * 7345123).slice(0, 8)}`,
    tags: visits > 9 ? ["VIP", "Regular"] : visits > 4 ? ["Regular"] : ["New"],
    notes: i % 4 === 0 ? "Prefers window table. Allergic to peanuts." : "",
    visits,
    orders: (i * 3) % 7,
    totalSpent: visits * 2850 + ((i * 3) % 7) * 1200,
    lastSeen: ago(i * 30 + 5),
    source: i % 3 === 0 ? "Walk-in" : i % 3 === 1 ? "Website" : "Instagram",
    birthday: `199${i % 10}-0${(i % 9) + 1}-1${i % 9}`,
    createdAt: ago(24 * (i * 5 + 1)),
  };
});

const statuses: Reservation["status"][] = ["pending", "confirmed", "confirmed", "seated", "completed", "pending", "cancelled", "confirmed"];
const occasions = ["Birthday", "Anniversary", "Business", "Date night", "", "", "Celebration", ""];
const slots = ["12:30", "13:00", "13:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];

const reservations: Reservation[] = Array.from({ length: 14 }, (_, i) => {
  const c = customers[i % customers.length];
  return {
    id: `r${i + 1}`,
    name: c.name,
    email: c.email,
    phone: c.phone,
    date: day((i % 7) - 2),
    time: slots[i % slots.length],
    guests: (i % 6) + 2,
    occasion: occasions[i % occasions.length],
    notes: i % 5 === 0 ? "High chair needed." : "",
    status: statuses[i % statuses.length],
    table: i % 3 === 0 ? `T${(i % 12) + 1}` : "",
    createdAt: ago(i * 9 + 2),
  };
});

const orderStatuses: Order["status"][] = ["new", "preparing", "ready", "out-for-delivery", "completed", "completed", "completed", "cancelled"];
const orders: Order[] = Array.from({ length: 18 }, (_, i) => {
  const c = customers[(i * 5) % customers.length];
  const a = menu[(i * 3) % menu.length];
  const b = menu[(i * 7 + 2) % menu.length];
  const items = [
    { itemId: a.id, name: a.name, price: a.price, qty: (i % 2) + 1 },
    { itemId: b.id, name: b.name, price: b.price, qty: 1 },
  ];
  const subtotal = items.reduce((s, x) => s + x.price * x.qty, 0);
  const tax = Math.round(subtotal * 0.05);
  const deliveryFee = i % 3 === 0 ? 0 : 49;
  return {
    id: `o${i + 1}`,
    code: `NR${(4821 + i * 13).toString()}`,
    name: c.name,
    phone: c.phone,
    email: c.email,
    address: i % 3 === 0 ? "" : `${12 + i}, Linking Road, Bandra West, Mumbai`,
    type: i % 3 === 0 ? "pickup" : "delivery",
    items,
    subtotal,
    tax,
    deliveryFee,
    discount: 0,
    coupon: "",
    total: subtotal + tax + deliveryFee,
    payment: i % 2 ? "upi" : "cod",
    status: orderStatuses[i % orderStatuses.length],
    notes: "",
    createdAt: ago(i * 11 + 1),
  };
});

export function createSeed(): Database {
  return {
    settings: {
      brand: {
        name: "Noor",
        tagline: "A modern Indian table",
        description:
          "Noor is a modern Indian kitchen & bar in Bandra — where four generations of family recipes meet fire, seasonality and a little bit of theatre.",
        accent: "#2F3CFF",
        accentSoft: "#FFC83D",
        ink: "#0F0F12",
        paper: "#F2EEE6",
      },
      contact: {
        phone: "+91 98200 12345",
        whatsapp: "919820012345",
        email: "hello@noor.kitchen",
        address: "14 Carter Road, Bandra West",
        city: "Mumbai 400050",
        mapQuery: "Carter Road Bandra West Mumbai",
      },
      hours: [
        { day: "Monday", open: "", close: "", closed: true },
        { day: "Tuesday", open: "12:00", close: "23:30", closed: false },
        { day: "Wednesday", open: "12:00", close: "23:30", closed: false },
        { day: "Thursday", open: "12:00", close: "23:30", closed: false },
        { day: "Friday", open: "12:00", close: "01:00", closed: false },
        { day: "Saturday", open: "12:00", close: "01:00", closed: false },
        { day: "Sunday", open: "12:00", close: "23:00", closed: false },
      ],
      socials: {
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        x: "https://x.com",
        youtube: "https://youtube.com",
      },
      intro: {
        enabled: true,
        style: "curtain",
        words: ["Fire", "Spice", "Story", "Noor"],
        durationMs: 2600,
        oncePerSession: true,
      },
      announcement: {
        enabled: true,
        text: "New — The Monsoon Tasting Menu is here. Seven courses, one evening.",
        link: "/events",
      },
      hero: {
        eyebrow: "Modern Indian Kitchen & Bar · Bandra, Mumbai",
        title: "Fire-led",
        titleAccent: "Indian table",
        subtitle:
          "Heirloom recipes, rewritten with seasonal produce and a wood-fired tandoor. Dinner, drinks and the kind of evenings you remember.",
        image: IMG.interiorDark,
        ctaPrimary: "Reserve a table",
        ctaSecondary: "Explore the menu",
        marquee: ["Wood-fired tandoor", "Seasonal tasting menu", "Cocktail bar", "Private dining", "Since 1986"],
      },
      manifesto:
        "We believe a great meal is part memory, part fire and part company. Every plate at Noor begins with a family recipe, is cooked over live coals and ends with someone you love asking for one more bite.",
      story: {
        eyebrow: "Our story",
        title: "Four generations. One fire.",
        body:
          "It started in 1986 with a single tandoor and our grandmother's spice tin. Today Chef Aditi Rao carries that tin into a modern kitchen — keeping the soul, rethinking the plate. Everything is made in-house: the paneer, the pickles, the bread and the bitters.",
        image: IMG.chefCopper,
        imageAlt: IMG.knife,
        signature: "Aditi Rao, Chef & Founder",
      },
      stats: [
        { label: "Years of fire", value: 38, suffix: "+" },
        { label: "Dishes on rotation", value: 64, suffix: "" },
        { label: "Guests every week", value: 2400, suffix: "+" },
        { label: "Spices ground daily", value: 27, suffix: "" },
      ],
      sections: [
        { id: "hero", label: "Hero", visible: true },
        { id: "manifesto", label: "Manifesto", visible: true },
        { id: "signatures", label: "Signature dishes", visible: true },
        { id: "story", label: "Our story", visible: true },
        { id: "stats", label: "Numbers", visible: true },
        { id: "menu", label: "Menu preview", visible: true },
        { id: "experiences", label: "Experiences & events", visible: true },
        { id: "gallery", label: "Gallery", visible: true },
        { id: "offers", label: "Offers", visible: true },
        { id: "testimonials", label: "Testimonials", visible: true },
        { id: "journal", label: "Journal", visible: true },
        { id: "reserve", label: "Reservation", visible: true },
        { id: "visit", label: "Visit us", visible: true },
      ],
      reservations: {
        enabled: true,
        maxGuests: 12,
        slots: ["12:30", "13:00", "13:30", "14:00", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"],
        note: "Tables are held for 15 minutes. For parties larger than 12, write to us for private dining.",
      },
      ordering: {
        enabled: true,
        currency: "₹",
        taxRate: 5,
        deliveryFee: 49,
        freeDeliveryAbove: 1500,
        minOrder: 300,
        etaMinutes: 40,
      },
      seo: {
        title: "Noor — Modern Indian Kitchen & Bar, Mumbai",
        description: "Heirloom Indian recipes cooked over fire. Reserve a table, order online or plan a private dinner at Noor, Bandra.",
        ogImage: IMG.interiorDark,
      },
    },
    categories: [
      { id: "c1", name: "Small Plates", slug: "small-plates", description: "To share, or not.", order: 1 },
      { id: "c2", name: "From the Tandoor", slug: "tandoor", description: "Live coals, 480°C.", order: 2 },
      { id: "c3", name: "Mains", slug: "mains", description: "Slow-cooked, heirloom.", order: 3 },
      { id: "c4", name: "Rice & Thali", slug: "rice", description: "The heart of the table.", order: 4 },
      { id: "c5", name: "Desserts", slug: "desserts", description: "A sweet full stop.", order: 5 },
      { id: "c6", name: "Bar", slug: "bar", description: "Spice-forward cocktails.", order: 6 },
    ],
    menuItems: menu.map((m, i) => ({ ...m, order: i + 1 })),
    reservations,
    orders,
    customers,
    messages: [
      { id: "ms1", name: "Priya Menon", email: "priya@studio.in", phone: "+91 99000 11223", subject: "Private dining for 30", message: "Hi! We're planning a company dinner for ~30 people next month. Do you have a private space and a set menu?", read: false, createdAt: ago(3) },
      { id: "ms2", name: "James Carter", email: "james@carter.co", phone: "", subject: "Gluten-free options", message: "Visiting Mumbai next week — is most of the menu gluten free? My partner is coeliac.", read: false, createdAt: ago(20) },
      { id: "ms3", name: "Neha Joshi", email: "neha.j@mail.com", phone: "+91 98111 22334", subject: "Loved the thali!", message: "Just wanted to say the Sunday thali was outstanding. Thank you to the team.", read: true, createdAt: ago(70) },
    ],
    subscribers: [
      { id: "s1", email: "foodie@mail.com", createdAt: ago(40) },
      { id: "s2", email: "dine.out@mail.com", createdAt: ago(120) },
      { id: "s3", email: "spice.lover@mail.com", createdAt: ago(300) },
    ],
    testimonials: [
      { id: "t1", name: "Rashmi Uday Singh", role: "Food critic", quote: "The butter chicken alone is worth crossing the city for. Noor cooks with memory and fire in equal measure.", rating: 5, avatar: "" },
      { id: "t2", name: "Karan Malhotra", role: "Regular since 2019", quote: "Every visit feels like a dinner party at the best-dressed house on the street. The Monsoon Negroni is dangerous.", rating: 5, avatar: "" },
      { id: "t3", name: "Elena Rossi", role: "Travel writer, Condé Nast", quote: "Mumbai's most quietly confident kitchen. Book the counter and watch the tandoor.", rating: 5, avatar: "" },
      { id: "t4", name: "Sameer Khan", role: "Google review", quote: "Service is warm without hovering, the biryani arrives sealed in pastry, and the room just glows.", rating: 5, avatar: "" },
    ],
    gallery: [
      { id: "g1", image: IMG.barInterior, caption: "The bar", span: "wide", order: 1 },
      { id: "g2", image: IMG.flameChef, caption: "Live fire", span: "tall", order: 2 },
      { id: "g3", image: IMG.thali, caption: "The thali", span: "normal", order: 3 },
      { id: "g4", image: IMG.peopleDining, caption: "Friday nights", span: "normal", order: 4 },
      { id: "g5", image: IMG.cocktail, caption: "Monsoon Negroni", span: "tall", order: 5 },
      { id: "g6", image: IMG.aerial, caption: "The dining room", span: "wide", order: 6 },
      { id: "g7", image: IMG.dough, caption: "Bread, by hand", span: "normal", order: 7 },
      { id: "g8", image: IMG.platedDark, caption: "Tasting menu", span: "normal", order: 8 },
    ],
    team: [
      { id: "tm1", name: "Aditi Rao", role: "Chef & Founder", bio: "Third-generation cook. Trained in Lyon, raised in her grandmother's kitchen.", image: IMG.chefCopper, order: 1 },
      { id: "tm2", name: "Kenji Mori", role: "Head of Tandoor", bio: "Fifteen years behind live fire. Believes smoke is a seasoning.", image: IMG.chefPortrait, order: 2 },
      { id: "tm3", name: "Rahul Fernandes", role: "Bar Director", bio: "Builds cocktails from the spice market up.", image: IMG.flameChef, order: 3 },
    ],
    events: [
      { id: "e1", title: "Monsoon Tasting Menu", date: day(6), time: "19:30", description: "Seven courses built around the rains — raw mango, kokum, jackfruit and smoke. Optional cocktail pairing.", image: IMG.platedDark, price: 4500, seats: 24, published: true },
      { id: "e2", title: "Sunday Thali Club", date: day(9), time: "12:30", description: "A long, slow Sunday lunch. Eight bowls, unlimited bread, family style.", image: IMG.thali, price: 1800, seats: 60, published: true },
      { id: "e3", title: "Tandoor Masterclass", date: day(16), time: "16:00", description: "Two hours at the fire with Kenji. Marinades, skewers, timing — and dinner after.", image: IMG.kebabs, price: 3500, seats: 12, published: true },
    ],
    posts: [
      {
        id: "p1",
        title: "Why we cook everything over live fire",
        slug: "why-live-fire",
        excerpt: "Gas is convenient. Fire is honest. A short note on the tandoor at the heart of our kitchen.",
        content:
          "Every morning at 9am, before anyone else arrives, Kenji lights the tandoor. It takes three hours to reach temperature — 480°C at the walls — and it does not go out until the last table leaves.\n\n## Smoke is a seasoning\n\nThe clay walls hold heat like a stone holds the sun. Marinated meat and paneer cook fast, the sugars catch, the fat drips onto coal and comes back as smoke. You cannot fake that flavour.\n\n## Slow, on purpose\n\nCooking this way is less efficient. It is also the only way we know how to make food that tastes like the memory of it.",
        cover: IMG.flameChef,
        author: "Aditi Rao",
        date: day(-12),
        tags: ["Kitchen", "Fire"],
        published: true,
      },
      {
        id: "p2",
        title: "The story behind the 1986 butter chicken",
        slug: "butter-chicken-1986",
        excerpt: "A recipe written on the back of a ration card, and why we have never changed it.",
        content:
          "My grandmother wrote it on the back of a ration card. Tomatoes from the market, butter churned at home, kasuri methi crushed between her palms.\n\n## What changed\n\nNothing, except the butter — we now culture our own.\n\n## What never will\n\nThe patience. Four hours, low heat, stirred by hand.",
        cover: IMG.curryNaan,
        author: "Aditi Rao",
        date: day(-30),
        tags: ["Recipes", "Heritage"],
        published: true,
      },
      {
        id: "p3",
        title: "A guide to our cocktail list",
        slug: "cocktail-guide",
        excerpt: "Jamun vermouth, chai bitters and other things we make in the back.",
        content:
          "Rahul's bar starts at the spice market. Every syrup, bitters and infusion is made in-house.\n\n## Start here\n\nThe Monsoon Negroni — gin, our jamun vermouth and a whisper of smoke.\n\n## End here\n\nThe Masala Old Fashioned. Indian single malt, jaggery and chai.",
        cover: IMG.cocktail,
        author: "Rahul Fernandes",
        date: day(-48),
        tags: ["Bar"],
        published: true,
      },
    ],
    offers: [
      { id: "of1", title: "First order, on us", description: "15% off your first online order.", code: "NOOR15", discount: 15, minOrder: 800, active: true, image: IMG.spread },
      { id: "of2", title: "Weekday lunch", description: "20% off lunch orders, Tue–Thu.", code: "LUNCH20", discount: 20, minOrder: 1200, active: true, image: IMG.thali },
    ],
    faqs: [
      { id: "f1", q: "Do you take walk-ins?", a: "Yes — we keep the bar and counter seats for walk-ins every evening. For the dining room we recommend booking.", order: 1 },
      { id: "f2", q: "Is there a dress code?", a: "Smart casual. Come as you are, just a little dressed up.", order: 2 },
      { id: "f3", q: "Do you cater to allergies?", a: "Absolutely. Most of our menu is naturally gluten-free and we can adapt dishes for nut, dairy and other allergies. Let us know when you book.", order: 3 },
      { id: "f4", q: "Do you host private events?", a: "Our private dining room seats up to 30. Write to us via the contact page and our events team will reply within a day.", order: 4 },
      { id: "f5", q: "Is parking available?", a: "Valet parking is available every evening from 7pm.", order: 5 },
    ],
  };
}
