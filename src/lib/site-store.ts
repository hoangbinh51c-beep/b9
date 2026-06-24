import { useSyncExternalStore } from "react";
import type { SiteData, Product, BlogPost, Consultation, SiteSettings, VisitLog, Testimonial } from "./types";


import heroVideo from "../assets/hero-loop.mp4.asset.json";
import imgGiocha from "../assets/product-giocha.jpg";
import imgChalua from "../assets/product-chalua.jpg";
import imgChaque from "../assets/product-chaque.jpg";
import imgNemchua from "../assets/product-nemchua.jpg";
import imgGiavi from "../assets/product-giavi.jpg";
import imgMamtom from "../assets/product-mamtom.jpg";

const STORAGE_KEY = "hoangbinh_site_v2";
const VISITS_KEY = "hoangbinh_visits_v1";
const VISITS_CAP = 500;
const EMPTY_VISITS: VisitLog[] = [];

// ---------- Helpers ----------
export function normalizeTel(s: string): string {
  return (s || "").replace(/[^\d+]/g, "");
}

export function deriveZaloFromPhone(tel: string): string {
  const clean = normalizeTel(tel);
  if (!clean) return "";
  return `https://zalo.me/${clean.replace(/^\+?84/, "0")}`;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  brandName: "HOÀNG BÌNH",
  collectionTitle: "Bộ sưu tập Hoàng Bình",
  artisanName: "Hoàng Bình",
  heroEyebrow: "Thương hiệu gia vị Việt cao cấp",


  heroTitleLine1: "Hương vị đậm đà,",
  heroTitleLine2: "chuẩn vị Việt.",
  heroDescription:
    "Hoàng Bình — chuyên cung cấp gia vị nem chua, giò chả và đặc sản từ nguyên liệu chọn lọc. Đậm vị, sạch, an toàn — giao toàn quốc.",
  hotlineDisplay: "0978 686 019",
  hotlineTel: "0978686019",
  workingHours: "8:00 — 21:00 mỗi ngày",
  zaloUrl: "https://zalo.me/0978686019",
  messengerUrl: "https://www.facebook.com/messages/e2ee/t/1357109309853030/",
  address: "Số 1, Phố Hàng Buồm, Hà Nội",
  email: "lienhe@hoangbinh.vn",
  facebookUrl: "https://facebook.com/",
  footerNote: "© Hoàng Bình. Tất cả các quyền được bảo lưu.",
  heroVideoUrl: heroVideo.url,
  metaTitle: "Hoàng Bình — Gia vị nem chua, giò chả chuẩn vị Việt",
  metaDescription:
    "Hoàng Bình — gia vị nem chua, giò chả cao cấp. Nguyên liệu chọn lọc, công thức độc quyền, giao toàn quốc.",
  ogImage: "",
  marqueeText:
    "Giao hàng toàn quốc · Đặt trước Tết — nhận quà tặng · Hotline 0978 686 019 · Cam kết 100% nguyên liệu sạch · Gói quà sang trọng",
  heroTypewriter: ["Chả lụa Bắc Hà", "Nem chua Thanh Hoá", "Giò chả truyền thống", "Mắm tôm Hậu Lộc"],
};

const DEFAULT_PRODUCTS: Product[] = [
  { id: "p1", slug: "gio-cha", name: "Giò chả chuẩn vị Việt", image: imgGiocha, tag: "Bán chạy", price: "120.000đ", weight: "500g", shortDesc: "Giò chả dẻo dai, thơm vị tiêu và mắm cốt.", longDesc: "Giò chả Hoàng Bình được làm thủ công từ thịt heo nóng chọn lọc trong ngày, quết tay theo công thức độc quyền. Hương vị đậm đà, dẻo dai tự nhiên, không hàn the, không chất bảo quản.", order: 1, category: "Giò chả", stock: 100 },
  { id: "p2", slug: "cha-lua", name: "Chả lụa Bắc Hà", image: imgChalua, tag: "Mới", price: "150.000đ", weight: "500g", shortDesc: "Chả lụa mịn, giòn nhẹ, gói lá chuối xanh.", longDesc: "Chả lụa gói trong lá chuối tươi, hấp chín tới giữ trọn vị ngọt thịt, mặt cắt mịn — đặc trưng món Bắc tinh tế, mộc mạc mà sang.", order: 2, category: "Giò chả", stock: 80 },
  { id: "p3", slug: "cha-que", name: "Chả quế đặc biệt", image: imgChaque, tag: null, price: "180.000đ", weight: "500g", shortDesc: "Quế Trà My nguyên cây, vị ấm, ngọt hậu.", longDesc: "Chả quế làm từ quế Trà My nguyên cây, nướng than hoa cho lớp vỏ vàng cánh gián, vị quế ấm và ngọt hậu rất riêng.", order: 3, category: "Giò chả", stock: 60 },
  { id: "p4", slug: "nem-chua", name: "Nem chua Thanh Hoá", image: imgNemchua, tag: "Đặc sản", price: "90.000đ", weight: "20 chiếc", shortDesc: "Nem chua chua dịu, gói lá ổi tinh tế.", longDesc: "Nem chua Thanh Hoá lên men tự nhiên 2-3 ngày, vị chua dịu, gói lá ổi và lá chuối. Thưởng thức cùng tỏi ớt là tuyệt nhất.", order: 4, category: "Đặc sản", stock: 120 },
  { id: "p5", slug: "gia-vi-nem", name: "Gia vị nem chua", image: imgGiavi, tag: "Best seller", price: "55.000đ", weight: "200g", shortDesc: "Hỗn hợp gia vị chuẩn vị nguyên bản.", longDesc: "Bộ gia vị trộn nem chua chuẩn tỉ lệ nguyên bản — chỉ cần trộn cùng thịt nạc xay là có nem chua đúng vị, không phụ gia hoá học.", order: 5, category: "Gia vị", stock: 200 },
  { id: "p6", slug: "mam-tom", name: "Mắm tôm Hậu Lộc", image: imgMamtom, tag: "Signature", price: "75.000đ", weight: "350g", shortDesc: "Mắm tôm sánh đặc, dậy mùi đặc trưng.", longDesc: "Mắm tôm Hậu Lộc ủ chậm chọn lọc, sánh đặc, dậy mùi đặc trưng. Đánh cùng chanh đường ăn với bún đậu là chuẩn vị.", order: 6, category: "Gia vị", stock: 90 },
];

const DEFAULT_BLOG: BlogPost[] = [
  {
    id: "b1",
    slug: "bi-quyet-tron-nem-chua",
    title: "Bí quyết trộn nem chua đậm vị tại nhà",
    cover: imgGiavi,
    excerpt: "Chỉ với gói gia vị Hoàng Bình và vài bước đơn giản, bạn đã có mẻ nem chua chuẩn vị nguyên bản.",
    content: "Nguyên liệu: 500g thịt nạc xay, 100g bì heo, 1 gói gia vị Hoàng Bình.\n\nCách làm: Trộn đều thịt với gia vị, để 15 phút cho thấm. Vo viên, gói lá ổi và lá chuối. Ủ nơi thoáng 2-3 ngày là dùng được.\n\nMẹo: Thêm 1 thìa nước mắm cốt và vài lát tỏi để tăng hương vị.",
    date: "2026-06-01",
  },
];

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { id: "t1", name: "Chef Nguyễn Hoàng", role: "Bếp trưởng nhà hàng Phố Cổ", avatar: "https://i.pravatar.cc/160?img=12", rating: 5, order: 1 },
  { id: "t2", name: "Cô Lan Anh", role: "Chủ chuỗi bún đậu Hà Nội", avatar: "https://i.pravatar.cc/160?img=47", rating: 5, order: 2 },
  { id: "t3", name: "Anh Minh Tuấn", role: "Khách hàng thân thiết 3 năm", avatar: "https://i.pravatar.cc/160?img=33", rating: 5, order: 3 },
];

const DEFAULTS: SiteData = {
  settings: DEFAULT_SETTINGS,
  products: DEFAULT_PRODUCTS,
  blog: DEFAULT_BLOG,
  consultations: [],
  testimonials: DEFAULT_TESTIMONIALS,
};


let memory: SiteData = DEFAULTS;
let loaded = false;
const listeners = new Set<() => void>();

function load(): SiteData {
  if (typeof window === "undefined") return DEFAULTS;
  if (loaded) return memory;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SiteData>;
      memory = {
        settings: { ...DEFAULTS.settings, ...(parsed.settings || {}) },
        products: parsed.products?.length ? parsed.products : DEFAULTS.products,
        blog: parsed.blog ?? DEFAULTS.blog,
        consultations: parsed.consultations ?? [],
        testimonials: parsed.testimonials ?? DEFAULTS.testimonials,
      };

    } else {
      memory = DEFAULTS;
    }
  } catch {
    memory = DEFAULTS;
  }
  loaded = true;
  return memory;
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch (e) {
    console.warn("Failed to persist site data", e);
  }
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      loaded = false;
      load();
      listeners.forEach((l) => l());
    }
  });
}

export function getSiteData(): SiteData {
  return load();
}

export function setSiteData(updater: (d: SiteData) => SiteData) {
  memory = updater(load());
  persist();
}

export function useSiteData(): SiteData {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => load(),
    () => DEFAULTS,
  );
}

// Mutations ----------------------------------------------------------------

export function updateSettings(patch: Partial<SiteSettings>) {
  setSiteData((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
}

export function upsertProduct(p: Product) {
  setSiteData((d) => {
    const idx = d.products.findIndex((x) => x.id === p.id);
    const list = [...d.products];
    if (idx >= 0) list[idx] = p;
    else list.push(p);
    return { ...d, products: list };
  });
}

export function duplicateProduct(id: string) {
  setSiteData((d) => {
    const src = d.products.find((p) => p.id === id);
    if (!src) return d;
    const copy: Product = {
      ...src,
      id: `p_${Date.now()}`,
      slug: `${src.slug}-copy`,
      name: `${src.name} (bản sao)`,
      order: (src.order ?? d.products.length) + 1,
    };
    return { ...d, products: [...d.products, copy] };
  });
}

export function deleteProduct(id: string) {
  setSiteData((d) => ({ ...d, products: d.products.filter((p) => p.id !== id) }));
}

export function deleteProducts(ids: string[]) {
  const set = new Set(ids);
  setSiteData((d) => ({ ...d, products: d.products.filter((p) => !set.has(p.id)) }));
}

export function moveProduct(id: string, dir: -1 | 1) {
  setSiteData((d) => {
    const list = [...d.products];
    const i = list.findIndex((p) => p.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return d;
    [list[i], list[j]] = [list[j], list[i]];
    return { ...d, products: list };
  });
}

export function upsertBlog(b: BlogPost) {
  setSiteData((d) => {
    const idx = d.blog.findIndex((x) => x.id === b.id);
    const list = [...d.blog];
    if (idx >= 0) list[idx] = b;
    else list.unshift(b);
    return { ...d, blog: list };
  });
}

export function deleteBlog(id: string) {
  setSiteData((d) => ({ ...d, blog: d.blog.filter((b) => b.id !== id) }));
}

export function addConsultation(c: Omit<Consultation, "id" | "createdAt" | "handled">) {
  const item: Consultation = {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    handled: false,
    ...c,
  };
  setSiteData((d) => ({ ...d, consultations: [item, ...d.consultations] }));
}

export function toggleConsultation(id: string) {
  setSiteData((d) => ({
    ...d,
    consultations: d.consultations.map((c) =>
      c.id === id ? { ...c, handled: !c.handled } : c,
    ),
  }));
}

export function setConsultationsHandled(ids: string[], handled: boolean) {
  const set = new Set(ids);
  setSiteData((d) => ({
    ...d,
    consultations: d.consultations.map((c) =>
      set.has(c.id) ? { ...c, handled } : c,
    ),
  }));
}

export function deleteConsultation(id: string) {
  setSiteData((d) => ({ ...d, consultations: d.consultations.filter((c) => c.id !== id) }));
}

export function deleteConsultations(ids: string[]) {
  const set = new Set(ids);
  setSiteData((d) => ({ ...d, consultations: d.consultations.filter((c) => !set.has(c.id)) }));
}

export function resetSiteData() {
  memory = DEFAULTS;
  persist();
}

export function exportSiteData(): string {
  return JSON.stringify(load(), null, 2);
}

export function importSiteData(json: string) {
  const parsed = JSON.parse(json) as SiteData;
  memory = {
    settings: { ...DEFAULTS.settings, ...parsed.settings },
    products: parsed.products ?? [],
    blog: parsed.blog ?? [],
    consultations: parsed.consultations ?? [],
    testimonials: parsed.testimonials ?? [],
  };
  persist();
}

// Testimonials ------------------------------------------------------------

export function upsertTestimonial(t: Testimonial) {
  setSiteData((d) => {
    const idx = d.testimonials.findIndex((x) => x.id === t.id);
    const list = [...d.testimonials];
    if (idx >= 0) list[idx] = t;
    else list.push(t);
    return { ...d, testimonials: list };
  });
}

export function deleteTestimonial(id: string) {
  setSiteData((d) => ({ ...d, testimonials: d.testimonials.filter((x) => x.id !== id) }));
}

export function moveTestimonial(id: string, dir: -1 | 1) {
  setSiteData((d) => {
    const list = [...d.testimonials];
    const i = list.findIndex((x) => x.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return d;
    [list[i], list[j]] = [list[j], list[i]];
    return { ...d, testimonials: list };
  });
}


// Visits -------------------------------------------------------------------

const visitListeners = new Set<() => void>();
let visitsMemory: VisitLog[] = EMPTY_VISITS;
let visitsLoaded = false;

export function getVisits(): VisitLog[] {
  if (typeof window === "undefined") return EMPTY_VISITS;
  if (visitsLoaded) return visitsMemory;
  try {
    const raw = window.localStorage.getItem(VISITS_KEY);
    if (!raw) visitsMemory = EMPTY_VISITS;
    else {
      const parsed = JSON.parse(raw) as unknown;
      visitsMemory = Array.isArray(parsed) ? (parsed as VisitLog[]) : EMPTY_VISITS;
    }
  } catch {
    visitsMemory = EMPTY_VISITS;
  }
  visitsLoaded = true;
  return visitsMemory;
}

function persistVisits(list: VisitLog[]) {
  if (typeof window === "undefined") return;
  visitsMemory = list;
  visitsLoaded = true;
  try {
    window.localStorage.setItem(VISITS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Failed to persist visits", e);
  }
  visitListeners.forEach((l) => l());
}

export function recordVisit(info: { path: string; referrer?: string }) {
  if (typeof window === "undefined") return;
  const list = [...getVisits()];
  const item: VisitLog = {
    id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ts: new Date().toISOString(),
    path: info.path,
    referrer: info.referrer ?? document.referrer ?? "",
    ua: navigator.userAgent || "",
  };
  list.unshift(item);
  if (list.length > VISITS_CAP) list.length = VISITS_CAP;
  persistVisits(list);
}

export function clearVisits() {
  persistVisits([]);
}

export function useVisits(): VisitLog[] {
  return useSyncExternalStore(
    (cb) => {
      visitListeners.add(cb);
      return () => visitListeners.delete(cb);
    },
    () => getVisits(),
    () => EMPTY_VISITS,
  );
}

// Admin gate ---------------------------------------------------------------

const ADMIN_KEY = "hoangbinh_admin";
const ADMIN_CODE_KEY = "hoangbinh_admin_code";
const DEFAULT_ADMIN_CODE = "BINH2008";

export function getAdminCode(): string {
  if (typeof window === "undefined") return DEFAULT_ADMIN_CODE;
  return window.localStorage.getItem(ADMIN_CODE_KEY) || DEFAULT_ADMIN_CODE;
}

export function setAdminCode(code: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_CODE_KEY, code);
}

// Backwards-compatible export; old code reads this as constant
export const ADMIN_CODE = DEFAULT_ADMIN_CODE;

export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_KEY) === "1";
}

export function setAdmin(v: boolean) {
  if (typeof window === "undefined") return;
  if (v) window.localStorage.setItem(ADMIN_KEY, "1");
  else window.localStorage.removeItem(ADMIN_KEY);
}
