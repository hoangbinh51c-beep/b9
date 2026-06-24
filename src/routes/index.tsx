import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Phone, MessageCircle, MessageSquareMore, ShoppingBag, Leaf, ShieldCheck, Truck, Award,
  PlayCircle, Send, Menu, X, MapPin, Mail, Facebook, Lock,
  ArrowRight, Sparkles, Clock, ChevronLeft, ChevronRight, Images as ImageIconLucide, Star,
} from "lucide-react";

import { toast } from "sonner";
import { z } from "zod";

import heroPoster from "../assets/hero-poster.jpg";
import {
  useSiteData, addConsultation, getAdminCode, setAdmin, normalizeTel, recordVisit,
} from "../lib/site-store";
import type { Product, BlogPost, Testimonial } from "../lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

const FEATURES = [
  { icon: Leaf, title: "Nguyên liệu chọn lọc", desc: "Thịt tươi trong ngày, gia vị từ vùng nguyên liệu uy tín." },
  { icon: ShieldCheck, title: "An toàn vệ sinh", desc: "Quy trình khép kín, đạt chuẩn ATTP, kiểm định nghiêm ngặt." },
  { icon: Award, title: "Công thức độc quyền", desc: "Bí quyết chế biến chọn lọc — tinh hoa ẩm thực Việt." },
  { icon: Truck, title: "Giao hàng toàn quốc", desc: "Đóng gói hút chân không, giao nhanh, giữ trọn hương vị." },
];

const telHref = (t: string) => `tel:${normalizeTel(t)}`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hoàng Bình — Gia vị nem chua, giò chả chuẩn vị Việt" },
      { name: "description", content: "Hoàng Bình — gia vị nem chua, giò chả cao cấp. Nguyên liệu chọn lọc, công thức độc quyền, giao toàn quốc." },
      { property: "og:title", content: "Hoàng Bình — Hương vị đậm đà, chuẩn vị Việt" },
      { property: "og:description", content: "Đặc sản Việt – chuẩn vị, chọn lọc thủ công. Gia vị nem chua, giò chả và đặc sản Hoàng Bình." },
      { property: "og:image", content: heroPoster },
      { name: "twitter:image", content: heroPoster },
    ],
  }),
  component: Index,
});

function Index() {
  const { settings } = useSiteData();
  const [openProduct, setOpenProduct] = useState<Product | null>(null);
  const [openBlog, setOpenBlog] = useState<BlogPost | null>(null);

  useEffect(() => {
    recordVisit({ path: window.location.pathname + window.location.search });
  }, []);

  useEffect(() => {
    if (settings.metaTitle) document.title = settings.metaTitle;
    if (settings.metaDescription) {
      let m = document.querySelector('meta[name="description"]');
      if (!m) {
        m = document.createElement("meta");
        m.setAttribute("name", "description");
        document.head.appendChild(m);
      }
      m.setAttribute("content", settings.metaDescription);
    }
  }, [settings.metaTitle, settings.metaDescription]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground" style={{ fontFamily: '"Be Vietnam Pro", system-ui, sans-serif' }}>
      <Header />
      <Marquee />
      <Hero />
      <Features />
      <Products onOpen={setOpenProduct} />
      <BlogSection onOpen={setOpenBlog} />
      <Testimonials />
      <Consultation />

      <Footer />
      <FloatingChat />
      <ProductDialog product={openProduct} onClose={() => setOpenProduct(null)} />
      <BlogDialog post={openBlog} onClose={() => setOpenBlog(null)} />
    </div>
  );
}

// ----- Marquee announcement bar -----
function Marquee() {
  const { settings } = useSiteData();
  const text = (settings.marqueeText ?? "").trim();
  if (!text) return null;
  const items = text.split(/\s*·\s*|\s*•\s*|\s*\|\s*/).filter(Boolean);
  if (items.length === 0) return null;
  const row = [...items, ...items];
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[68px] z-30 overflow-hidden border-y border-primary/30 bg-primary text-primary-foreground shadow-md sm:top-[76px]">
      <div className="marquee-track py-2 text-xs font-medium tracking-wide sm:text-sm">
        {row.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-3">
            <Sparkles className="h-3.5 w-3.5 opacity-80" />
            <span>{t}</span>
          </span>
        ))}
      </div>
    </div>
  );
}


// ----- Header -----
function Header() {
  const { settings } = useSiteData();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navClass = scrolled
    ? "bg-background/90 text-foreground shadow-[0_2px_20px_-10px_rgba(0,0,0,0.2)] backdrop-blur-xl border-b border-border/60"
    : "bg-transparent text-white";

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${navClass}`}>
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <a href="#top" className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-primary-foreground font-bold shadow-lg" style={{ background: "var(--gradient-warm)" }}>
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-lg font-bold tracking-wide sm:text-xl" style={{ fontFamily: '"Playfair Display", serif' }}>
              {settings.brandName}
            </span>
            <span className={`hidden text-[10px] uppercase tracking-[0.2em] sm:block ${scrolled ? "text-muted-foreground" : "text-white/70"}`}>
              Spice & Charcuterie
            </span>
          </div>
        </a>

        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          <a href="#san-pham" className="transition hover:text-primary">Sản phẩm</a>
          <a href="#features" className="transition hover:text-primary">Vì sao chọn</a>
          <a href="#blog" className="transition hover:text-primary">Bài viết</a>
          <a href="#tu-van" className="transition hover:text-primary">Tư vấn</a>
          <a href="#lien-he" className="transition hover:text-primary">Liên hệ</a>
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <a
            href={telHref(settings.hotlineTel)}
            className={`hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition md:inline-flex ${
              scrolled ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" : "border border-white/40 hover:bg-white hover:text-primary"
            }`}
          >
            <Phone className="h-4 w-4" /> {settings.hotlineDisplay}
          </a>
          <a href={telHref(settings.hotlineTel)} aria-label="Gọi hotline" className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-md md:hidden">
            <Phone className="h-4 w-4" />
          </a>
          <button type="button" aria-label="Mở menu" onClick={() => setOpen((v) => !v)} className={`grid h-11 w-11 place-items-center rounded-full transition md:hidden ${scrolled ? "bg-muted text-foreground" : "border border-white/40 text-white"}`}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-md md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 text-sm font-medium text-foreground">
            {[["Sản phẩm","#san-pham"],["Vì sao chọn","#features"],["Bài viết","#blog"],["Tư vấn","#tu-van"],["Liên hệ","#lien-he"]].map(([label,href])=>(
              <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 hover:bg-muted">{label}</a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

// ----- Hero with video -----
function Hero() {
  const { settings } = useSiteData();
  return (
    <section id="top" className="relative min-h-[100vh] w-full overflow-hidden">
      <video
        key={settings.heroVideoUrl}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay muted loop playsInline preload="auto"
        poster={heroPoster}
      >
        <source src={settings.heroVideoUrl} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85" />

      <div className="relative z-10 mx-auto flex min-h-[100vh] max-w-7xl flex-col justify-center px-4 pb-24 pt-28 text-white sm:px-6 sm:pt-32 lg:px-8 lg:pt-36">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] backdrop-blur-sm sm:text-xs sm:tracking-[0.22em]">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" /> {settings.heroEyebrow}
        </span>
        <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.05] sm:mt-6 sm:text-5xl md:text-6xl lg:text-7xl" style={{ fontFamily: '"Playfair Display", serif' }}>
          {settings.heroTitleLine1}
          <br />
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-warm)" }}>{settings.heroTitleLine2}</span>
        </h1>
        <HeroTypewriter words={settings.heroTypewriter ?? []} />
        <p className="mt-5 max-w-xl text-sm text-white/85 sm:mt-6 sm:text-base md:text-lg">{settings.heroDescription}</p>
        <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <a href="#san-pham" className="group shimmer inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-2xl transition hover:-translate-y-0.5 sm:w-auto" style={{ background: "var(--gradient-warm)", boxShadow: "var(--shadow-elegant)" }}>
            <ShoppingBag className="h-4 w-4" /> Khám phá sản phẩm <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </a>
          <a href={telHref(settings.hotlineTel)} className="ring-pulse inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-primary shadow-xl transition hover:scale-[1.03] sm:w-auto">
            <Phone className="h-4 w-4" /> {settings.hotlineDisplay}
          </a>
          <a href="#tu-van" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/20 sm:w-auto">
            <PlayCircle className="h-4 w-4" /> Tư vấn miễn phí
          </a>
        </div>


        <div className="mt-12 grid max-w-2xl grid-cols-3 gap-4 border-t border-white/15 pt-8 sm:mt-16 sm:gap-8">
          <Stat n="30+" label="Năm kinh nghiệm" />
          <Stat n="100%" label="Nguyên liệu sạch" />
          <Stat n="63" label="Tỉnh thành giao hàng" />
        </div>
      </div>
    </section>
  );
}
function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="min-w-0">
      <div className="text-2xl font-bold sm:text-3xl bg-clip-text text-transparent" style={{ fontFamily: '"Playfair Display", serif', backgroundImage: "var(--gradient-warm)" }}>{n}</div>
      <div className="mt-1 text-[11px] leading-snug text-white/70 sm:text-sm">{label}</div>
    </div>
  );
}

function HeroTypewriter({ words }: { words: string[] }) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!words.length) return;
    const current = words[idx % words.length];
    const speed = deleting ? 45 : 90;
    const t = setTimeout(() => {
      if (!deleting) {
        const next = current.slice(0, text.length + 1);
        setText(next);
        if (next === current) setTimeout(() => setDeleting(true), 1400);
      } else {
        const next = current.slice(0, text.length - 1);
        setText(next);
        if (next === "") { setDeleting(false); setIdx((i) => (i + 1) % words.length); }
      }
    }, speed);
    return () => clearTimeout(t);
  }, [text, deleting, idx, words]);

  if (!words.length) return null;
  return (
    <div className="mt-4 inline-flex items-center gap-2 text-base text-white/90 sm:text-lg md:text-xl">
      <Sparkles className="h-4 w-4 text-secondary" />
      <span className="font-semibold tracking-wide caret-blink" style={{ fontFamily: '"Playfair Display", serif' }}>{text || "\u00A0"}</span>
    </div>
  );
}


// ----- Features -----
function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:px-8">
      <div className="mb-10 max-w-2xl sm:mb-12">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Vì sao chọn Hoàng Bình</span>
        <h2 className="mt-3 text-2xl font-bold sm:text-3xl md:text-4xl" style={{ fontFamily: '"Playfair Display", serif' }}>Bốn cam kết giữ trọn hương vị</h2>
      </div>
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-5 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl sm:p-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground shadow-md transition group-hover:scale-110" style={{ background: "var(--gradient-warm)" }}>
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-base font-semibold sm:text-lg" style={{ fontFamily: '"Playfair Display", serif' }}>{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ----- Products -----
function Products({ onOpen }: { onOpen: (p: Product) => void }) {
  const { products, settings } = useSiteData();
  const visible = useMemo(() => products.filter((p) => !p.hidden), [products]);
  const [filter, setFilter] = useState<string>("all");
  const tags = useMemo(() => {
    const s = new Set<string>();
    visible.forEach((p) => p.tag && s.add(p.tag));
    return ["all", ...Array.from(s)];
  }, [visible]);
  const filtered = filter === "all" ? visible : visible.filter((p) => p.tag === filter);

  return (
    <section id="san-pham" className="bg-muted/40 py-16 sm:py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end md:gap-8">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Sản phẩm</span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl md:text-5xl" style={{ fontFamily: '"Playfair Display", serif' }}>{settings.collectionTitle}</h2>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">Tinh hoa ẩm thực Việt trong từng gói gia vị — chọn sản phẩm và đặt lịch tư vấn cùng nghệ nhân {settings.artisanName}.</p>

          </div>
          <a href={telHref(settings.hotlineTel)} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:scale-[1.02] sm:w-auto">
            <Phone className="h-4 w-4" /> Đặt nhanh: {settings.hotlineDisplay}
          </a>
        </div>

        {tags.length > 2 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {tags.map((t) => (
              <button key={t} onClick={() => setFilter(t)} className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${filter === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/40"}`}>
                {t === "all" ? "Tất cả" : t}
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
          {filtered.map((p) => (
            <article
              key={p.id}
              onClick={() => onOpen(p)}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                {p.tag && (
                  <span className="absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-md" style={{ background: "var(--gradient-warm)" }}>{p.tag}</span>
                )}
                {(p.gallery?.length ?? 0) > 0 && (
                  <span className="absolute left-4 bottom-4 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                    <ImageIconLucide className="h-3 w-3" /> +{(p.gallery?.length ?? 0) + 1} ảnh
                  </span>
                )}
                <span className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-primary opacity-0 transition group-hover:opacity-100">
                  Xem chi tiết <ArrowRight className="h-3 w-3" />
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h3 className="text-lg font-semibold sm:text-xl" style={{ fontFamily: '"Playfair Display", serif' }}>{p.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{p.shortDesc}</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary" style={{ fontFamily: '"Playfair Display", serif' }}>{p.price}</span>
                  <span className="text-xs text-muted-foreground">/ {p.weight}</span>
                  {typeof p.stock === "number" && (
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.stock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {p.stock > 0 ? "Còn hàng" : "Hết hàng"}
                    </span>
                  )}
                </div>
                <button onClick={(e) => { e.stopPropagation(); onOpen(p); }} className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90">
                  <ShoppingBag className="h-3.5 w-3.5" /> Xem chi tiết
                </button>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <a href={telHref(settings.hotlineTel)} onClick={(e) => e.stopPropagation()} aria-label="Gọi đặt hàng" className="inline-flex items-center justify-center gap-1 rounded-full border border-primary/40 bg-primary/5 px-2 py-2 text-[11px] font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground">
                    <Phone className="h-3.5 w-3.5" /> Gọi
                  </a>
                  <a href={settings.zaloUrl} target="_blank" rel="noreferrer noopener" onClick={(e) => e.stopPropagation()} aria-label="Chat Zalo" className="inline-flex items-center justify-center gap-1 rounded-full border border-[#0068ff]/40 bg-[#0068ff]/5 px-2 py-2 text-[11px] font-semibold text-[#0068ff] transition hover:bg-[#0068ff] hover:text-white">
                    <MessageCircle className="h-3.5 w-3.5" /> Zalo
                  </a>
                  <a href={settings.messengerUrl} target="_blank" rel="noreferrer noopener" onClick={(e) => e.stopPropagation()} aria-label="Chat Messenger" className="inline-flex items-center justify-center gap-1 rounded-full border border-[#0084ff]/40 bg-[#0084ff]/5 px-2 py-2 text-[11px] font-semibold text-[#0084ff] transition hover:bg-[#0084ff] hover:text-white">
                    <MessageSquareMore className="h-3.5 w-3.5" /> Chat
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductDialog({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { settings } = useSiteData();
  const [active, setActive] = useState(0);
  useEffect(() => { setActive(0); }, [product?.id]);
  if (!product) return null;
  const gallery = [product.image, ...(product.gallery ?? [])].filter(Boolean);
  const current = gallery[active] ?? product.image;
  const prev = () => setActive((i) => (i - 1 + gallery.length) % gallery.length);
  const next = () => setActive((i) => (i + 1) % gallery.length);
  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl overflow-hidden p-0 sm:rounded-3xl">
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square w-full bg-muted md:aspect-auto">
            <img key={current} src={current} alt={product.name} className="h-full w-full object-cover animate-in fade-in zoom-in-95 duration-300" />
            {product.tag && (
              <span className="absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow" style={{ background: "var(--gradient-warm)" }}>{product.tag}</span>
            )}
            {gallery.length > 1 && (
              <>
                <button onClick={prev} aria-label="Ảnh trước" className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={next} aria-label="Ảnh sau" className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75">
                  <ChevronRight className="h-5 w-5" />
                </button>
                <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                  {active + 1} / {gallery.length}
                </span>
              </>
            )}
          </div>
          <div className="flex flex-col p-6 sm:p-7">
            <DialogHeader className="text-left">
              <DialogTitle className="text-2xl sm:text-3xl" style={{ fontFamily: '"Playfair Display", serif' }}>{product.name}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">{product.shortDesc}</DialogDescription>
            </DialogHeader>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary" style={{ fontFamily: '"Playfair Display", serif' }}>{product.price}</span>
              <span className="text-sm text-muted-foreground">/ {product.weight}</span>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/80">{product.longDesc || product.shortDesc}</p>
            {gallery.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {gallery.map((g, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${i === active ? "border-primary ring-2 ring-primary/30" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    <img src={g} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <a href={telHref(settings.hotlineTel)} className="ring-pulse inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
                <Phone className="h-4 w-4" /> Gọi
              </a>
              <a href={settings.zaloUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0068ff] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0058d8]">
                <MessageCircle className="h-4 w-4" /> Zalo
              </a>
              <a href={settings.messengerUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0084ff] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0070d8]">
                <MessageSquareMore className="h-4 w-4" /> Messenger
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


// ----- Blog -----
function BlogSection({ onOpen }: { onOpen: (p: BlogPost) => void }) {
  const { blog } = useSiteData();
  if (!blog.length) return null;
  return (
    <section id="blog" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Bài viết</span>
        <h2 className="mt-3 text-2xl font-bold sm:text-3xl md:text-4xl" style={{ fontFamily: '"Playfair Display", serif' }}>Mẹo bếp & câu chuyện thương hiệu</h2>
      </div>
      <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blog.map((b) => (
          <article key={b.id} onClick={() => onOpen(b)} className="group cursor-pointer overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <div className="aspect-[16/10] overflow-hidden">
              <img src={b.cover} alt={b.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                <Clock className="h-3 w-3" /> {new Date(b.date).toLocaleDateString("vi-VN")}
              </div>
              <h3 className="mt-2 text-lg font-semibold leading-snug" style={{ fontFamily: '"Playfair Display", serif' }}>{b.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{b.excerpt}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">Đọc tiếp <ArrowRight className="h-3 w-3" /></span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function BlogDialog({ post, onClose }: { post: BlogPost | null; onClose: () => void }) {
  if (!post) return null;
  return (
    <Dialog open={!!post} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto sm:rounded-3xl">
        <img src={post.cover} alt={post.title} className="aspect-[16/9] w-full rounded-xl object-cover" />
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl" style={{ fontFamily: '"Playfair Display", serif' }}>{post.title}</DialogTitle>
          <DialogDescription>{new Date(post.date).toLocaleDateString("vi-VN")}</DialogDescription>
        </DialogHeader>
        <div className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">{post.content}</div>
      </DialogContent>
    </Dialog>
  );
}

// ----- Testimonials -----
function Testimonials() {
  const { settings, testimonials } = useSiteData();
  const list = (testimonials ?? []).filter((t) => !t.hidden);
  if (list.length === 0) return null;
  const row = [...list, ...list];
  const edgeMask = "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)";
  return (
    <section id="danh-gia" className="bg-muted/40 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Khách hàng tin cậy</span>
          <h2 className="text-lg font-bold sm:text-xl" style={{ fontFamily: '"Playfair Display", serif' }}>Họ đã chọn {settings.artisanName}</h2>
        </div>
        <div
          className="overflow-hidden"
          style={{ maskImage: edgeMask, WebkitMaskImage: edgeMask }}
        >
          <ul className="marquee-track flex w-max gap-4 whitespace-nowrap hover:[animation-play-state:paused]">
            {row.map((t: Testimonial, i) => (
              <li
                key={`${t.id}-${i}`}
                className="inline-flex items-center gap-3 rounded-full border border-border/60 bg-card px-4 py-2 shadow-sm"
              >
                <img
                  src={t.avatar}
                  alt={t.name}
                  loading="lazy"
                  className="h-10 w-10 shrink-0 rounded-full border border-primary/30 object-cover"
                />
                <span className="text-sm font-semibold" style={{ fontFamily: '"Playfair Display", serif' }}>{t.name}</span>
                <span className="text-xs text-muted-foreground">· {t.role}</span>
                <span className="ml-1 flex gap-0.5" aria-label={`${t.rating} sao`}>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className={`h-3.5 w-3.5 ${idx < t.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ----- Consultation -----

const consultationSchema = z.object({
  name: z.string().trim().min(1, "Nhập họ tên").max(100),
  phone: z.string().trim().min(8, "SĐT không hợp lệ").max(20),
  message: z.string().trim().max(500).optional().or(z.literal("")),
});

function Consultation() {
  const { settings } = useSiteData();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [pending, setPending] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = consultationSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ");
      return;
    }
    setPending(true);
    addConsultation({ ...parsed.data, message: parsed.data.message ?? "" });
    setTimeout(() => {
      setPending(false);
      toast.success("Đã gửi yêu cầu — Hoàng Bình sẽ gọi lại sớm");
      setForm({ name: "", phone: "", message: "" });
    }, 400);
  };

  return (
    <section id="tu-van" className="relative overflow-hidden py-16 sm:py-20 md:py-24">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-secondary/30 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-secondary/15 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 text-white sm:px-6 md:grid-cols-2 md:items-center lg:px-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] backdrop-blur-sm sm:text-xs">
            <Phone className="h-3 w-3" /> Dịch vụ tư vấn
          </span>
          <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl" style={{ fontFamily: '"Playfair Display", serif' }}>Đặt lịch tư vấn cùng nghệ nhân {settings.artisanName}</h2>
          <p className="mt-4 max-w-md text-sm text-white/80 md:text-base">Để lại thông tin — chúng tôi gọi lại trong 15 phút, tư vấn miễn phí cách trộn nem chua, chọn giò chả, bảo quản sản phẩm.</p>
          <ul className="mt-6 space-y-2 text-sm text-white/85">
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-secondary" /> {settings.workingHours}</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-secondary" /> {settings.address}</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-secondary" /> {settings.email}</li>
          </ul>
        </div>
        <form onSubmit={submit} className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl sm:p-8">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/80">Họ tên</label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nguyễn Văn A" className="mt-1.5 border-white/30 bg-white/95 text-foreground placeholder:text-muted-foreground" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/80">Số điện thoại</label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="09xxxxxxxx" inputMode="tel" className="mt-1.5 border-white/30 bg-white/95 text-foreground placeholder:text-muted-foreground" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/80">Nội dung (tuỳ chọn)</label>
              <Textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Tôi muốn tư vấn về gia vị nem chua…" rows={3} className="mt-1.5 border-white/30 bg-white/95 text-foreground placeholder:text-muted-foreground" />
            </div>
            <Button type="submit" disabled={pending} className="w-full rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90" size="lg">
              {pending ? "Đang gửi…" : (<><Send className="mr-2 h-4 w-4" /> Gửi yêu cầu tư vấn</>)}
            </Button>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <a href={telHref(settings.hotlineTel)} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/95 px-2 py-2 text-xs font-semibold text-primary transition hover:bg-white">
                <Phone className="h-3.5 w-3.5" /> Gọi
              </a>
              <a href={settings.zaloUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#0068ff] px-2 py-2 text-xs font-semibold text-white transition hover:bg-[#0058d8]">
                <MessageCircle className="h-3.5 w-3.5" /> Zalo
              </a>
              <a href={settings.messengerUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#0084ff] px-2 py-2 text-xs font-semibold text-white transition hover:bg-[#0070d8]">
                <MessageSquareMore className="h-3.5 w-3.5" /> Chat
              </a>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

// ----- Footer with admin gate -----
function Footer() {
  const { settings } = useSiteData();
  const [code, setCode] = useState("");

  const tryUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().toUpperCase() === getAdminCode().toUpperCase()) {
      setAdmin(true);
      toast.success("Đã mở khoá quản lý");
      window.location.href = "/admin";
    } else {
      toast.error("Mã không đúng");
      setCode("");
    }
  };

  return (
    <footer id="lien-he" className="border-t border-border/60 bg-sidebar text-sidebar-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 md:gap-8 md:py-16 lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-11 w-11 place-items-center rounded-2xl text-primary-foreground font-bold shadow-lg" style={{ background: "var(--gradient-warm)" }}>
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <div className="text-lg font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>{settings.brandName}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/60">Spice & Charcuterie</div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm text-sidebar-foreground/75">Gia vị nem chua, giò chả và đặc sản Việt — chuẩn vị, chọn lọc thủ công, tinh hoa ẩm thực Việt.</p>
          <div className="mt-5 flex gap-3">
            <a href={settings.facebookUrl} target="_blank" rel="noreferrer noopener" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full bg-sidebar-accent text-sidebar-foreground transition hover:bg-[#1877f2] hover:text-white">
              <Facebook className="h-4 w-4" />
            </a>
            <a href={settings.zaloUrl} target="_blank" rel="noreferrer noopener" aria-label="Zalo" className="grid h-10 w-10 place-items-center rounded-full bg-sidebar-accent text-sidebar-foreground transition hover:bg-[#0068ff] hover:text-white">
              <MessageCircle className="h-4 w-4" />
            </a>
            <a href={settings.messengerUrl} target="_blank" rel="noreferrer noopener" aria-label="Messenger" className="grid h-10 w-10 place-items-center rounded-full bg-sidebar-accent text-sidebar-foreground transition hover:bg-[#0084ff] hover:text-white">
              <MessageSquareMore className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-sidebar-foreground/90">Liên hệ</h4>
          <ul className="mt-4 space-y-3 text-sm text-sidebar-foreground/80">
            <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-secondary" /> <a href={telHref(settings.hotlineTel)} className="hover:text-secondary">{settings.hotlineDisplay}</a></li>
            <li className="flex items-start gap-2"><MessageCircle className="mt-0.5 h-4 w-4 text-secondary" /> <a href={settings.zaloUrl} target="_blank" rel="noreferrer noopener" className="hover:text-secondary">Chat Zalo</a></li>
            <li className="flex items-start gap-2"><MessageSquareMore className="mt-0.5 h-4 w-4 text-secondary" /> <a href={settings.messengerUrl} target="_blank" rel="noreferrer noopener" className="hover:text-secondary">Chat Messenger</a></li>
            <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 text-secondary" /> <a href={`mailto:${settings.email}`} className="hover:text-secondary">{settings.email}</a></li>
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-secondary" /> {settings.address}</li>
            <li className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4 text-secondary" /> {settings.workingHours}</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-sidebar-foreground/90">Mã nhân viên</h4>
          <p className="mt-3 text-xs text-sidebar-foreground/60">Dành cho nhân viên Hoàng Bình. Nhập mã để mở bảng quản lý.</p>
          <form onSubmit={tryUnlock} className="mt-3 flex gap-2">
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Nhập mã…" className="border-sidebar-border bg-sidebar-accent text-sidebar-foreground placeholder:text-sidebar-foreground/40" />
            <Button type="submit" size="icon" variant="secondary" aria-label="Mở khoá">
              <Lock className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
      <div className="border-t border-sidebar-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-sidebar-foreground/60 sm:flex-row sm:px-6 lg:px-8">
          <span>{settings.footerNote}</span>
          <span>Made with ♥ in Việt Nam</span>
        </div>
      </div>
    </footer>
  );
}

// ----- Floating chat -----
function FloatingChat() {
  const { settings } = useSiteData();
  return (
    <div className="fixed bottom-5 right-5 z-30 flex flex-col gap-3">
      <a href={settings.messengerUrl} target="_blank" rel="noreferrer noopener" aria-label="Chat Messenger" className="grid h-12 w-12 place-items-center rounded-full bg-[#0084ff] text-white shadow-xl transition hover:scale-110">
        <MessageSquareMore className="h-5 w-5" />
      </a>
      <a href={settings.zaloUrl} target="_blank" rel="noreferrer noopener" aria-label="Chat Zalo" className="grid h-12 w-12 place-items-center rounded-full bg-[#0068ff] text-white shadow-xl transition hover:scale-110">
        <MessageCircle className="h-5 w-5" />
      </a>
      <a href={telHref(settings.hotlineTel)} aria-label="Gọi hotline" className="ring-pulse float-soft grid h-14 w-14 place-items-center rounded-full text-primary-foreground shadow-2xl transition hover:scale-110" style={{ background: "var(--gradient-warm)" }}>
        <Phone className="h-6 w-6" />
      </a>
    </div>
  );
}
