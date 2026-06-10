import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, Order, Inquiry } from '../types';
import { seedProducts } from '../utils/seedData';

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const snap = await getDocs(collection(db, 'products'));
  if (snap.empty) {
    await Promise.all(
      seedProducts.map((p) => setDoc(doc(db, 'products', p.id), p))
    );
    return seedProducts;
  }
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Product));
}

export async function addProduct(product: Product): Promise<void> {
  await setDoc(doc(db, 'products', product.id), product);
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<void> {
  await updateDoc(doc(db, 'products', id), updates as Record<string, unknown>);
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, 'products', id));
}

export async function decrementStock(
  productId: string,
  quantity: number
): Promise<{ stockQuantity: number; inStock: boolean }> {
  const ref = doc(db, 'products', productId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { stockQuantity: 0, inStock: false };

  const current: number =
    typeof snap.data().stockQuantity === 'number' ? snap.data().stockQuantity : 50;
  const next = Math.max(0, current - quantity);
  const patch: Record<string, unknown> = { stockQuantity: next };
  if (next === 0) patch.inStock = false;

  await updateDoc(ref, patch);
  return { stockQuantity: next, inStock: next > 0 };
}

// Backfills stockQuantity: 50 on any product document that is missing the field.
// Idempotent — safe to call on every app start.
export async function seedStockQuantity(): Promise<void> {
  const snap = await getDocs(collection(db, 'products'));
  await Promise.all(
    snap.docs
      .filter((d) => typeof d.data().stockQuantity !== 'number')
      .map((d) => updateDoc(d.ref, { stockQuantity: 50 }))
  );
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function getOrders(): Promise<Order[]> {
  const snap = await getDocs(
    query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Order));
}

export async function addOrder(order: Order): Promise<void> {
  await setDoc(doc(db, 'orders', order.id), order);
}

export async function updateOrderStatus(
  id: string,
  status: Order['status']
): Promise<void> {
  await updateDoc(doc(db, 'orders', id), {
    status,
    updatedAt: new Date().toISOString(),
  });
}

// ─── Inquiries ───────────────────────────────────────────────────────────────

export async function getInquiries(): Promise<Inquiry[]> {
  const snap = await getDocs(
    query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Inquiry));
}

export async function addInquiry(inquiry: Inquiry): Promise<void> {
  await setDoc(doc(db, 'inquiries', inquiry.id), inquiry);
}

export async function markInquiryRead(id: string): Promise<void> {
  await updateDoc(doc(db, 'inquiries', id), { read: true });
}
