'use client';

import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import { formatRupiah } from '@/lib/types';
import { PieChart as PieChartIcon } from 'lucide-react';

interface ChartEntry {
  name: string;
  emoji: string;
  value: number;
  color: string;
}

interface ExpensePieChartProps {
  data: ChartEntry[];
  monthName: string;
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Jangan tampilkan label jika persentasenya terlalu kecil (di bawah 5%)
  if (percent < 0.05) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

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

export default function ExpensePieChart({ data, monthName }: ExpensePieChartProps) {
  return (
    <div className="card-utility">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center"
            style={{ background: 'rgba(0,102,204,0.1)' }}>
            <PieChartIcon size={16} style={{ color: '#0066cc' }} />
          </div>
          <div>
            <h3 className="type-body-strong text-[#1d1d1f]">Persentase Pengeluaran</h3>
            <p className="type-fine" style={{ color: '#7a7a7a' }}>{monthName}</p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10" style={{ background: '#fafafc', borderRadius: '11px', border: '1px dashed #e0e0e0' }}>
          <div className="text-[32px] mb-2 opacity-80">📊</div>
          <p className="type-caption-strong text-[#1d1d1f]">Belum Ada Pengeluaran</p>
        </div>
      ) : (
        <>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
