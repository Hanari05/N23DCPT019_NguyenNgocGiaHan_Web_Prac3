import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/Header';
import Providers from './providers';
import './globals.css';

const font = Be_Vietnam_Pro({
  variable: '--font-be-vietnam',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Cửa hàng – Quản lý sản phẩm',
  description: 'Fullstack Next.js + Express – Lab 3',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={font.variable}>
      <body className="min-h-screen antialiased">
        <Providers>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Header />
          <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
