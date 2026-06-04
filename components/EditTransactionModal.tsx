'use client';

import { useState } from 'react';
import { Transaction, CATEGORIES, formatRupiah } from '@/lib/types';
import { X, Check, Loader2 } from 'lucide-react';

interface EditTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSaved: (updated: Transaction) => void;
}

export default function EditTransactionModal({ transaction, onClose, onSaved }: EditTransactionModalProps) {
  const [jumlah, setJumlah] = useState(transaction.jumlah);
  const [keterangan, setKeterangan] = useState(transaction.keterangan || '');
  const [kategori, setKategori] = useState(transaction.kategori);
  const [tipe, setTipe] = useState(transaction.tipe);
  const [tanggal, setTanggal] = useState(transaction.created_at.split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const formatInput = (val: string) => {
    const digits = val.replace(/\D/g, '');
    return digits ? parseInt(digits) : 0;
  };

  const handleSave = async () => {
    if (jumlah <= 0) return;
    setSaving(true);
    try {
      // Build updated created_at from chosen date, keep original time
      const originalTime = transaction.created_at.split('T')[1] || '00:00:00.000Z';
      const newCreatedAt = `${tanggal}T${originalTime}`;

      const updated: Transaction = {
        ...transaction,
        jumlah,
        keterangan,
        kategori,
        tipe,
        created_at: newCreatedAt,
      };

      onSaved(updated);
      setSaved(true);
      setTimeout(onClose, 800);
    } finally {
      setSaving(false);
    }
  };

  const isValid = jumlah > 0;

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-sheet">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="type-display-md text-[#1d1d1f]" style={{ fontSize: '20px' }}>
              Edit Transaksi
            </h2>
            <p className="type-caption mt-0.5" style={{ color: '#7a7a7a' }}>
              Perbarui detail transaksi
            </p>
          </div>
          <button onClick={onClose} className="btn-icon-chip" style={{ background: '#f5f5f7', color: '#1d1d1f' }}>
            <X size={18} />
          </button>
        </div>

        {saved ? (
          <div className="text-center py-12 animate-scale-in">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(48, 209, 88, 0.15)' }}
            >
              <Check size={28} style={{ color: '#30D158' }} />
            </div>
            <p className="type-body-strong text-[#1d1d1f]">Tersimpan!</p>
          </div>
        ) : (
          <div className="animate-slide-up flex flex-col gap-4">
            {/* Amount */}
            <div className="text-center py-4">
              <p className="type-fine mb-2" style={{ color: '#7a7a7a' }}>
                {tipe === 'pemasukan' ? '+ Pemasukan' : '− Pengeluaran'}
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="type-body-strong text-[#7a7a7a]" style={{ fontSize: '24px' }}>Rp</span>
                <input
                  type="text"
                  value={jumlah.toLocaleString('id-ID')}
                  onChange={e => setJumlah(formatInput(e.target.value))}
                  className="text-center font-semibold bg-transparent border-none outline-none"
                  style={{
                    fontSize: '36px',
                    lineHeight: '1.1',
                    letterSpacing: '-0.02em',
                    color: tipe === 'pemasukan' ? '#30D158' : '#1d1d1f',
                    width: `${Math.max(4, jumlah.toString().length + 2)}ch`,
                    minWidth: '120px',
                  }}
                />
              </div>
              {!isValid && (
                <p className="type-caption mt-2" style={{ color: '#FF3B30' }}>
                  Masukkan nominal yang valid
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="type-caption-strong block mb-2 text-[#1d1d1f]">Keterangan</label>
              <input
                type="text"
                value={keterangan}
                onChange={e => setKeterangan(e.target.value)}
                placeholder="Deskripsi transaksi"
                className="input-field"
              />
            </div>

            {/* Category */}
            <div>
              <label className="type-caption-strong block mb-2 text-[#1d1d1f]">Kategori</label>
              <div className="relative">
                <select
                  value={kategori}
                  onChange={e => setKategori(e.target.value)}
                  className="input-select"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="type-caption-strong block mb-2 text-[#1d1d1f]">Jenis</label>
              <div className="flex rounded-[11px] p-1" style={{ background: '#f5f5f7' }}>
                {(['pengeluaran', 'pemasukan'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTipe(t)}
                    className={`flex-1 py-2 rounded-[8px] type-caption-strong transition-all duration-200 capitalize ${
                      tipe === t ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#7a7a7a]'
                    }`}
                  >
                    {t === 'pengeluaran' ? '↓ Pengeluaran' : '↑ Pemasukan'}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="type-caption-strong block mb-2 text-[#1d1d1f]">Tanggal</label>
              <input
                type="date"
                value={tanggal}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setTanggal(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-2">
              <button onClick={onClose} className="btn-secondary flex items-center gap-2 flex-1 justify-center">
                <X size={15} /> Batal
              </button>
              <button
                onClick={handleSave}
                disabled={!isValid || saving}
                className="btn-primary flex items-center gap-2 flex-1 justify-center"
                style={{ opacity: isValid && !saving ? 1 : 0.4 }}
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                Simpan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
