import axios from 'axios';

// baseURL rỗng → request đi tới /api/... cùng origin, được proxy sang Express
// (xem rewrites trong next.config.ts), nên không dính lỗi CORS.
const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

export function errorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error ?? (err.response ? fallback : 'Không kết nối được máy chủ.');
  }
  return fallback;
}

export default api;
