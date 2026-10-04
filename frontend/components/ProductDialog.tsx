'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import Dialog from './Dialog';
import { errorMessage } from '@/lib/api';
import { useSaveProduct } from '@/lib/queries';
import type { Product } from '@/lib/types';

const inputCls =
  'w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm placeholder:text-muted/60 focus:border-brand focus:outline-none';

export default function ProductDialog({
  product,
  onClose,
}: {
  product: Product | null; // null = thêm mới
  onClose: () => void;
}) {
  const save = useSaveProduct();
  const [name, setName] = useState(product?.name ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const editing = product !== null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return void toast.error('Nhập tên sản phẩm.');
    if (!(Number(price) > 0)) return void toast.error('Giá phải là số dương.');

    toast
      .promise(save.mutateAsync({ id: product?.id, name: name.trim(), price: Number(price) }), {
        loading: editing ? 'Đang lưu thay đổi...' : 'Đang thêm sản phẩm...',
        success: (p) => (editing ? `Đã lưu "${p.name}"` : `Đã thêm "${p.name}"`),
        error: (err) => errorMessage(err, 'Có lỗi xảy ra, thử lại sau.'),
      })
      .then(onClose)
      .catch(() => {});
  };

  return (
    <Dialog title={editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium">
          Tên sản phẩm
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Áo thun basic"
            className={`${inputCls} mt-1`}
          />
        </label>
        <label className="block text-sm font-medium">
          Giá (₫)
          <input
            type="number"
            min={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="150000"
            className={`${inputCls} mt-1`}
          />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:bg-page"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={save.isPending}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {editing ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
