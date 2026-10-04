# N23DCPT019 – Nguyễn Ngọc Gia Hân – Web Prac 3

## Lab 3: Fullstack Integration (Next.js + Express)
**Sinh viên:** Nguyễn Ngọc Gia Hân · **MSSV:** N23DCPT019  
**Học phần:** Lập trình Web  
**Chủ đề:** Kết nối Frontend NextJS với Backend Express để quản lý giỏ hàng / sản phẩm

### Cấu trúc

```
backend/
├── server.js      # Express: products (GET/POST/PUT/DELETE) + cart (GET/POST/PATCH/DELETE)
├── data.json      # tự tạo khi chạy lần đầu (sản phẩm + giỏ hàng)
└── .env           # PORT, CLIENT_ORIGIN
frontend/
├── app/
│   ├── layout.tsx, providers.tsx   # Toaster + React Query
│   ├── products/page.tsx           # Danh sách, tìm kiếm, sắp xếp, thêm/sửa/xóa
│   └── cart/page.tsx               # Giỏ hàng, đổi số lượng, tổng tiền
├── components/                     # Header (badge giỏ), Dialog, ProductDialog, ConfirmDialog
├── lib/                            # api.ts (axios), queries.ts (React Query), types, format
└── next.config.ts                  # Proxy /api/* → Express
screenshots/
└── cors-error.png                  # Bằng chứng lỗi CORS (Bước 2, Tiết 1)
```

### Chạy

```bash
# Terminal 1
cd backend && npm install && npm run dev      # http://localhost:5000
# Terminal 2
cd frontend && npm install && npm run dev     # http://localhost:3000
```

Mở http://localhost:3000/products

### Đã làm

| Phần | Nội dung |
|------|----------|
| Tiết 1 | Express + CORS; frontend gọi `/api/*` qua proxy `rewrites()` (cùng origin, không cần CORS) |
| Tiết 2 | POST với validation, axios instance tập trung |
| Tiết 3 | react-hot-toast (`success`, `error`, `promise`), middleware log request |
| Bắt buộc | DELETE + optimistic update + rollback khi lỗi |
| Nâng cao 1 | PUT `/api/products/:id` (chỉ nhận `name`, `price`) + dialog sửa |
| Nâng cao 2 | TanStack Query: `useQuery`, `useMutation`, `invalidateQueries`, `staleTime` 30s |
| Nâng cao 3 | Lưu `data.json` bằng `fs.promises`, có hàng đợi ghi để tránh ghi đè |
| Nâng cao 4 | Cart: GET/POST/PATCH/DELETE, badge số lượng ở header, trang `/cart` |

### Bước 2 – Tái hiện lỗi CORS

**Cách làm:**

1. Trong `frontend/lib/api.ts`, tạm đặt `baseURL: 'http://localhost:5000'`.
2. Trong `backend/server.js`, comment khối `app.use(cors({...}))`, giữ nguyên `app.use(express.json())` đứng ngoài khối comment, rồi restart backend.
3. Mở `http://localhost:3000/products`. Bật **Disable cache** trong tab Network của DevTools rồi tải lại cứng (Ctrl+Shift+R) — nếu không, trình duyệt có thể vẫn dùng phản hồi cũ (kèm header CORS cũ) trong cache và không hiện lỗi mới.
4. Console hiện lỗi dạng:

   > Access to XMLHttpRequest at 'http://localhost:5000/api/products' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.

   Ảnh chụp: `screenshots/cors-error.png`.

5. Khôi phục: bỏ comment `cors()`, restart backend; đặt lại `baseURL` rỗng trong `api.ts`.

**Lỗi xảy ra ở phía nào?** Ở trình duyệt (client). Gọi trực tiếp API bằng `curl` lúc đó vẫn nhận `200 OK` và đủ dữ liệu JSON — nghĩa là server nhận và xử lý request bình thường. Trình duyệt mới là bên chặn: nó không cho JavaScript của trang đọc phản hồi, vì phản hồi thiếu header `Access-Control-Allow-Origin` xác nhận origin `http://localhost:3000` được phép truy cập.

### Checklist nộp bài

- [x] Backend chạy cổng 5000, có đủ GET / POST / PUT / DELETE cho products, và GET / POST / PATCH / DELETE cho cart
- [x] Frontend gọi API thành công qua proxy, không lỗi CORS khi chạy bình thường
- [x] Form thêm sản phẩm hoạt động đúng, có validation
- [x] Sửa sản phẩm (PUT) qua dialog có sẵn giá trị
- [x] Nút Xóa với Optimistic Update + rollback khi lỗi (không cần tải lại trang)
- [x] Giỏ hàng: thêm, đổi số lượng, xóa, badge cập nhật tức thì
- [x] Toast thông báo đầy đủ khi thêm / sửa / xóa / lỗi
- [x] Dữ liệu lưu vào `data.json`, không mất khi restart server
- [x] Đã tái hiện và chụp lại lỗi CORS (xem mục trên)
- [x] Không có lỗi đỏ trong Console và Terminal khi chạy bình thường
