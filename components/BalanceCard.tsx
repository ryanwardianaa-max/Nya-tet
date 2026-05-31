'use client';

import { formatRupiah } from '@/lib/types';
import { Wallet } from 'lucide-react';

interface BalanceCardProps {
  saldo: number;
  pemasukan: number;
  pengeluaran: number;
  monthName: string;
  loading?: boolean;
}

export default function BalanceCard({
  saldo, pemasukan, pengeluaran, monthName, loading
}: BalanceCardProps) {
  const isNegative = saldo < 0;

  return (
    <div
      className="relative overflow-hidden rounded-[18px] p-6 md:p-8 mb-4"
      style={{
        background: saldo >= 0
          ? 'linear-gradient(135deg, #1d1d1f 0%, #2a2a2c 100%)'
          : 'linear-gradient(135deg, #2a1a1a 0%, #3a2020 100%)',
        color: 'white',
        boxShadow: 'rgba(0, 0, 0, 0.22) 3px 5px 30px 0px',
      }}
    >
      {/* Decorative orb — subtle depth, not a brand gradient */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #0066cc 0%, transparent 70%)',
          transform: 'translate(30%, -30%)',
        }}
      />

      <div className="relative">
        {/* Label */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)' }}>
            <Wallet size={16} style={{ color: 'rgba(255,255,255,0.8)' }} />
          </div>
          <span className="type-caption" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Total Saldo Keseluruhan
          </span>
        </div>

        {/* Main balance */}
        {loading ? (
          <div className="h-12 w-48 rounded-[8px] animate-pulse mb-2"
            style={{ background: 'rgba(255,255,255,0.1)' }} />
        ) : (
          <h2
            className="font-semibold tracking-tight mb-1"
            style={{
              fontSize: '42px',
              lineHeight: '1.1',
              color: isNegative ? '#FF6B6B' : '#ffffff',
              letterSpacing: '-0.03em',
            }}
          >
            {formatRupiah(Math.abs(saldo))}
          </h2>
        )}

        {isNegative && (
          <p className="type-caption mb-4" style={{ color: '#FF6B6B' }}>
            Pengeluaran melebihi total pemasukan
          </p>
        )}

        {/* Divider */}
        <div className="h-px my-6" style={{ background: 'rgba(255,255,255,0.1)' }} />

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="type-fine mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              ↑ Pemasukan
            </p>
            {loading ? (
              <div className="h-5 w-28 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.1)' }} />
            ) : (
              <p className="type-body-strong" style={{ color: '#30D158' }}>
                {formatRupiah(pemasukan)}
              </p>
            )}
          </div>
          <div>
            <p className="type-fine mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              ↓ Pengeluaran
            </p>
            {loading ? (
              <div className="h-5 w-28 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.1)' }} />
            ) : (
              <p className="type-body-strong" style={{ color: '#FF375F' }}>
                {formatRupiah(pengeluaran)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
