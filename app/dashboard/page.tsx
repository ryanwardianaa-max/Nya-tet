'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { Transaction, formatRupiah, CATEGORIES } from '@/lib/types';
import BalanceCard from '@/components/BalanceCard';
import ExpenseChart from '@/components/ExpenseChart';
import TransactionList from '@/components/TransactionList';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { exportToExcel } from '@/lib/excel';

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const supabase = createClient();

  // ── Load dari Supabase ──────────────────────────────
  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

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

  // ── Simpan transaksi baru dari modal ────────────────
  useEffect(() => {
    const handleNewTx = async (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();

        const insertData = user
          ? { ...detail, user_id: user.id }
          : { ...detail, user_id: '00000000-0000-0000-0000-000000000000' };

        const { data, error } = await supabase
          .from('transactions')
          .insert([insertData])
          .select()
          .single();

        if (!error && data) {
          setTransactions(prev => [data, ...prev]);
        } else {
          console.warn('Simpan ke database ditolak (mode demo):', error?.message);
          const fake: Transaction = {
            id: Date.now().toString(),
            user_id: user?.id || 'demo',
            ...detail,
            created_at: new Date().toISOString(),
          };
          setTransactions(prev => [fake, ...prev]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener('transaction-added', handleNewTx);
    return () => window.removeEventListener('transaction-added', handleNewTx);
  }, [supabase]);

  // ── Realtime subscription ───────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('db-transactions')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions' },
        (payload) => {
          setTransactions(prev => {
            if (prev.find(t => t.id === payload.new.id)) return prev;
            return [payload.new as Transaction, ...prev];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthTx = transactions.filter(t => new Date(t.created_at) >= startOfMonth);

  const totalPemasukan = thisMonthTx.filter(t => t.tipe === 'pemasukan').reduce((s, t) => s + Number(t.jumlah), 0);
  const totalPengeluaran = thisMonthTx.filter(t => t.tipe === 'pengeluaran').reduce((s, t) => s + Number(t.jumlah), 0);
  const saldo = totalPemasukan - totalPengeluaran;

  const categoryData = CATEGORIES
    .filter(c => c.id !== 'Pemasukan' && c.id !== 'Transfer')
    .map(cat => ({
      name: cat.id,
      emoji: cat.emoji,
      value: thisMonthTx.filter(t => t.tipe === 'pengeluaran' && (t.kategori || '').toLowerCase() === cat.id.toLowerCase()).reduce((s, t) => s + Number(t.jumlah), 0),
      color: cat.color,
    }))
    .filter(c => c.value > 0)
    .sort((a, b) => b.value - a.value);

  const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now);

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      await exportToExcel(transactions, monthName);
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
      await exportToPDF(transactions, monthName, 'expense-chart-container');
    } catch (err) {
      console.error(err);
      alert('Gagal mengekspor laporan PDF.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-[860px] mx-auto px-4 md:px-6 py-8">
      {/* Greeting */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="type-caption" style={{ color: '#7a7a7a' }}>
            {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }).format(now)}
          </p>
          <h1 className="type-display-md text-[#1d1d1f] mt-1">Ringkasan Keuangan</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={exporting || loading}
            className="btn-secondary flex items-center gap-2"
            style={{ padding: '8px 14px', height: 'auto', fontSize: '13px' }}
          >
            <Download size={14} />
            Excel
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting || loading}
            className="btn-primary flex items-center gap-2"
            style={{ padding: '8px 14px', height: 'auto', fontSize: '13px' }}
          >
            <Download size={14} />
            PDF
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <BalanceCard
        saldo={saldo}
        pemasukan={totalPemasukan}
        pengeluaran={totalPengeluaran}
        monthName={monthName}
        loading={loading}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mt-4 mb-8">
        <div className="card-utility">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-[8px] flex items-center justify-center"
              style={{ background: 'rgba(48,209,88,0.12)' }}>
              <TrendingUp size={16} style={{ color: '#30D158' }} />
            </div>
            <span className="type-caption" style={{ color: '#7a7a7a' }}>Pemasukan</span>
          </div>
          {loading
            ? <div className="h-6 w-32 rounded animate-pulse" style={{ background: '#f0f0f0' }} />
            : <p className="type-body-strong" style={{ color: '#30D158', fontSize: '18px' }}>{formatRupiah(totalPemasukan)}</p>
          }
        </div>
        <div className="card-utility">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-[8px] flex items-center justify-center"
              style={{ background: 'rgba(255,55,95,0.12)' }}>
              <TrendingDown size={16} style={{ color: '#FF375F' }} />
            </div>
            <span className="type-caption" style={{ color: '#7a7a7a' }}>Pengeluaran</span>
          </div>
          {loading
            ? <div className="h-6 w-32 rounded animate-pulse" style={{ background: '#f0f0f0' }} />
            : <p className="type-body-strong" style={{ color: '#FF375F', fontSize: '18px' }}>{formatRupiah(totalPengeluaran)}</p>
          }
        </div>
      </div>

      {/* Chart */}
      {!loading && (
        <div id="expense-chart-container" className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <ExpenseChart data={categoryData} monthName={monthName} />
        </div>
      )}

      {/* Transaction List */}
      <TransactionList transactions={transactions} loading={loading} />
    </div>
  );
}
