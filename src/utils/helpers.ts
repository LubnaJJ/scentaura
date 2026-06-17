import { useStore } from '../store/useStore';

export const formatPrice = (price: number): string =>
  `Rs. ${price.toLocaleString('en-LK')}`;

export const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// Fallback constants — used before store initialises
export const WHATSAPP_NUMBER = '94779196491';
export const ADMIN_EMAIL = 'admin@zacksperfume.lk';
export const CONTACT_EMAIL = 'hello@zacksperfume.lk';

export const openWhatsApp = (message: string) => {
  const { storeSettings } = useStore.getState();
  const raw = storeSettings?.whatsappNumber || WHATSAPP_NUMBER;
  // Strip all non-digits; convert local format 0xxxxxxxxx → 94xxxxxxxxx
  let number = raw.replace(/\D/g, '');
  if (number.startsWith('0')) number = '94' + number.slice(1);
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  // Anchor click is more reliable than window.open on mobile
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.click();
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const STATUS_COLORS: Record<string, string> = {
  pending: '#C9A84C',
  confirmed: '#2196F3',
  processing: '#9C27B0',
  shipped: '#FF9800',
  delivered: '#4CAF50',
  cancelled: '#F44336',
};

export const SRI_LANKA_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle',
];
