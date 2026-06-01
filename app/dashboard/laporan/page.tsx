'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { Transaction, formatRupiah, CATEGORIES } from '@/lib/types';
import dynamic from 'next/dynamic';
import { Download, Calendar as CalendarIcon, Share2 } from 'lucide-react';

const ExpenseChart = dynamic(() => import('@/components/ExpenseChart'), { ssr: false });
const ExpensePieChart = dynamic(() => import('@/components/ExpensePieChart'), { ssr: false });

type DateFilter = 'hari' | 'minggu' | 'bulan' | 'custom';

export default function LaporanPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  const [dateFilter, setDateFilter] = useState<DateFilter>('hari');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const supabase = createClient();

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let query = supabase.from('transactions').select('*').order('created_at', { ascending: false });
      if (user) query = query.eq('user_id', user.id);
      const { data, error } = await query;
      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const now = new Date();
  
  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      const txDate = new Date(t.created_at);
      let dateMatch = true;
      if (dateFilter === 'hari') {
        dateMatch = txDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'minggu') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        dateMatch = txDate >= weekAgo;
      } else if (dateFilter === 'bulan') {
        dateMatch = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === 'custom') {
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          dateMatch = txDate >= start && txDate <= end;
        } else if (customStartDate) {
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);
          dateMatch = txDate >= start;
        } else if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          dateMatch = txDate <= end;
        }
      }
      return dateMatch;
    });
  };

  const filteredData = getFilteredTransactions();
  const totalPemasukan = filteredData.filter(t => t.tipe === 'pemasukan').reduce((s, t) => s + Number(t.jumlah), 0);
  const totalPengeluaran = filteredData.filter(t => t.tipe === 'pengeluaran').reduce((s, t) => s + Number(t.jumlah), 0);
  
  const globalPemasukan = transactions.filter(t => t.tipe === 'pemasukan').reduce((s, t) => s + Number(t.jumlah), 0);
  const globalPengeluaran = transactions.filter(t => t.tipe === 'pengeluaran').reduce((s, t) => s + Number(t.jumlah), 0);
  const globalSaldo = globalPemasukan - globalPengeluaran;

  const categoryData = CATEGORIES
    .filter(c => c.id !== 'Pemasukan' && c.id !== 'Transfer')
    .map(cat => ({
      name: cat.id,
      emoji: cat.emoji,
      value: filteredData.filter(t => t.tipe === 'pengeluaran' && (t.kategori || '').toLowerCase() === cat.id.toLowerCase()).reduce((s, t) => s + Number(t.jumlah), 0),
      color: cat.color,
    }))
    .filter(c => c.value > 0)
    .sort((a, b) => b.value - a.value);

  const getPeriodeString = () => {
    if (dateFilter === 'hari') return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(now);
    if (dateFilter === 'minggu') return '7 Hari Terakhir';
    if (dateFilter === 'bulan') return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now);
    if (dateFilter === 'custom') return `${customStartDate || '?'} s/d ${customEndDate || '?'}`;
    return '';
  };
  
  const periodeStr = getPeriodeString();

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      let chartImage = undefined;
      const chartEl = document.getElementById('expense-chart-container');
      if (chartEl) {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(chartEl, { scale: 2, backgroundColor: '#ffffff' });
        chartImage = canvas.toDataURL('image/png');
      }
      
      const { exportToExcel } = await import('@/lib/excel');
      await exportToExcel(filteredData, periodeStr, chartImage);
    } catch (err) {
      console.error(err);
      alert('Gagal mengekspor laporan Excel.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const { exportToPDF } = await import('@/lib/pdf');
      await exportToPDF(filteredData, periodeStr, 'expense-chart-container');
    } catch (err) {
      console.error(err);
      alert('Gagal mengekspor laporan PDF.');
    } finally {
      setExporting(false);
    }
  };

  const handleShareWA = () => {
    // Rangkum kategori
    const categoryText = categoryData.map(c => `  • ${c.emoji} ${c.name}: ${formatRupiah(c.value)}`).join('\n');

    // Rangkum transaksi per tanggal
    const txByDate: Record<string, Transaction[]> = {};
    filteredData.forEach(t => {
      const date = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(t.created_at));
      if (!txByDate[date]) txByDate[date] = [];
      txByDate[date].push(t);
    });

    let detailTx = '';
    Object.keys(txByDate).slice(0, 10).forEach(date => { // Batasi 10 hari terakhir agar tidak terlalu panjang
      detailTx += `\n📅 *${date}*\n`;
      txByDate[date].forEach(t => {
        const icon = t.tipe === 'pemasukan' ? '🟢' : '🔴';
        const nominal = t.tipe === 'pemasukan' ? `+${formatRupiah(Number(t.jumlah))}` : `-${formatRupiah(Number(t.jumlah))}`;
        detailTx += `${icon} ${t.keterangan || t.kategori} (${nominal})\n`;
      });
    });

    const text = `📊 *Laporan Keuangan Nya-tet* 📊
Periode: ${periodeStr}

💰 *Ringkasan:*
Pemasukan  : ${formatRupiah(totalPemasukan)}
Pengeluaran: ${formatRupiah(totalPengeluaran)}
*Total Saldo Keseluruhan : ${formatRupiah(globalSaldo)}*

📉 *Rincian Pengeluaran:*
${categoryText || '  (Belum ada pengeluaran)'}

📝 *Detail Transaksi Terbaru:*${detailTx}

_Dibuat otomatis oleh Nya-tet App_ 🚀`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  return (
    <div className="max-w-[860px] mx-auto px-4 md:px-6 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="type-display-md text-[#1d1d1f]">Laporan Analisis</h1>
        <p className="type-caption mt-1" style={{ color: '#7a7a7a' }}>Pantau kesehatan keuangan Anda</p>
      </div>

      {/* Date Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {(['hari', 'minggu', 'bulan', 'custom'] as DateFilter[]).map(filter => (
          <button
            key={filter}
            onClick={() => setDateFilter(filter)}
            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all flex items-center gap-2 ${
              dateFilter === filter 
                ? 'bg-[#0066cc] text-white shadow-md' 
                : 'bg-white text-[#7a7a7a] border border-[#e0e0e0] hover:bg-[#f0f0f0]'
            }`}
          >
            {filter === 'custom' && <CalendarIcon size={14} />}
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Custom Date Picker */}
      {dateFilter === 'custom' && (
        <div className="flex items-center gap-3 mb-6 p-4 bg-white rounded-2xl border border-[#e0e0e0] animate-slide-up shadow-sm">
          <div className="flex flex-col flex-1">
            <label className="text-[11px] font-semibold text-[#7a7a7a] uppercase tracking-wider mb-1">Mulai Dari</label>
            <input 
              type="date" 
              value={customStartDate} 
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="w-full bg-[#f5f5f7] rounded-[10px] p-2 text-[14px] text-[#1d1d1f] border border-[#e0e0e0] outline-none focus:border-[#0066cc]"
            />
          </div>
          <span className="text-[#7a7a7a] font-medium mt-4">-</span>
          <div className="flex flex-col flex-1">
            <label className="text-[11px] font-semibold text-[#7a7a7a] uppercase tracking-wider mb-1">Sampai</label>
            <input 
              type="date" 
              value={customEndDate} 
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="w-full bg-[#f5f5f7] rounded-[10px] p-2 text-[14px] text-[#1d1d1f] border border-[#e0e0e0] outline-none focus:border-[#0066cc]"
            />
          </div>
        </div>
      )}

      {/* Ringkasan Laba */}
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-[#e0e0e0] mb-8">
        <h3 className="type-body-strong text-[#7a7a7a] mb-4">Ringkasan {periodeStr}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-[12px] text-[#7a7a7a] mb-1">Pemasukan</p>
            <p className="text-[16px] font-semibold text-[#30D158]">{formatRupiah(totalPemasukan)}</p>
          </div>
          <div>
            <p className="text-[12px] text-[#7a7a7a] mb-1">Pengeluaran</p>
            <p className="text-[16px] font-semibold text-[#FF375F]">{formatRupiah(totalPengeluaran)}</p>
          </div>
          <div className="col-span-2 md:col-span-1 pt-4 md:pt-0 md:border-l md:border-[#f0f0f0] md:pl-4 mt-4 md:mt-0 border-t border-[#f0f0f0] md:border-t-0">
            <p className="text-[12px] text-[#7a7a7a] mb-1">Total Saldo Keseluruhan</p>
            <p className={`text-[20px] font-bold ${globalSaldo >= 0 ? 'text-[#1d1d1f]' : 'text-[#FF375F]'}`}>
              {formatRupiah(globalSaldo)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      {!loading && categoryData.length > 0 && (
        <div id="expense-chart-container" className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-4 rounded-[24px] border border-[#e0e0e0]">
            <ExpenseChart data={categoryData} monthName={periodeStr} />
          </div>
          <div className="bg-white p-4 rounded-[24px] border border-[#e0e0e0]">
            <ExpensePieChart data={categoryData} monthName={periodeStr} />
          </div>
        </div>
      )}

      {!loading && categoryData.length === 0 && (
        <div className="text-center py-12 text-[#7a7a7a]">
          <p>Belum ada pengeluaran pada periode ini.</p>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        <button
          onClick={handleExportExcel}
          disabled={exporting || loading}
          className="btn-secondary flex flex-col items-center justify-center gap-1 h-auto py-3 px-2 bg-white"
        >
          <Download size={20} className="mb-1" />
          <span className="text-[11px]">Excel</span>
        </button>
        <button
          onClick={handleExportPDF}
          disabled={exporting || loading}
          className="btn-secondary flex flex-col items-center justify-center gap-1 h-auto py-3 px-2 bg-white"
        >
          <Download size={20} className="mb-1" />
          <span className="text-[11px]">PDF</span>
        </button>
        <button
          onClick={handleShareWA}
          className="flex flex-col items-center justify-center gap-1 h-auto py-3 px-2 rounded-[11px] font-medium transition-all"
          style={{ background: '#25D366', color: 'white' }}
        >
          <Share2 size={20} className="mb-1" />
          <span className="text-[11px]">Bagikan WA</span>
        </button>
      </div>

    </div>
  );
}
