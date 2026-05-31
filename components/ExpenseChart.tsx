'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { formatRupiah } from '@/lib/types';
import { BarChart2 } from 'lucide-react';

interface ChartEntry {
  name: string;
  emoji: string;
  value: number;
  color: string;
}

interface ExpenseChartProps {
  data: ChartEntry[];
  monthName: string;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartEntry; value: number }> }) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload;
    return (
      <div
        className="rounded-[11px] px-3 py-2"
        style={{
          background: '#1d1d1f',
          color: 'white',
          fontSize: '13px',
          boxShadow: 'rgba(0,0,0,0.3) 0 4px 12px',
        }}
      >
        <p className="font-semibold">{entry.emoji} {entry.name}</p>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
          {formatRupiah(entry.value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function ExpenseChart({ data, monthName }: ExpenseChartProps) {
  return (
    <div className="card-utility">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center"
            style={{ background: 'rgba(0,102,204,0.1)' }}>
            <BarChart2 size={16} style={{ color: '#0066cc' }} />
          </div>
          <div>
            <h3 className="type-body-strong text-[#1d1d1f]">Pengeluaran per Kategori</h3>
            <p className="type-fine" style={{ color: '#7a7a7a' }}>{monthName}</p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10" style={{ background: '#fafafc', borderRadius: '11px', border: '1px dashed #e0e0e0' }}>
          <div className="text-[32px] mb-2 opacity-80">📊</div>
          <p className="type-caption-strong text-[#1d1d1f]">Belum Ada Pengeluaran</p>
          <p className="type-fine text-[#7a7a7a] mt-1 text-center max-w-[200px]">Coba tambahkan transaksi bulan ini agar diagram muncul di sini.</p>
        </div>
      ) : (
        <>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart
                data={data}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                barSize={32}
              >
                <defs>
                  {data.map((entry, index) => (
                    <linearGradient key={`grad-${index}`} id={`colorUv-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={entry.color} stopOpacity={0.9} />
                      <stop offset="95%" stopColor={entry.color} stopOpacity={0.3} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#e0e0e0"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#7a7a7a', fontFamily: 'inherit', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#7a7a7a', fontFamily: 'inherit' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}jt` : v >= 1000 ? `${v / 1000}rb` : `${v}`}
                  width={50}
                  dx={-10}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 8 } as object}
                />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 8, 8]}
                  isAnimationActive={false}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#colorUv-${index})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-6 pt-4" style={{ borderTop: '1px solid #f0f0f0' }}>
            {data.map(entry => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: entry.color, boxShadow: `0 0 8px ${entry.color}40` }}
                />
                <span className="type-fine font-medium" style={{ color: '#1d1d1f' }}>
                  {entry.emoji} {entry.name}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
