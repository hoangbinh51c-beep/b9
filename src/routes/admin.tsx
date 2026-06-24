import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  LogOut, Plus, Trash2, ArrowUp, ArrowDown, Save, Upload, Download,
  RefreshCw, Image as ImageIcon, Video, Newspaper, Package, Settings as Cog,
  Inbox, CheckCircle2, AlertTriangle, LayoutDashboard, Activity, Copy,
  Eye, EyeOff, Search, KeyRound, FileDown, Trash, Link2, Star,
} from "lucide-react";


// Lazy-load recharts so its browser-only globals never run during SSR.
const VisitsChart = lazy(() => import("../components/admin-visits-chart"));

import {
  useSiteData, isAdmin, setAdmin, updateSettings,
  upsertProduct, deleteProduct, deleteProducts, duplicateProduct, moveProduct,
  upsertBlog, deleteBlog,
  toggleConsultation, setConsultationsHandled, deleteConsultation, deleteConsultations,
  exportSiteData, importSiteData, resetSiteData,
  useVisits, clearVisits, deriveZaloFromPhone, normalizeTel,
  getAdminCode, setAdminCode,
  upsertTestimonial, deleteTestimonial, moveTestimonial,
} from "../lib/site-store";
import type { Product, BlogPost, SiteSettings, Testimonial } from "../lib/types";

import { toCsv, downloadCsv } from "../lib/csv";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Checkbox } from "../components/ui/checkbox";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Quản lý — Hoàng Bình" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!isAdmin()) navigate({ to: "/" });
    else setReady(true);
  }, [navigate]);
  if (typeof window === "undefined") return null;
  if (!ready) return null;


  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl" style={{ fontFamily: '"Playfair Display", serif' }}>Bảng điều khiển Hoàng Bình</h1>
            <p className="text-xs text-muted-foreground">Lưu trên thiết bị này (localStorage). Dùng Sao lưu để chuyển sang máy khác.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/" target="_blank" rel="noreferrer"><Link2 className="mr-2 h-4 w-4" /> Xem web</a>
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setAdmin(false); navigate({ to: "/" }); }}>
              <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Mã admin chỉ là lớp ẩn UI. Dữ liệu lưu trên trình duyệt — dùng Sao lưu để đồng bộ thiết bị khác.</span>
        </div>
        <Tabs defaultValue="dashboard">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="dashboard"><LayoutDashboard className="mr-1.5 h-4 w-4" />Tổng quan</TabsTrigger>
            <TabsTrigger value="products"><Package className="mr-1.5 h-4 w-4" />Sản phẩm</TabsTrigger>
            <TabsTrigger value="blog"><Newspaper className="mr-1.5 h-4 w-4" />Bài viết</TabsTrigger>
            <TabsTrigger value="inbox"><Inbox className="mr-1.5 h-4 w-4" />Tư vấn</TabsTrigger>
            <TabsTrigger value="visits"><Activity className="mr-1.5 h-4 w-4" />Truy cập</TabsTrigger>
            <TabsTrigger value="testimonials"><Star className="mr-1.5 h-4 w-4" />Đánh giá</TabsTrigger>
            <TabsTrigger value="settings"><Cog className="mr-1.5 h-4 w-4" />Thông tin web</TabsTrigger>
            <TabsTrigger value="hero"><Video className="mr-1.5 h-4 w-4" />Video hero</TabsTrigger>
            <TabsTrigger value="backup"><Save className="mr-1.5 h-4 w-4" />Sao lưu</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard"><DashboardPanel /></TabsContent>
          <TabsContent value="products"><ProductsPanel /></TabsContent>
          <TabsContent value="blog"><BlogPanel /></TabsContent>
          <TabsContent value="inbox"><InboxPanel /></TabsContent>
          <TabsContent value="visits"><VisitsPanel /></TabsContent>
          <TabsContent value="testimonials"><TestimonialsPanel /></TabsContent>
          <TabsContent value="settings"><SettingsPanel /></TabsContent>
          <TabsContent value="hero"><HeroVideoPanel /></TabsContent>
          <TabsContent value="backup"><BackupPanel /></TabsContent>
        </Tabs>

      </main>
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

// ---------- Dashboard ----------
function DashboardPanel() {
  const { products, blog, consultations } = useSiteData();
  const visits = useVisits();

  const pending = consultations.filter((c) => !c.handled).length;
  const handled = consultations.length - pending;
  const hidden = products.filter((p) => p.hidden).length;

  const visits7 = useMemo(() => {
    const days: { day: string; v: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = visits.filter((v) => v.ts.slice(0, 10) === key).length;
      days.push({ day: key.slice(5), v: count });
    }
    return days;
  }, [visits]);

  const total7 = visits7.reduce((a, b) => a + b.v, 0);
  const recent = consultations.slice(0, 5);

  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sản phẩm" value={products.length} sub={`${hidden} đang ẩn`} />
        <StatCard label="Bài viết" value={blog.length} />
        <StatCard label="Tư vấn chưa xử lý" value={pending} sub={`${handled} đã xử lý`} accent={pending > 0} />
        <StatCard label="Lượt truy cập 7 ngày" value={total7} sub={`Tổng: ${visits.length}`} />
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Truy cập 7 ngày qua</h3>
        <div className="h-48 w-full">
          <Suspense fallback={<div className="h-full w-full animate-pulse rounded bg-muted/40" />}>
            <VisitsChart data={visits7} />
          </Suspense>
        </div>

      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tư vấn mới nhất</h3>
        {recent.length === 0 && <p className="text-sm text-muted-foreground">Chưa có yêu cầu tư vấn.</p>}
        <div className="divide-y">
          {recent.map((c) => (
            <div key={c.id} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">{c.name}</span>
                  <a href={`tel:${normalizeTel(c.phone)}`} className="text-primary hover:underline">{c.phone}</a>
                  {c.handled && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Đã xử lý</span>}
                </div>
                {c.message && <p className="mt-1 truncate text-xs text-muted-foreground">{c.message}</p>}
                <p className="mt-0.5 text-[11px] text-muted-foreground">{new Date(c.createdAt).toLocaleString("vi-VN")}</p>
              </div>
              {!c.handled && (
                <Button size="sm" variant="outline" onClick={() => toggleConsultation(c.id)}>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Xử lý
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: number | string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border bg-card p-4 ${accent ? "border-primary/50 shadow-md" : ""}`}>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

// ---------- Products ----------
function ProductsPanel() {
  const { products } = useSiteData();
  const [editing, setEditing] = useState<Product | null>(null);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return products;
    return products.filter((p) => p.name.toLowerCase().includes(k) || p.slug.toLowerCase().includes(k) || (p.category ?? "").toLowerCase().includes(k));
  }, [products, q]);

  const blank = (): Product => ({
    id: `p_${Date.now()}`, slug: "", name: "", image: "", tag: "", price: "", weight: "",
    shortDesc: "", longDesc: "", order: products.length + 1, hidden: false, category: "", stock: 0,
  });

  const toggleSel = (id: string) => {
    setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  };
  const bulkDelete = () => {
    if (selected.size === 0) return;
    if (!confirm(`Xoá ${selected.size} sản phẩm?`)) return;
    deleteProducts(Array.from(selected));
    setSelected(new Set());
    toast.success("Đã xoá");
  };
  const toggleHidden = (p: Product) => upsertProduct({ ...p, hidden: !p.hidden });

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm sản phẩm theo tên/slug/danh mục…" className="pl-9" />
        </div>
        {selected.size > 0 && (
          <Button variant="destructive" size="sm" onClick={bulkDelete}>
            <Trash className="mr-2 h-4 w-4" /> Xoá ({selected.size})
          </Button>
        )}
        <Button onClick={() => setEditing(blank())}><Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm</Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="grid grid-cols-[32px_56px_1fr_90px_90px_180px] items-center gap-2 border-b bg-muted/50 px-3 py-2 text-xs font-semibold">
          <Checkbox checked={filtered.length > 0 && selected.size === filtered.length} onCheckedChange={toggleAll} />
          <span>Ảnh</span><span>Tên</span><span>Giá</span><span>Kho</span><span className="text-right">Thao tác</span>
        </div>
        {filtered.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Không có sản phẩm</div>}
        {filtered.map((p) => (
          <div key={p.id} className={`grid grid-cols-[32px_56px_1fr_90px_90px_180px] items-center gap-2 border-b px-3 py-2 text-sm last:border-b-0 ${p.hidden ? "opacity-50" : ""}`}>
            <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleSel(p.id)} />
            <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
            <div className="min-w-0">
              <div className="truncate font-medium">{p.name} {p.tag && <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{p.tag}</span>}</div>
              <div className="truncate text-xs text-muted-foreground">{p.slug}{p.category ? ` · ${p.category}` : ""}</div>
            </div>
            <div className="text-sm">{p.price}</div>
            <div className="text-xs">{typeof p.stock === "number" ? p.stock : "—"}</div>
            <div className="flex justify-end gap-1">
              <Button size="icon" variant="ghost" title="Lên" onClick={() => moveProduct(p.id, -1)}><ArrowUp className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" title="Xuống" onClick={() => moveProduct(p.id, 1)}><ArrowDown className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" title={p.hidden ? "Hiện" : "Ẩn"} onClick={() => toggleHidden(p)}>
                {p.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button size="icon" variant="ghost" title="Nhân bản" onClick={() => { duplicateProduct(p.id); toast.success("Đã nhân bản"); }}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(p)}>Sửa</Button>
              <Button size="icon" variant="ghost" onClick={() => { if (confirm(`Xoá ${p.name}?`)) deleteProduct(p.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
      {editing && <ProductEditor product={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function ProductEditor({ product, onClose }: { product: Product; onClose: () => void }) {
  const [p, setP] = useState<Product>(product);
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((x) => ({ ...x, [k]: v }));

  const allImages = (): string[] => [p.image, ...(p.gallery ?? [])].filter(Boolean);
  const setAllImages = (list: string[]) => {
    setP((x) => ({ ...x, image: list[0] ?? "", gallery: list.slice(1) }));
  };

  const onMainFile = async (f: File | undefined) => {
    if (!f) return;
    const url = await fileToDataUrl(f);
    const list = allImages();
    if (list.length === 0) setAllImages([url]);
    else setAllImages([url, ...list.slice(1)]);
  };

  const onAddFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const urls = await Promise.all(Array.from(files).map(fileToDataUrl));
    setAllImages([...allImages(), ...urls]);
  };

  const addUrlSlot = () => setAllImages([...allImages(), ""]);
  const updateAt = (i: number, v: string) => {
    const list = allImages();
    list[i] = v;
    setAllImages(list);
  };
  const removeAt = (i: number) => {
    const list = allImages();
    list.splice(i, 1);
    setAllImages(list);
  };
  const moveAt = (i: number, dir: -1 | 1) => {
    const list = allImages();
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    setAllImages(list);
  };
  const makeMain = (i: number) => {
    if (i === 0) return;
    const list = allImages();
    const [picked] = list.splice(i, 1);
    list.unshift(picked);
    setAllImages(list);
  };

  const save = () => {
    if (!p.name.trim() || !p.price.trim()) { toast.error("Cần có tên và giá"); return; }
    if (!p.slug.trim()) p.slug = p.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    upsertProduct(p);
    toast.success("Đã lưu sản phẩm");
    onClose();
  };

  const images = allImages();

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>{product.name ? "Sửa sản phẩm" : "Thêm sản phẩm"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Tên"><Input value={p.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Slug (URL)"><Input value={p.slug} onChange={(e) => set("slug", e.target.value)} placeholder="gio-cha" /></Field>
            <Field label="Giá"><Input value={p.price} onChange={(e) => set("price", e.target.value)} placeholder="120.000đ" /></Field>
            <Field label="Khối lượng / quy cách"><Input value={p.weight} onChange={(e) => set("weight", e.target.value)} placeholder="500g" /></Field>
            <Field label="Tag (Bán chạy / Mới…)"><Input value={p.tag ?? ""} onChange={(e) => set("tag", e.target.value)} /></Field>
            <Field label="Danh mục"><Input value={p.category ?? ""} onChange={(e) => set("category", e.target.value)} placeholder="Giò chả / Đặc sản…" /></Field>
            <Field label="Tồn kho"><Input type="number" value={p.stock ?? 0} onChange={(e) => set("stock", Number(e.target.value))} /></Field>
            <Field label="Thứ tự"><Input type="number" value={p.order ?? 0} onChange={(e) => set("order", Number(e.target.value))} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={!!p.hidden} onCheckedChange={(v) => set("hidden", !!v)} />
            <span>Ẩn sản phẩm khỏi trang web</span>
          </label>
          <Field label="Mô tả ngắn"><Input value={p.shortDesc} onChange={(e) => set("shortDesc", e.target.value)} /></Field>
          <Field label="Mô tả chi tiết"><Textarea rows={5} value={p.longDesc ?? ""} onChange={(e) => set("longDesc", e.target.value)} /></Field>

          <Field label={`Thư viện ảnh sản phẩm (${images.length})`}>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-card px-3 py-2 text-xs font-medium hover:bg-muted">
                  <ImageIcon className="h-3.5 w-3.5" /> Đổi/Tải ảnh chính
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onMainFile(e.target.files?.[0])} />
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-card px-3 py-2 text-xs font-medium hover:bg-muted">
                  <Plus className="h-3.5 w-3.5" /> Thêm nhiều ảnh
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onAddFiles(e.target.files)} />
                </label>
                <Button type="button" size="sm" variant="outline" onClick={addUrlSlot}>+ Dán URL</Button>
              </div>
              {images.length === 0 && (
                <div className="rounded-lg border border-dashed bg-muted/40 p-4 text-center text-xs text-muted-foreground">
                  Chưa có ảnh. Tải lên hoặc dán URL để bắt đầu.
                </div>
              )}
              <div className="space-y-2">
                {images.map((url, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border bg-card p-2">
                    {url ? (
                      <img src={url} alt="" className="h-14 w-14 shrink-0 rounded-md object-cover" />
                    ) : (
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {i === 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">Ảnh chính</span>}
                        <span className="text-[10px] text-muted-foreground">#{i + 1}</span>
                      </div>
                      <Input
                        value={url.startsWith("data:") ? "" : url}
                        placeholder={url.startsWith("data:") ? "(ảnh tải lên)" : "https://… hoặc dán URL"}
                        onChange={(e) => updateAt(i, e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveAt(i, -1)} disabled={i === 0} title="Lên">↑</Button>
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveAt(i, 1)} disabled={i === images.length - 1} title="Xuống">↓</Button>
                      {i !== 0 && (
                        <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-[10px]" onClick={() => makeMain(i)}>Đặt chính</Button>
                      )}
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeAt(i)} title="Xoá"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button onClick={save}><Save className="mr-2 h-4 w-4" /> Lưu</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


// ---------- Blog ----------
function BlogPanel() {
  const { blog } = useSiteData();
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const blank = (): BlogPost => ({
    id: `b_${Date.now()}`, slug: "", title: "", cover: "", excerpt: "", content: "",
    date: new Date().toISOString().slice(0, 10),
  });
  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-end"><Button onClick={() => setEditing(blank())}><Plus className="mr-2 h-4 w-4" /> Thêm bài</Button></div>
      <div className="space-y-2">
        {blog.length === 0 && <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">Chưa có bài viết</div>}
        {blog.map((b) => (
          <div key={b.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
            <img src={b.cover} alt="" className="h-14 w-20 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{b.title}</div>
              <div className="truncate text-xs text-muted-foreground">{b.date} · {b.excerpt}</div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setEditing(b)}>Sửa</Button>
            <Button size="icon" variant="ghost" onClick={() => { if (confirm("Xoá bài?")) deleteBlog(b.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ))}
      </div>
      {editing && <BlogEditor post={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function BlogEditor({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  const [b, setB] = useState<BlogPost>(post);
  const set = <K extends keyof BlogPost>(k: K, v: BlogPost[K]) => setB((x) => ({ ...x, [k]: v }));
  const onFile = async (f: File | undefined) => { if (f) set("cover", await fileToDataUrl(f)); };
  const save = () => {
    if (!b.title.trim()) { toast.error("Cần có tiêu đề"); return; }
    if (!b.slug.trim()) b.slug = b.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    upsertBlog(b); toast.success("Đã lưu bài viết"); onClose();
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>{post.title ? "Sửa bài viết" : "Thêm bài viết"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Field label="Tiêu đề"><Input value={b.title} onChange={(e) => set("title", e.target.value)} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Slug"><Input value={b.slug} onChange={(e) => set("slug", e.target.value)} /></Field>
            <Field label="Ngày đăng"><Input type="date" value={b.date} onChange={(e) => set("date", e.target.value)} /></Field>
          </div>
          <Field label="Tóm tắt"><Textarea rows={2} value={b.excerpt} onChange={(e) => set("excerpt", e.target.value)} /></Field>
          <Field label="Nội dung"><Textarea rows={8} value={b.content} onChange={(e) => set("content", e.target.value)} /></Field>
          <Field label="Ảnh bìa">
            <div className="flex items-center gap-3">
              {b.cover ? <img src={b.cover} alt="" className="h-16 w-24 rounded-lg object-cover" /> : <div className="grid h-16 w-24 place-items-center rounded-lg bg-muted text-muted-foreground"><ImageIcon className="h-5 w-5" /></div>}
              <Input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
            </div>
          </Field>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button onClick={save}><Save className="mr-2 h-4 w-4" /> Lưu</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Settings ----------
function SettingsPanel() {
  const { settings } = useSiteData();
  const [s, setS] = useState<SiteSettings>(settings);
  useEffect(() => setS(settings), [settings]);
  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setS((x) => ({ ...x, [k]: v }));
  const save = () => { updateSettings(s); toast.success("Đã lưu thông tin"); };
  const syncZalo = () => { set("zaloUrl", deriveZaloFromPhone(s.hotlineTel)); toast.success("Đã đồng bộ Zalo từ SĐT"); };

  // Admin password change
  const [oldCode, setOldCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const changeCode = () => {
    if (oldCode.trim().toUpperCase() !== getAdminCode().toUpperCase()) { toast.error("Mã cũ không đúng"); return; }
    if (newCode.trim().length < 4) { toast.error("Mã mới phải có ít nhất 4 ký tự"); return; }
    setAdminCode(newCode.trim());
    setOldCode(""); setNewCode("");
    toast.success("Đã đổi mã admin");
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-4 rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Thông tin liên hệ</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Tên thương hiệu"><Input value={s.brandName} onChange={(e) => set("brandName", e.target.value)} /></Field>
          <Field label="Giờ làm việc"><Input value={s.workingHours} onChange={(e) => set("workingHours", e.target.value)} /></Field>
          <Field label="Tên bộ sưu tập (tiêu đề khối sản phẩm)"><Input value={s.collectionTitle} onChange={(e) => set("collectionTitle", e.target.value)} placeholder="Bộ sưu tập Hoàng Bình" /></Field>
          <Field label="Tên nghệ nhân (dùng trong khối Tư vấn & Đánh giá)"><Input value={s.artisanName} onChange={(e) => set("artisanName", e.target.value)} placeholder="Hoàng Bình" /></Field>

          <Field label="Hotline (hiển thị)"><Input value={s.hotlineDisplay} onChange={(e) => set("hotlineDisplay", e.target.value)} /></Field>
          <Field label="Hotline (số gọi)"><Input value={s.hotlineTel} onChange={(e) => set("hotlineTel", e.target.value)} placeholder="0978686019" /></Field>
          <Field label="Zalo URL">
            <div className="flex gap-2">
              <Input value={s.zaloUrl} onChange={(e) => set("zaloUrl", e.target.value)} placeholder="https://zalo.me/0978686019" />
              <Button type="button" variant="outline" size="sm" onClick={syncZalo}><RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Đồng bộ</Button>
            </div>
          </Field>
          <Field label="Messenger URL"><Input value={s.messengerUrl} onChange={(e) => set("messengerUrl", e.target.value)} placeholder="https://m.me/your-page" /></Field>
          <Field label="Facebook URL"><Input value={s.facebookUrl} onChange={(e) => set("facebookUrl", e.target.value)} /></Field>
          <Field label="Email"><Input value={s.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="Địa chỉ"><Input value={s.address} onChange={(e) => set("address", e.target.value)} /></Field>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-800">
          Mẹo: link Messenger dạng <code>/messages/e2ee/t/…</code> chỉ mở được trên thiết bị đã đăng nhập Facebook. Để mọi khách đều chat được, nên dùng dạng <code>https://m.me/&lt;tên-fanpage&gt;</code>.
        </div>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Hero & nội dung</h3>
        <Field label="Hero eyebrow"><Input value={s.heroEyebrow} onChange={(e) => set("heroEyebrow", e.target.value)} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Tiêu đề dòng 1"><Input value={s.heroTitleLine1} onChange={(e) => set("heroTitleLine1", e.target.value)} /></Field>
          <Field label="Tiêu đề dòng 2"><Input value={s.heroTitleLine2} onChange={(e) => set("heroTitleLine2", e.target.value)} /></Field>
        </div>
        <Field label="Mô tả hero"><Textarea rows={3} value={s.heroDescription} onChange={(e) => set("heroDescription", e.target.value)} /></Field>
        <Field label="Footer note"><Input value={s.footerNote} onChange={(e) => set("footerNote", e.target.value)} /></Field>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Hiệu ứng nổi bật</h3>
        <Field label="Nội dung chữ chạy (marquee, phân tách bằng dấu ·)">
          <Input value={s.marqueeText ?? ""} onChange={(e) => set("marqueeText", e.target.value)} placeholder="Giao toàn quốc · Hotline 0978 686 019 · …" />
        </Field>
        <Field label="Hiệu ứng gõ chữ ở hero (mỗi dòng = 1 cụm từ)">
          <Textarea
            rows={4}
            value={(s.heroTypewriter ?? []).join("\n")}
            onChange={(e) => set("heroTypewriter", e.target.value.split("\n").map((x) => x.trim()).filter(Boolean))}
            placeholder={"Chả lụa Bắc Hà\nNem chua Thanh Hoá\nGiò chả truyền thống"}
          />
        </Field>
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-2 text-[11px] text-sky-800">
          Để trống marquee để ẩn thanh chữ chạy. Để trống danh sách gõ chữ để dùng tiêu đề hero tĩnh.
        </div>
      </div>


      <div className="space-y-4 rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">SEO</h3>
        <Field label="Tiêu đề trang (meta title)"><Input value={s.metaTitle ?? ""} onChange={(e) => set("metaTitle", e.target.value)} /></Field>
        <Field label="Mô tả trang (meta description)"><Textarea rows={2} value={s.metaDescription ?? ""} onChange={(e) => set("metaDescription", e.target.value)} /></Field>
        <Field label="Ảnh chia sẻ (OG image URL)"><Input value={s.ogImage ?? ""} onChange={(e) => set("ogImage", e.target.value)} placeholder="https://…" /></Field>
      </div>

      <div className="flex justify-end"><Button onClick={save}><Save className="mr-2 h-4 w-4" /> Lưu thông tin</Button></div>

      <div className="space-y-3 rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Đổi mã admin</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Mã cũ"><Input type="password" value={oldCode} onChange={(e) => setOldCode(e.target.value)} /></Field>
          <Field label="Mã mới (≥ 4 ký tự)"><Input type="password" value={newCode} onChange={(e) => setNewCode(e.target.value)} /></Field>
        </div>
        <div className="flex justify-end"><Button variant="outline" onClick={changeCode}><KeyRound className="mr-2 h-4 w-4" /> Đổi mã</Button></div>
      </div>
    </div>
  );
}

// ---------- Hero video ----------
function HeroVideoPanel() {
  const { settings } = useSiteData();
  const [url, setUrl] = useState(settings.heroVideoUrl);
  useEffect(() => setUrl(settings.heroVideoUrl), [settings.heroVideoUrl]);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) { toast.error("File quá lớn (>8MB) — hãy dùng URL"); return; }
    setUrl(await fileToDataUrl(f));
  };

  return (
    <div className="mt-4 space-y-4 rounded-xl border bg-card p-5">
      <Field label="URL video (mp4)"><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… hoặc /__l5e/…" /></Field>
      <Field label="Hoặc tải video lên (≤ 8MB, lưu local)">
        <Input type="file" accept="video/mp4" onChange={(e) => onFile(e.target.files?.[0])} />
      </Field>
      <div className="overflow-hidden rounded-xl border">
        <video key={url} src={url} controls className="aspect-video w-full bg-black" />
      </div>
      <div className="flex justify-end">
        <Button onClick={() => { updateSettings({ heroVideoUrl: url }); toast.success("Đã cập nhật video hero"); }}>
          <Save className="mr-2 h-4 w-4" /> Lưu video
        </Button>
      </div>
    </div>
  );
}

// ---------- Inbox ----------
function InboxPanel() {
  const { consultations } = useSiteData();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "pending" | "handled">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    return consultations.filter((c) => {
      if (status === "pending" && c.handled) return false;
      if (status === "handled" && !c.handled) return false;
      if (!k) return true;
      return c.name.toLowerCase().includes(k) || c.phone.includes(k) || c.message.toLowerCase().includes(k);
    });
  }, [consultations, q, status]);

  const toggleSel = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((c) => c.id)));
  };

  const exportCsv = () => {
    const csv = toCsv(filtered, [
      { key: "createdAt", label: "Thời gian" },
      { key: "name", label: "Họ tên" },
      { key: "phone", label: "Số điện thoại" },
      { key: "message", label: "Nội dung" },
      { key: "handled", label: "Đã xử lý" },
    ]);
    downloadCsv(`tu-van-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên/SĐT/nội dung…" className="pl-9" />
        </div>
        <div className="flex rounded-md border">
          {(["all", "pending", "handled"] as const).map((v) => (
            <button key={v} onClick={() => setStatus(v)} className={`px-3 py-1.5 text-xs font-semibold ${status === v ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}>
              {v === "all" ? "Tất cả" : v === "pending" ? "Chưa xử lý" : "Đã xử lý"}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}><FileDown className="mr-2 h-4 w-4" /> Xuất CSV</Button>
        {selected.size > 0 && (
          <>
            <Button variant="outline" size="sm" onClick={() => { setConsultationsHandled(Array.from(selected), true); setSelected(new Set()); toast.success("Đã đánh dấu xử lý"); }}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Đánh dấu xử lý ({selected.size})
            </Button>
            <Button variant="destructive" size="sm" onClick={() => { if (confirm(`Xoá ${selected.size} mục?`)) { deleteConsultations(Array.from(selected)); setSelected(new Set()); } }}>
              <Trash className="mr-2 h-4 w-4" /> Xoá
            </Button>
          </>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
          <Checkbox checked={selected.size === filtered.length} onCheckedChange={toggleAll} />
          <span>Chọn tất cả ({filtered.length})</span>
        </div>
      )}

      <div className="space-y-2">
        {filtered.length === 0 && <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">Không có yêu cầu nào</div>}
        {filtered.map((c) => (
          <div key={c.id} className={`flex items-start gap-3 rounded-xl border bg-card p-4 ${c.handled ? "opacity-60" : ""}`}>
            <Checkbox className="mt-1" checked={selected.has(c.id)} onCheckedChange={() => toggleSel(c.id)} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{c.name}</span>
                <a href={`tel:${normalizeTel(c.phone)}`} className="text-sm text-primary hover:underline">{c.phone}</a>
                {c.handled && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Đã liên hệ</span>}
              </div>
              {c.message && <p className="mt-1 text-sm text-muted-foreground">{c.message}</p>}
              <p className="mt-1 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString("vi-VN")}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => toggleConsultation(c.id)}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> {c.handled ? "Bỏ đánh dấu" : "Đã liên hệ"}
            </Button>
            <Button size="icon" variant="ghost" onClick={() => deleteConsultation(c.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Visits ----------
function VisitsPanel() {
  const visits = useVisits();

  const daily = useMemo(() => {
    const map = new Map<string, number>();
    visits.forEach((v) => {
      const k = v.ts.slice(0, 10);
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    const days: { day: string; v: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ day: key.slice(5), v: map.get(key) ?? 0 });
    }
    return days;
  }, [visits]);

  const exportCsv = () => {
    const csv = toCsv(visits, [
      { key: "ts", label: "Thời gian" },
      { key: "path", label: "Đường dẫn" },
      { key: "referrer", label: "Nguồn" },
      { key: "ua", label: "User Agent" },
    ]);
    downloadCsv(`truy-cap-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const shortUA = (ua: string) => {
    if (/iPhone|iPad|iOS/i.test(ua)) return "iOS";
    if (/Android/i.test(ua)) return "Android";
    if (/Edg/i.test(ua)) return "Edge";
    if (/Chrome/i.test(ua)) return "Chrome";
    if (/Firefox/i.test(ua)) return "Firefox";
    if (/Safari/i.test(ua)) return "Safari";
    return "Khác";
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
        <strong>Lưu ý:</strong> lịch sử truy cập được lưu cục bộ trên trình duyệt này (không có server). Mỗi thiết bị admin sẽ thấy dữ liệu riêng. Tối đa 500 bản ghi gần nhất.
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Tổng lượt truy cập" value={visits.length} />
        <StatCard label="14 ngày qua" value={daily.reduce((a, b) => a + b.v, 0)} />
        <StatCard label="Hôm nay" value={daily[daily.length - 1]?.v ?? 0} />
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">14 ngày qua</h3>
        <div className="h-48 w-full">
          <Suspense fallback={<div className="h-full w-full animate-pulse rounded bg-muted/40" />}>
            <VisitsChart data={daily} />
          </Suspense>
        </div>

      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={exportCsv}><FileDown className="mr-2 h-4 w-4" /> Xuất CSV</Button>
        <Button variant="destructive" size="sm" onClick={() => { if (confirm("Xoá toàn bộ lịch sử truy cập?")) { clearVisits(); toast.success("Đã xoá"); } }}>
          <Trash className="mr-2 h-4 w-4" /> Xoá lịch sử
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="grid grid-cols-[1fr_1fr_1fr_80px] gap-2 border-b bg-muted/50 px-3 py-2 text-xs font-semibold">
          <span>Thời gian</span><span>Đường dẫn</span><span>Nguồn</span><span>Thiết bị</span>
        </div>
        {visits.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Chưa có lượt truy cập nào</div>}
        {visits.slice(0, 200).map((v) => (
          <div key={v.id} className="grid grid-cols-[1fr_1fr_1fr_80px] gap-2 border-b px-3 py-2 text-xs last:border-b-0">
            <span>{new Date(v.ts).toLocaleString("vi-VN")}</span>
            <span className="truncate">{v.path}</span>
            <span className="truncate text-muted-foreground">{v.referrer || "—"}</span>
            <span>{shortUA(v.ua)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Backup ----------
function BackupPanel() {
  const inputRef = useRef<HTMLInputElement>(null);

  const onExport = () => {
    const blob = new Blob([exportSiteData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `hoangbinh-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const onImport = async (f: File | undefined) => {
    if (!f) return;
    try { importSiteData(await f.text()); toast.success("Đã nhập dữ liệu"); }
    catch { toast.error("File không hợp lệ"); }
  };

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold">Xuất dữ liệu</h3>
        <p className="mt-1 text-sm text-muted-foreground">Tải file JSON chứa toàn bộ sản phẩm, bài viết, cài đặt, tư vấn.</p>
        <Button className="mt-3" onClick={onExport}><Download className="mr-2 h-4 w-4" /> Tải JSON</Button>
      </div>
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold">Nhập dữ liệu</h3>
        <p className="mt-1 text-sm text-muted-foreground">Khôi phục từ file đã xuất trước đó (ghi đè dữ liệu hiện tại).</p>
        <input ref={inputRef} type="file" accept="application/json" hidden onChange={(e) => onImport(e.target.files?.[0])} />
        <Button variant="outline" className="mt-3" onClick={() => inputRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Chọn file</Button>
      </div>
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 sm:col-span-2">
        <h3 className="font-semibold text-destructive">Khôi phục mặc định</h3>
        <p className="mt-1 text-sm text-muted-foreground">Xoá mọi thay đổi và đưa web về dữ liệu gốc.</p>
        <Button variant="destructive" className="mt-3" onClick={() => { if (confirm("Khôi phục về mặc định?")) { resetSiteData(); toast.success("Đã khôi phục"); } }}>
          <RefreshCw className="mr-2 h-4 w-4" /> Khôi phục
        </Button>
      </div>
    </div>
  );
}

// ---------- Testimonials ----------
function TestimonialsPanel() {
  const { testimonials } = useSiteData();
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const blank = (): Testimonial => ({
    id: `t_${Date.now()}`, name: "", role: "", avatar: "", rating: 5, order: testimonials.length + 1, hidden: false,
  });
  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">Quản lý đánh giá/khách hàng tin cậy hiển thị ở trang chủ (khối trước phần Tư vấn).</p>
        <Button onClick={() => setEditing(blank())}><Plus className="mr-2 h-4 w-4" /> Thêm đánh giá</Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="grid grid-cols-[56px_1fr_120px_180px] items-center gap-2 border-b bg-muted/50 px-3 py-2 text-xs font-semibold">
          <span>Ảnh</span><span>Tên / Vai trò</span><span>Sao</span><span className="text-right">Thao tác</span>
        </div>
        {testimonials.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Chưa có đánh giá nào</div>}
        {testimonials.map((t) => (
          <div key={t.id} className={`grid grid-cols-[56px_1fr_120px_180px] items-center gap-2 border-b px-3 py-2 text-sm last:border-b-0 ${t.hidden ? "opacity-50" : ""}`}>
            {t.avatar
              ? <img src={t.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
              : <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground"><ImageIcon className="h-5 w-5" /></div>}
            <div className="min-w-0">
              <div className="truncate font-medium">{t.name}</div>
              <div className="truncate text-xs text-muted-foreground">{t.role}</div>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < t.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
              ))}
            </div>
            <div className="flex justify-end gap-1">
              <Button size="icon" variant="ghost" title="Lên" onClick={() => moveTestimonial(t.id, -1)}><ArrowUp className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" title="Xuống" onClick={() => moveTestimonial(t.id, 1)}><ArrowDown className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" title={t.hidden ? "Hiện" : "Ẩn"} onClick={() => upsertTestimonial({ ...t, hidden: !t.hidden })}>
                {t.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(t)}>Sửa</Button>
              <Button size="icon" variant="ghost" onClick={() => { if (confirm(`Xoá đánh giá của ${t.name}?`)) deleteTestimonial(t.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
      {editing && <TestimonialEditor item={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function TestimonialEditor({ item, onClose }: { item: Testimonial; onClose: () => void }) {
  const [t, setT] = useState<Testimonial>(item);
  const set = <K extends keyof Testimonial>(k: K, v: Testimonial[K]) => setT((x) => ({ ...x, [k]: v }));
  const onFile = async (f: File | undefined) => { if (f) set("avatar", await fileToDataUrl(f)); };
  const save = () => {
    if (!t.name.trim()) { toast.error("Cần nhập tên"); return; }
    upsertTestimonial({ ...t, rating: Math.max(1, Math.min(5, Number(t.rating) || 5)) });
    toast.success("Đã lưu đánh giá");
    onClose();
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader><DialogTitle>{item.name ? "Sửa đánh giá" : "Thêm đánh giá"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Field label="Họ tên"><Input value={t.name} onChange={(e) => set("name", e.target.value)} placeholder="Chef Nguyễn Hoàng" /></Field>
          <Field label="Chức danh / Vai trò"><Input value={t.role} onChange={(e) => set("role", e.target.value)} placeholder="Bếp trưởng nhà hàng…" /></Field>
          <Field label="Ảnh đại diện">
            <div className="flex items-center gap-3">
              {t.avatar
                ? <img src={t.avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
                : <div className="grid h-16 w-16 place-items-center rounded-full bg-muted text-muted-foreground"><ImageIcon className="h-5 w-5" /></div>}
              <div className="flex-1 space-y-2">
                <Input value={t.avatar} onChange={(e) => set("avatar", e.target.value)} placeholder="https://… hoặc tải file" />
                <Input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
              </div>
            </div>
          </Field>
          <Field label="Số sao (1-5)">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => set("rating", n)} className="p-1" aria-label={`${n} sao`}>
                  <Star className={`h-6 w-6 ${n <= t.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
                </button>
              ))}
            </div>
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={!!t.hidden} onCheckedChange={(v) => set("hidden", !!v)} />
            <span>Ẩn khỏi trang web</span>
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button onClick={save}><Save className="mr-2 h-4 w-4" /> Lưu</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

