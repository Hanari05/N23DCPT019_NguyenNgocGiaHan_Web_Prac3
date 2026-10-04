import type { NextConfig } from 'next';

// Trình duyệt chỉ gọi /api/* (cùng origin); Next.js chuyển tiếp sang Express.
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const nextConfig: NextConfig = {
  // Next 16 chặn truy cập dev từ origin khác localhost (vd. IP của WSL/LAN).
  // Thêm IP bạn dùng để mở trang vào đây, hoặc đặt biến DEV_ORIGINS="ip1,ip2".
  allowedDevOrigins: ['172.20.224.1', ...(process.env.DEV_ORIGINS?.split(',') ?? [])],

  async rewrites() {
    return [{ source: '/api/:path*', destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;
