'use client';

import { useState } from 'react';
import { Transaction, CATEGORIES, AIVoiceResult } from '@/lib/types';
import { X, Check } from 'lucide-react';
import ConfirmCard from './ConfirmCard';

interface ManualModalProps {
  onClose: () => void;
  onSaved: (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => void;
}

export default function ManualModal({ onClose, onSaved }: ManualModalProps) {
  const [state, setState] = useState<'form' | 'saved'>('form');
  const [data, setData] = useState<AIVoiceResult>({
    jumlah: 0,
    tipe: 'pengeluaran',
    kategori: 'Makanan',
    keterangan: '',
  });

  const handleSave = () => {
    if (data.jumlah <= 0) return;
    onSaved({ 
      ...data, 
      source: 'manual',
      created_at: data.tanggal ? new Date(data.tanggal).toISOString() : new Date().toISOString()
    });
    setState('saved');
    setTimeout(onClose, 1000);
  };

  const handleRetry = () => {
    setData({ jumlah: 0, tipe: 'pengeluaran', kategori: 'Makanan', keterangan: '' });
    setState('form');
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-sheet">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="type-display-md text-[#1d1d1f]" style={{ fontSize: '22px' }}>
              Catat Manual
            </h2>
            <p className="type-caption mt-1" style={{ color: '#7a7a7a' }}>
              Isi detail transaksi secara manual
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-icon-chip"
            style={{ background: '#f5f5f7', color: '#1d1d1f' }}
          >
            <X size={18} />
          </button>
        </div>

        {state === 'saved' ? (
          <div className="text-center py-12 animate-scale-in">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(48, 209, 88, 0.15)' }}>
              <Check size={28} style={{ color: '#30D158' }} />
            </div>
            <p className="type-body-strong text-[#1d1d1f]">Tersimpan!</p>
          </div>
        ) : (
          <ConfirmCard
            result={data}
            onChange={setData}
            onSave={handleSave}
            onRetry={handleRetry}
          />
        )}
      </div>
    </div>
  );
}
