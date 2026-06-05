'use client';

import { useState } from 'react';
import { Transaction, formatRupiah, formatDateShort, getCategoryInfo } from '@/lib/types';
import { Mic, Camera, Pencil, Clock, Trash2, Edit3, ChevronRight, Soup, ShoppingBag, Car, Gamepad2, Wallet, Pill, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
}

const SourceIcon = ({ source }: { source: string }) => {
  const style = { width: 10, height: 10 };
  if (source === 'voice') return <Mic {...style} />;
  if (source === 'scan') return <Camera {...style} />;
  return <Pencil {...style} />;
};

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-4 border-b" style={{ borderColor: '#f0f0f0' }}>
      <div className="w-11 h-11 rounded-[11px] animate-pulse" style={{ background: '#f0f0f0', flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <div className="h-4 w-32 rounded animate-pulse mb-2" style={{ background: '#f0f0f0' }} />
        <div className="h-3 w-20 rounded animate-pulse" style={{ background: '#f5f5f7' }} />
      </div>
      <div className="h-5 w-24 rounded animate-pulse" style={{ background: '#f0f0f0' }} />
    </div>
  );
}

// Group transactions by date label
function groupByDate(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};
  for (const tx of transactions) {
    const label = formatDateShort(tx.created_at);
    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  }
  return groups;
}

function TransactionRow({ tx, onEdit, onDelete }: {
  tx: Transaction;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const cat = getCategoryInfo(tx.kategori);
  const hasActions = onEdit || onDelete;

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete?.(tx.id);
    } else {
      setConfirmDelete(true);
      // Auto reset after 3 seconds if user doesn't confirm
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const getCategoryStyle = (kategori: string, keterangan: string, isIncome: boolean) => {
    const lowerDesc = (keterangan || '').toLowerCase();
    const lowerCat = (kategori || '').toLowerCase();
    
    if (lowerDesc.includes('makan') || lowerDesc.includes('minum') || lowerCat.includes('makanan')) {
      return { icon: <Soup color="#F87171" size={20} />, color: '#F87171' };
    }
    if (lowerDesc.includes('belanja') || lowerDesc.includes('baju') || lowerCat.includes('belanja')) {
      return { icon: <ShoppingBag color="#38BDF8" size={20} />, color: '#38BDF8' };
    }
    if (lowerDesc.includes('transport') || lowerDesc.includes('ojek') || lowerCat.includes('transportasi')) {
      return { icon: <Car color="#2DD4BF" size={20} />, color: '#2DD4BF' };
    }
    if (lowerDesc.includes('hiburan') || lowerDesc.includes('netflix') || lowerCat.includes('hiburan')) {
      return { icon: <Gamepad2 color="#86EFAC" size={20} />, color: '#86EFAC' };
    }
    if (lowerDesc.includes('gaji') || lowerCat.includes('pemasukan')) {
      return { icon: <Wallet color="#4ADE80" size={20} />, color: '#4ADE80' };
    }
    if (lowerDesc.includes('kesehatan') || lowerDesc.includes('obat') || lowerDesc.includes('vitamin') || lowerCat.includes('kesehatan')) {
      return { icon: <Pill color="#F472B6" size={20} />, color: '#F472B6' };
    }
    
    // Fallback
    return isIncome 
      ? { icon: <ArrowDownLeft color="#22C55E" size={20} />, color: '#22C55E' }
      : { icon: <ArrowUpRight color="#EF4444" size={20} />, color: '#EF4444' };
  };

  const isIncome = tx.tipe === 'pemasukan';
  const catStyle = getCategoryStyle(tx.kategori, tx.keterangan, isIncome);

  return (
    <div>
      <div
        className="flex items-center gap-4 py-3.5 group cursor-pointer transition-colors rounded-lg px-1 -mx-1"
        style={{ borderBottom: expanded ? 'none' : undefined }}
        onClick={() => hasActions && setExpanded(prev => !prev)}
      >
        {/* Category icon */}
        <div
          className="w-11 h-11 rounded-[11px] flex items-center justify-center flex-shrink-0"
          style={{
            background: `${catStyle.color}18`,
          }}
        >
          {catStyle.icon}
        </div>

        {/* Description */}
        <div className="flex-1 min-w-0">
          <p className="type-body-strong text-[#1d1d1f] truncate" style={{ fontSize: '15px' }}>
            {tx.keterangan || tx.kategori}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="type-fine" style={{ color: '#7a7a7a' }}>
              {tx.kategori}
            </span>
            <span className="type-fine" style={{ color: '#e0e0e0' }}>·</span>
            <span
              className="flex items-center gap-1 type-fine"
              style={{ color: '#7a7a7a' }}
              title={`Sumber: ${tx.source}`}
            >
              <SourceIcon source={tx.source} />
            </span>
          </div>
        </div>

        {/* Amount + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <p
            className="type-body-strong"
            style={{
              color: tx.tipe === 'pemasukan' ? '#30D158' : '#1d1d1f',
              fontSize: '15px',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {tx.tipe === 'pemasukan' ? '+' : '−'}{formatRupiah(tx.jumlah)}
          </p>
          {hasActions && (
            <ChevronRight
              size={14}
              style={{
                color: '#c0c0c0',
                transform: expanded ? 'rotate(90deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            />
          )}
        </div>
      </div>

      {/* Action Row — slides in when expanded */}
      {expanded && hasActions && (
        <div
          className="flex gap-2 pb-3 pt-1 px-1 animate-slide-up"
        >
          {onEdit && (
            <button
              onClick={e => { e.stopPropagation(); setExpanded(false); onEdit(tx); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(0,102,204,0.1)',
                color: '#0066cc',
              }}
            >
              <Edit3 size={12} /> Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={e => { e.stopPropagation(); handleDelete(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all hover:scale-105 active:scale-95"
              style={{
                background: confirmDelete ? 'rgba(255,59,48,0.15)' : 'rgba(255,59,48,0.08)',
                color: '#FF3B30',
              }}
            >
              <Trash2 size={12} />
              {confirmDelete ? 'Yakin hapus?' : 'Hapus'}
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); setConfirmDelete(false); setExpanded(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold ml-auto transition-all"
            style={{ background: '#f0f0f0', color: '#7a7a7a' }}
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
}

export default function TransactionList({ transactions, loading, onEdit, onDelete }: TransactionListProps) {
  if (loading) {
    return (
      <div className="card-utility">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-[8px] animate-pulse" style={{ background: '#f0f0f0' }} />
          <div className="h-5 w-32 rounded animate-pulse" style={{ background: '#f0f0f0' }} />
        </div>
        {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="card-utility text-center py-12">
        <div className="text-4xl mb-4">💸</div>
        <p className="type-body-strong text-[#1d1d1f] mb-2">Belum ada transaksi</p>
        <p className="type-caption" style={{ color: '#7a7a7a' }}>
          Tekan tombol + di bawah untuk mencatat transaksi pertama Anda.
        </p>
      </div>
    );
  }

  const groups = groupByDate(transactions);

  return (
    <div className="card-utility">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center"
            style={{ background: 'rgba(0,102,204,0.1)' }}>
            <Clock size={16} style={{ color: '#0066cc' }} />
          </div>
          <h3 className="type-body-strong text-[#1d1d1f]">Riwayat Transaksi</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="type-caption" style={{ color: '#7a7a7a' }}>
            {transactions.length} transaksi
          </span>
          {(onEdit || onDelete) && (
            <span
              className="type-fine px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(0,102,204,0.08)', color: '#0066cc', fontSize: '10px', fontWeight: 600 }}
            >
              Ketuk untuk opsi
            </span>
          )}
        </div>
      </div>

      {Object.entries(groups).map(([dateLabel, txs]) => (
        <div key={dateLabel}>
          {/* Date header */}
          <div className="py-2 mb-1">
            <span className="type-caption-strong" style={{ color: '#7a7a7a' }}>
              {dateLabel}
            </span>
          </div>

          {/* Transactions in this date group */}
          {txs.map((tx, idx) => {
            const isLast = idx === txs.length - 1;
            return (
              <div
                key={tx.id}
                style={{ borderBottom: isLast ? 'none' : '1px solid #f5f5f7' }}
              >
                <TransactionRow tx={tx} onEdit={onEdit} onDelete={onDelete} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
