'use client';

import { useMemo, useState } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';
import ProductAvatar from '@/components/ProductAvatar';
import ProductDialog from '@/components/ProductDialog';
import { formatPrice } from '@/lib/format';
import { useAddToCart, useCart, useDeleteProduct, useProducts } from '@/lib/queries';
import type { Product } from '@/lib/types';

type Sort = 'newest' | 'name' | 'price-asc' | 'price-desc';

const iconBtn =
  'rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-page hover:text-ink';

export default function ProductsPage() {
  const { data: products, isLoading, isError, refetch } = useProducts();
  const { data: cart } = useCart();
  const addToCart = useAddToCart();
  const del = useDeleteProduct();

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('newest');
  // undefined = đóng, null = thêm mới, Product = sửa
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const inCart = useMemo(
    () => new Map(cart?.items.map((i) => [i.product.id, i.quantity])),
    [cart]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (products ?? []).filter((p) => p.name.toLowerCase().includes(q));
    const sorters: Record<Sort, (a: Product, b: Product) => number> = {
      newest: (a, b) => b.id - a.id,
      name: (a, b) => a.name.localeCompare(b.name, 'vi'),
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
    };
    return list.sort(sorters[sort]);
  }, [products, query, sort]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sản phẩm</h1>
          <p className="text-sm text-muted">
            {products ? `${products.length} sản phẩm trong cửa hàng` : 'Đang tải...'}
          </p>
        </div>
        <button
          onClick={() => setEditing(null)}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Thêm sản phẩm
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên sản phẩm"
          aria-label="Tìm sản phẩm"
          className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          aria-label="Sắp xếp"
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none"
        >
          <option value="newest">Mới nhất</option>
          <option value="name">Tên A–Z</option>
          <option value="price-asc">Giá thấp đến cao</option>
          <option value="price-desc">Giá cao đến thấp</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        {isLoading ? (
          <ul aria-busy className="divide-y divide-line">
            {[0, 1, 2].map((i) => (
              <li key={i} className="flex animate-pulse items-center gap-3 p-4">
                <span className="size-10 rounded-xl bg-line" />
                <span className="h-4 w-40 rounded bg-line" />
              </li>
            ))}
          </ul>
        ) : isError ? (
          <div className="p-10 text-center">
            <p className="font-medium">Không tải được danh sách sản phẩm.</p>
            <p className="mt-1 text-sm text-muted">Kiểm tra backend đã chạy ở cổng 5000 chưa.</p>
            <button
              onClick={() => refetch()}
              className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Tải lại
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium">
              {query ? `Không có sản phẩm khớp "${query}".` : 'Chưa có sản phẩm nào.'}
            </p>
            {!query && (
              <button
                onClick={() => setEditing(null)}
                className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Thêm sản phẩm đầu tiên
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap">
                <ProductAvatar id={p.id} name={p.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-sm text-muted">{formatPrice(p.price)}</p>
                </div>
                {inCart.has(p.id) && (
                  <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand-dark">
                    {inCart.get(p.id)} trong giỏ
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => addToCart.mutate(p.id)}
                    disabled={addToCart.isPending && addToCart.variables === p.id}
                    className="rounded-lg border border-brand px-3 py-1.5 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-soft disabled:opacity-50"
                  >
                    Thêm vào giỏ
                  </button>
                  <button onClick={() => setEditing(p)} className={iconBtn}>
                    Sửa
                  </button>
                  <button
                    onClick={() => setDeleting(p)}
                    className={`${iconBtn} hover:bg-danger-soft hover:text-danger`}
                  >
                    Xóa
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editing !== undefined && (
        <ProductDialog
          key={editing?.id ?? 'new'}
          product={editing}
          onClose={() => setEditing(undefined)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Xóa sản phẩm?"
          message={`"${deleting.name}" sẽ bị xóa khỏi cửa hàng và khỏi giỏ hàng. Không thể hoàn tác.`}
          confirmLabel="Xóa sản phẩm"
          onConfirm={() => del.mutate(deleting.id)}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
