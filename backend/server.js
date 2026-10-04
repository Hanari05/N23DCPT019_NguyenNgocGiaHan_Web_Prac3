require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_PATH = path.join(__dirname, 'data.json');

const SEED = {
  nextId: 4,
  products: [
    { id: 1, name: 'Áo thun', price: 150000 },
    { id: 2, name: 'Quần jeans', price: 350000 },
    { id: 3, name: 'Giày thể thao', price: 500000 },
  ],
  cart: [], // [{ productId, quantity }]
};

// ─── Lưu trữ file JSON (Nâng cao 3) ──────────────────────────────────────────
async function readData() {
  try {
    return JSON.parse(await fs.readFile(DATA_PATH, 'utf-8'));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    await writeData(SEED); // lần chạy đầu: tạo data.json từ dữ liệu mẫu
    return structuredClone(SEED);
  }
}
async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

// Xếp hàng các thao tác đọc-sửa-ghi để 2 request cùng lúc không ghi đè nhau
let queue = Promise.resolve();
function transaction(fn) {
  const run = queue.then(async () => {
    const data = await readData();
    const result = await fn(data);
    await writeData(data);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
// Frontend gọi qua proxy Next.js (cùng origin) nên CORS chỉ là lớp dự phòng
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  })
);
app.use(express.json());

// ─── Validation ──────────────────────────────────────────────────────────────
function parseProduct(body, { partial = false } = {}) {
  const out = {};
  if (!partial || body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim())
      throw new HttpError(400, 'Tên sản phẩm không được để trống.');
    out.name = body.name.trim();
  }
  if (!partial || body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0)
      throw new HttpError(400, 'Giá sản phẩm phải là số dương.');
    out.price = price;
  }
  return out;
}

function parseQuantity(value) {
  const q = Number(value);
  if (!Number.isInteger(q) || q < 1)
    throw new HttpError(400, 'Số lượng phải là số nguyên từ 1 trở lên.');
  return q;
}

// ─── Products ────────────────────────────────────────────────────────────────
app.get('/api/products', wrap(async (_req, res) => {
  res.json((await readData()).products);
}));

app.post('/api/products', wrap(async (req, res) => {
  console.log('req.body:', req.body);
  const fields = parseProduct(req.body);
  const created = await transaction((data) => {
    const product = { id: data.nextId++, ...fields };
    data.products.push(product);
    return product;
  });
  res.status(201).json(created);
}));

// Nâng cao 1: chỉ cập nhật name/price, không cho ghi đè id
app.put('/api/products/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  const fields = parseProduct(req.body, { partial: true });
  const updated = await transaction((data) => {
    const product = data.products.find((p) => p.id === id);
    if (!product) throw new HttpError(404, 'Không tìm thấy sản phẩm.');
    Object.assign(product, fields);
    return product;
  });
  res.json(updated);
}));

app.delete('/api/products/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  const deleted = await transaction((data) => {
    const index = data.products.findIndex((p) => p.id === id);
    if (index === -1) throw new HttpError(404, 'Không tìm thấy sản phẩm.');
    data.cart = data.cart.filter((c) => c.productId !== id); // dọn khỏi giỏ
    return data.products.splice(index, 1)[0];
  });
  res.json({ message: 'Xóa thành công.', product: deleted });
}));

// ─── Cart (Nâng cao 4) ───────────────────────────────────────────────────────
function buildCart(data) {
  const items = data.cart
    .map((c) => {
      const product = data.products.find((p) => p.id === c.productId);
      return product && { product, quantity: c.quantity, subtotal: product.price * c.quantity };
    })
    .filter(Boolean);
  return {
    items,
    totalQuantity: items.reduce((s, i) => s + i.quantity, 0),
    totalPrice: items.reduce((s, i) => s + i.subtotal, 0),
  };
}

app.get('/api/cart', wrap(async (_req, res) => {
  res.json(buildCart(await readData()));
}));

// Thêm vào giỏ: nếu đã có thì cộng dồn số lượng
app.post('/api/cart', wrap(async (req, res) => {
  const productId = Number(req.body.productId);
  const quantity = parseQuantity(req.body.quantity ?? 1);
  const cart = await transaction((data) => {
    if (!data.products.some((p) => p.id === productId))
      throw new HttpError(404, 'Không tìm thấy sản phẩm.');
    const line = data.cart.find((c) => c.productId === productId);
    if (line) line.quantity += quantity;
    else data.cart.push({ productId, quantity });
    return buildCart(data);
  });
  res.status(201).json(cart);
}));

// Đặt lại số lượng của một dòng trong giỏ
app.patch('/api/cart/:productId', wrap(async (req, res) => {
  const productId = Number(req.params.productId);
  const quantity = parseQuantity(req.body.quantity);
  const cart = await transaction((data) => {
    const line = data.cart.find((c) => c.productId === productId);
    if (!line) throw new HttpError(404, 'Sản phẩm chưa có trong giỏ.');
    line.quantity = quantity;
    return buildCart(data);
  });
  res.json(cart);
}));

app.delete('/api/cart/:productId', wrap(async (req, res) => {
  const productId = Number(req.params.productId);
  const cart = await transaction((data) => {
    const before = data.cart.length;
    data.cart = data.cart.filter((c) => c.productId !== productId);
    if (data.cart.length === before)
      throw new HttpError(404, 'Sản phẩm chưa có trong giỏ.');
    return buildCart(data);
  });
  res.json(cart);
}));

// ─── Xử lý lỗi ───────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed')
    return res.status(400).json({ error: 'Body không phải JSON hợp lệ.' });
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Lỗi máy chủ.' });
});

app.listen(PORT, () => {
  console.log(`Backend đang chạy tại http://localhost:${PORT}`);
});
