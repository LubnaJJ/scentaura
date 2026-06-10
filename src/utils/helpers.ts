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

export const WHATSAPP_NUMBER = '94771770771';
export const ADMIN_EMAIL = 'admin@scentaura.lk';
export const CONTACT_EMAIL = 'hello@scentaura.lk';

export const openWhatsApp = (message: string) => {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
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
