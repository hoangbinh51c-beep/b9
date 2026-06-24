## Mục tiêu
Biến section `Testimonials` (`#danh-gia`) từ lưới thẻ 3 cột chiếm nhiều chiều cao thành **một dải đánh giá chạy ngang liên tục** (marquee) — gọn, không chiếm diện tích, và tự mở rộng khi có thêm nhiều đánh giá.

## Phạm vi
Chỉ chỉnh **`src/routes/index.tsx`** — đúng hàm `Testimonials()` (khoảng dòng 512–545).  
Không động vào: `__root.tsx`, router, `site-store`, kiểu dữ liệu `Testimonial`, trang admin, các section khác (Hero, Products, Blog, Consultation, Footer, FloatingChat, Marquee thông báo trên cùng).

## Thiết kế mới cho section Đánh giá
- Giữ nguyên `id="danh-gia"`, tiêu đề "Họ đã chọn …" nhưng **giảm padding dọc** (`py-10 sm:py-12`) để section thấp hơn nhiều.
- Bỏ lưới `grid sm:grid-cols-2 lg:grid-cols-3`.
- Thêm một **track marquee** dùng đúng class `marquee-track` đã có sẵn trong dự án (cùng animation với thanh thông báo trên cùng — không thêm CSS mới).
- Mỗi đánh giá render dưới dạng "viên" nhỏ nằm ngang: avatar tròn (h-10), tên + vai trò (1 dòng), 5 sao nhỏ, và (nếu có) trích đoạn ngắn `t.content` 1 dòng `truncate max-w-[260px]`.
- Danh sách được **nhân đôi** (`[...list, ...list]`) để chạy nối tiếp mượt, không giật.
- Wrapper: `overflow-hidden`, `mask-image` gradient hai mép để chữ mờ dần ở rìa (chỉ inline style, không sửa CSS toàn cục).
- Hover thì tạm dừng: `hover:[animation-play-state:paused]` trên track.
- Khi danh sách rỗng → vẫn `return null` như cũ.

## Vì sao tối ưu khi nhiều đánh giá
- Chiều cao section cố định (~1 hàng ~80px) bất kể có 5 hay 500 đánh giá.
- Marquee tự lặp danh sách, thêm đánh giá mới chỉ làm vòng lặp dài hơn — không tốn thêm không gian trang.
- Dùng `loading="lazy"` cho avatar để không ảnh hưởng tốc độ tải.

## Chi tiết kỹ thuật
```text
<section id="danh-gia" py-10 sm:py-12 bg-muted/40>
  <header (gọn 1 dòng): "Khách hàng tin cậy — Họ đã chọn {artisanName}">
  <div overflow-hidden style={{maskImage: linear-gradient(...)}}>
    <ul className="marquee-track flex gap-6 whitespace-nowrap hover:[animation-play-state:paused]">
      {[...list, ...list].map(t => (
        <li className="inline-flex items-center gap-3 rounded-full border bg-card px-4 py-2 shadow-sm">
          <img avatar h-10 w-10 rounded-full />
          <span font-semibold>{t.name}</span>
          <span text-xs text-muted-foreground>· {t.role}</span>
          <span flex gap-0.5> {5 sao h-3.5} </span>
          {t.content && <span truncate max-w-[260px] text-sm text-muted-foreground>"{t.content}"</span>}
        </li>
      ))}
    </ul>
  </div>
</section>
```

## Không thay đổi
- Logic dữ liệu, schema, admin CRUD đánh giá.
- Animation `marquee-track` (đã định nghĩa sẵn trong `styles.css`/global — dùng lại).
- Bất kỳ component/route nào khác.

## Kiểm thử
Sau khi sửa: chạy build/dev, mở trang chủ, cuộn tới `#danh-gia`, xác nhận: section thấp gọn, các "viên" đánh giá trôi ngang liên tục, hover dừng, không lỗi layout trên mobile.
