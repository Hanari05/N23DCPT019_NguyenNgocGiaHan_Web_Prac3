# N23DCPT019 – Nguyễn Ngọc Gia Hân – Web Prac 3

## Lab 3: Fullstack Integration (Next.js + Express)

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

### Bước 2 – tái hiện lỗi CORS (để chụp màn hình)

1. Trong `frontend/lib/api.ts` đặt `baseURL: 'http://localhost:5000'`.
2. Trong `backend/server.js` comment khối `app.use(cors(...))`, restart backend.
3. Mở `/products`, xem lỗi ở DevTools → Console, chụp màn hình.
4. Khôi phục cả hai chỗ trên.
