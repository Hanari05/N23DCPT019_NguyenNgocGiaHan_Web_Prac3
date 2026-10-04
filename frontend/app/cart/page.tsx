'use client';

import Link from 'next/link';
import ProductAvatar from '@/components/ProductAvatar';
import { formatPrice } from '@/lib/format';
import { useCart, useRemoveFromCart, useSetQuantity } from '@/lib/queries';

const stepBtn =
  'flex size-8 items-center justify-center rounded-lg border border-line text-base font-medium hover:bg-page disabled:opacity-40';

export default function CartPage() {
  const { data: cart, isLoading, isError, refetch } = useCart();
  const setQty = useSetQuantity();
  const remove = useRemoveFromCart();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Giỏ hàng</h1>
        <p className="text-sm text-muted">
          {cart ? `${cart.totalQuantity} sản phẩm` : 'Đang tải...'}
        </p>
      </div>

      {isLoading ? (
        <div aria-busy className="h-40 animate-pulse rounded-2xl bg-line" />
      ) : isError || !cart ? (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center">
          <p className="font-medium">Không tải được giỏ hàng.</p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Tải lại
          </button>
        </div>
      ) : cart.items.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center">
          <p className="font-medium">Giỏ hàng đang trống.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Chọn sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[1fr_20rem]">
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {cart.items.map(({ product, quantity, subtotal }) => (
              <li key={product.id} className="flex flex-wrap items-center gap-3 p-4">
                <ProductAvatar id={product.id} name={product.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="text-sm text-muted">{formatPrice(product.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    aria-label="Giảm số lượng"
                    disabled={quantity <= 1 || setQty.isPending}
                    onClick={() => setQty.mutate({ productId: product.id, quantity: quantity - 1 })}
                    className={stepBtn}
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium tabular-nums">{quantity}</span>
                  <button
                    aria-label="Tăng số lượng"
                    disabled={setQty.isPending}
                    onClick={() => setQty.mutate({ productId: product.id, quantity: quantity + 1 })}
                    className={stepBtn}
                  >
                    +
                  </button>
                </div>
                <p className="w-28 text-right text-sm font-semibold tabular-nums">
                  {formatPrice(subtotal)}
                </p>
                <button
                  onClick={() => remove.mutate(product.id)}
                  disabled={remove.isPending}
                  className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted hover:bg-danger-soft hover:text-danger disabled:opacity-50"
                >
                  Bỏ
                </button>
              </li>
            ))}
          </ul>

          <aside className="space-y-4 rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-20">
            <h2 className="font-semibold">Tổng đơn hàng</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Số lượng</dt>
                <dd className="tabular-nums">{cart.totalQuantity}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
                <dt>Tổng tiền</dt>
                <dd className="tabular-nums">{formatPrice(cart.totalPrice)}</dd>
              </div>
            </dl>
            <Link
              href="/products"
              className="block rounded-lg border border-line px-4 py-2 text-center text-sm font-medium hover:bg-page"
            >
              Tiếp tục chọn sản phẩm
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
