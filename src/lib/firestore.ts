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
import { Product, Order, Inquiry, StoreSettings } from '../types';
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

// ─── Store Settings ───────────────────────────────────────────────────────────

export async function getStoreSettings(): Promise<StoreSettings | null> {
  const snap = await getDoc(doc(db, 'settings', 'store'));
  if (!snap.exists()) return null;
  return snap.data() as StoreSettings;
}

export async function saveStoreSettings(
  settings: Partial<StoreSettings>
): Promise<void> {
  await setDoc(doc(db, 'settings', 'store'), settings, { merge: true });
}

// Creates the settings document with defaults only if it doesn't already exist.
export async function initDefaultSettings(): Promise<void> {
  const ref = doc(db, 'settings', 'store');
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, {
    storeName: 'Zacks Signature',
    storeTagline: 'Arabian Fragrances',
    heroTitle: 'Wear the Soul of Arabia',
    heroEyebrow: 'Arabian Perfumery · Sri Lanka',
    heroSubtitle: 'Rare Ouds. Sacred Ambers. Precious Musks.',
    whatsappNumber: '94771770771',
    contactEmail: 'hello@zackssignature.com',
    footerTagline: 'Curating the finest Arabic fragrances for the discerning man in Sri Lanka.',
  });
}
