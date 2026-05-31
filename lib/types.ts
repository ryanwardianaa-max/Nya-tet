export type TransactionType = 'pemasukan' | 'pengeluaran';

export interface Transaction {
  id: string;
  user_id: string;
  jumlah: number;
  tipe: TransactionType;
  kategori: string;
  keterangan: string;
  created_at: string;
  source: 'voice' | 'scan' | 'manual';
}

export interface AIVoiceResult {
  jumlah: number;
  kategori: string;
  keterangan: string;
  tipe: TransactionType;
}

export interface AIScanResult {
  jumlah: number;
  toko: string;
  tanggal: string;
  keterangan: string;
  tipe: TransactionType;
  kategori: string;
}

export const CATEGORIES = [
  { id: 'Makanan', label: 'Makanan & Minuman', emoji: '🍜', color: '#FF9500' },
  { id: 'Transportasi', label: 'Transportasi', emoji: '🚗', color: '#0066cc' },
  { id: 'Belanja', label: 'Belanja', emoji: '🛒', color: '#30D158' },
  { id: 'Hiburan', label: 'Hiburan', emoji: '🎮', color: '#BF5AF2' },
  { id: 'Kesehatan', label: 'Kesehatan', emoji: '❤️', color: '#FF375F' },
  { id: 'Tagihan', label: 'Tagihan & Utilitas', emoji: '💡', color: '#FFD60A' },
  { id: 'Pendidikan', label: 'Pendidikan', emoji: '📚', color: '#64D2FF' },
  { id: 'Pemasukan', label: 'Pemasukan', emoji: '💰', color: '#30D158' },
  { id: 'Transfer', label: 'Transfer', emoji: '↔️', color: '#0066cc' },
  { id: 'Lainnya', label: 'Lainnya', emoji: '📌', color: '#8E8E93' },
];

export function getCategoryInfo(kategori: string) {
  return (
    CATEGORIES.find(c => c.id.toLowerCase() === kategori.toLowerCase()) ||
    { id: kategori, label: kategori, emoji: '📌', color: '#8E8E93' }
  );
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Hari ini';
  if (date.toDateString() === yesterday.toDateString()) return 'Kemarin';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

// Mock data for demo mode
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1', user_id: 'demo', jumlah: 35000, tipe: 'pengeluaran',
    kategori: 'Makanan', keterangan: 'Makan siang di warteg', created_at: new Date().toISOString(), source: 'voice',
  },
  {
    id: '2', user_id: 'demo', jumlah: 15000, tipe: 'pengeluaran',
    kategori: 'Transportasi', keterangan: 'Bayar parkir motor', created_at: new Date(Date.now() - 3600000).toISOString(), source: 'voice',
  },
  {
    id: '3', user_id: 'demo', jumlah: 5000000, tipe: 'pemasukan',
    kategori: 'Pemasukan', keterangan: 'Gaji bulanan', created_at: new Date(Date.now() - 86400000).toISOString(), source: 'manual',
  },
  {
    id: '4', user_id: 'demo', jumlah: 89500, tipe: 'pengeluaran',
    kategori: 'Belanja', keterangan: 'Indomaret - sabun & sampo', created_at: new Date(Date.now() - 86400000 * 2).toISOString(), source: 'scan',
  },
  {
    id: '5', user_id: 'demo', jumlah: 150000, tipe: 'pengeluaran',
    kategori: 'Tagihan', keterangan: 'Bayar listrik PLN', created_at: new Date(Date.now() - 86400000 * 3).toISOString(), source: 'manual',
  },
  {
    id: '6', user_id: 'demo', jumlah: 28000, tipe: 'pengeluaran',
    kategori: 'Makanan', keterangan: 'Kopi dan roti bakar', created_at: new Date(Date.now() - 86400000 * 4).toISOString(), source: 'voice',
  },
  {
    id: '7', user_id: 'demo', jumlah: 500000, tipe: 'pemasukan',
    kategori: 'Pemasukan', keterangan: 'Freelance design project', created_at: new Date(Date.now() - 86400000 * 5).toISOString(), source: 'manual',
  },
  {
    id: '8', user_id: 'demo', jumlah: 45000, tipe: 'pengeluaran',
    kategori: 'Hiburan', keterangan: 'Netflix bulanan', created_at: new Date(Date.now() - 86400000 * 6).toISOString(), source: 'manual',
  },
];
