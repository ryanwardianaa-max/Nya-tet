'use client';

import { AIVoiceResult, CATEGORIES, formatRupiah } from '@/lib/types';
import { Check, RotateCcw, ChevronDown } from 'lucide-react';

interface ConfirmCardProps {
  result: AIVoiceResult;
  onChange: (result: AIVoiceResult) => void;
  onSave: () => void;
  onRetry: () => void;
}

export default function ConfirmCard({ result, onChange, onSave, onRetry }: ConfirmCardProps) {
  const isValid = result.jumlah > 0;

  const formatInput = (val: string) => {
    // Remove non-digits
    const digits = val.replace(/\D/g, '');
    return digits ? parseInt(digits) : 0;
  };

  return (
    <div className="animate-slide-up">
      {/* Amount — the primary field */}
      <div className="text-center mb-8 py-4">
        <p className="type-fine mb-2" style={{ color: '#7a7a7a' }}>
          {result.tipe === 'pemasukan' ? '+ Pemasukan' : '− Pengeluaran'}
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="type-body-strong text-[#7a7a7a]" style={{ fontSize: '24px' }}>Rp</span>
          <input
            type="text"
            value={result.jumlah.toLocaleString('id-ID')}
            onChange={e => onChange({ ...result, jumlah: formatInput(e.target.value) })}
            className="text-center font-semibold bg-transparent border-none outline-none"
            style={{
              fontSize: '40px',
              lineHeight: '1.1',
              letterSpacing: '-0.02em',
              color: result.tipe === 'pemasukan' ? '#30D158' : '#1d1d1f',
              width: `${Math.max(4, result.jumlah.toString().length + 2)}ch`,
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

      {/* Fields */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Description */}
        <div>
          <label className="type-caption-strong block mb-2 text-[#1d1d1f]">Keterangan</label>
          <input
            type="text"
            value={result.keterangan}
            onChange={e => onChange({ ...result, keterangan: e.target.value })}
            placeholder="Deskripsi transaksi"
            className="input-field"
          />
        </div>

        {/* Category */}
        <div>
          <label className="type-caption-strong block mb-2 text-[#1d1d1f]">Kategori</label>
          <div className="relative">
            <select
              value={result.kategori}
              onChange={e => onChange({ ...result, kategori: e.target.value })}
              className="input-select"
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </option>
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
                onClick={() => onChange({ ...result, tipe: t })}
                className={`flex-1 py-2 rounded-[8px] type-caption-strong transition-all duration-200 capitalize ${
                  result.tipe === t ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#7a7a7a]'
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
            value={result.tanggal || new Date().toISOString().split('T')[0]}
            max={new Date().toISOString().split('T')[0]}
            min={new Date(new Date().setFullYear(new Date().getFullYear() - 2)).toISOString().split('T')[0]}
            onChange={e => onChange({ ...result, tanggal: e.target.value })}
            className="input-field"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="btn-secondary flex items-center gap-2 flex-1 justify-center"
        >
          <RotateCcw size={15} /> Ulangi
        </button>
        <button
          onClick={onSave}
          disabled={!isValid}
          className="btn-primary flex items-center gap-2 flex-1 justify-center"
          style={{ opacity: isValid ? 1 : 0.4 }}
        >
          <Check size={15} /> Simpan
        </button>
      </div>
    </div>
  );
}
