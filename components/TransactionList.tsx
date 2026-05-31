'use client';

import { Transaction, formatRupiah, formatDateShort, getCategoryInfo } from '@/lib/types';
import { Mic, Camera, Pencil, Clock } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
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

export default function TransactionList({ transactions, loading }: TransactionListProps) {
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
          Tekan tombol mikrofon di bawah untuk mencatat pengeluaran pertama Anda.
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
        <span className="type-caption" style={{ color: '#7a7a7a' }}>
          {transactions.length} transaksi
        </span>
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
            const cat = getCategoryInfo(tx.kategori);
            const isLast = idx === txs.length - 1;

            return (
              <div
                key={tx.id}
                className="flex items-center gap-4 py-3.5"
                style={{
                  borderBottom: isLast ? 'none' : `1px solid #f5f5f7`,
                }}
              >
                {/* Category icon */}
                <div
                  className="w-11 h-11 rounded-[11px] flex items-center justify-center text-xl flex-shrink-0"
                  style={{
                    background: `${cat.color}18`,
                    fontSize: '20px',
                  }}
                >
                  {cat.emoji}
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

                {/* Amount */}
                <div className="text-right flex-shrink-0">
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
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
