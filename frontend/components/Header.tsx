'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/queries';

export default function Header() {
  const pathname = usePathname();
  const { data: cart } = useCart();
  const count = cart?.totalQuantity ?? 0;

  const link = (href: string) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      pathname.startsWith(href) ? 'bg-brand-soft text-brand-dark' : 'text-muted hover:text-ink'
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/products" className="text-base font-bold tracking-tight">
          Fullstack Shop
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/products" className={link('/products')}>
            Sản phẩm
          </Link>
          <Link href="/cart" className={`${link('/cart')} flex items-center gap-2`}>
            Giỏ hàng
            <span
              aria-label={`${count} sản phẩm trong giỏ`}
              className={`min-w-5 rounded-full px-1.5 text-center text-xs font-semibold leading-5 ${
                count ? 'bg-brand text-white' : 'bg-line text-muted'
              }`}
            >
              {count}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
