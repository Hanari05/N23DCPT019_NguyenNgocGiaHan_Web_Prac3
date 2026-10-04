'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api, { errorMessage } from './api';
import type { Cart, Product, ProductInput } from './types';

const PRODUCTS = ['products'] as const;
const CART = ['cart'] as const;

export function useProducts() {
  return useQuery({
    queryKey: PRODUCTS,
    queryFn: () => api.get<Product[]>('/api/products').then((r) => r.data),
  });
}

export function useCart() {
  return useQuery({
    queryKey: CART,
    queryFn: () => api.get<Cart>('/api/cart').then((r) => r.data),
  });
}

// Thêm (không có id) hoặc sửa (có id)
export function useSaveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: ProductInput & { id?: number }) =>
      id
        ? api.put<Product>(`/api/products/${id}`, input).then((r) => r.data)
        : api.post<Product>('/api/products', input).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTS });
      qc.invalidateQueries({ queryKey: CART }); // giá đổi thì tổng tiền giỏ đổi
    },
  });
}

// Xóa với optimistic update: ẩn ngay, lỗi thì khôi phục
export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/products/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: PRODUCTS });
      const previous = qc.getQueryData<Product[]>(PRODUCTS);
      qc.setQueryData<Product[]>(PRODUCTS, (old) => old?.filter((p) => p.id !== id));
      return { previous };
    },
    onSuccess: () => toast.success('Đã xóa sản phẩm', { icon: '🗑️' }),
    onError: (err, _id, ctx) => {
      qc.setQueryData(PRODUCTS, ctx?.previous);
      toast.error(errorMessage(err, 'Xóa thất bại, đã khôi phục danh sách.'));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: PRODUCTS });
      qc.invalidateQueries({ queryKey: CART });
    },
  });
}

// Các thao tác giỏ hàng đều trả về giỏ mới → ghi thẳng vào cache, badge cập nhật tức thì
function useCartMutation<V>(fn: (v: V) => Promise<Cart>, successMsg?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (cart) => {
      qc.setQueryData(CART, cart);
      if (successMsg) toast.success(successMsg);
    },
    onError: (err) => toast.error(errorMessage(err, 'Không cập nhật được giỏ hàng.')),
  });
}

export const useAddToCart = () =>
  useCartMutation(
    (productId: number) =>
      api.post<Cart>('/api/cart', { productId, quantity: 1 }).then((r) => r.data),
    'Đã thêm vào giỏ hàng'
  );

export const useSetQuantity = () =>
  useCartMutation(({ productId, quantity }: { productId: number; quantity: number }) =>
    api.patch<Cart>(`/api/cart/${productId}`, { quantity }).then((r) => r.data)
  );

export const useRemoveFromCart = () =>
  useCartMutation(
    (productId: number) => api.delete<Cart>(`/api/cart/${productId}`).then((r) => r.data),
    'Đã bỏ khỏi giỏ hàng'
  );
