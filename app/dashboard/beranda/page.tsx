'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { Transaction, formatRupiah } from '@/lib/types';
import BalanceCard from '@/components/BalanceCard';
import TransactionList from '@/components/TransactionList';
import { TrendingUp, TrendingDown, Calendar as CalendarIcon, Filter } from 'lucide-react';

type DateFilter = 'hari' | 'minggu' | 'bulan' | 'semua' | 'custom';
type TypeFilter = 'all' | 'pemasukan' | 'pengeluaran';

export default function BerandaPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletName, setWalletName] = useState<string>('Beranda');
  
  const [dateFilter, setDateFilter] = useState<DateFilter>('hari');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const supabase = createClient();

  // ── Load dari Supabase ──────────────────────────────
  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.wallet_name) {
        setWalletName(user.user_metadata.wallet_name);
      } else if (user?.user_metadata?.full_name) {
        setWalletName(user.user_metadata.full_name);
      }

      let query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

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

  // Realtime subscription
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

  // ── Listener untuk Transaksi Baru (dari Modal Layout) ──
  useEffect(() => {
    const handleNewTx = async (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      const insertData = user ? { ...detail, user_id: user.id } : { ...detail, user_id: '00000000-0000-0000-0000-000000000000' };

      const { data, error } = await supabase.from('transactions').insert([insertData] as any).select().single();

      if (!error && data) {
        setTransactions(prev => [data, ...prev]);
      } else {
        const fake: Transaction = {
          id: Date.now().toString(),
          user_id: user?.id || 'demo',
          ...detail,
          created_at: new Date().toISOString(),
        };
        setTransactions(prev => [fake, ...prev]);
      }
    };

    window.addEventListener('transaction-added', handleNewTx);
    return () => window.removeEventListener('transaction-added', handleNewTx);
  }, [supabase]);

  // ── Filter Logic ────────────────────────────────────
  const now = new Date();
  
  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      const txDate = new Date(t.created_at);
      
      // Date Filter
      let dateMatch = true;
      if (dateFilter === 'hari') {
        dateMatch = txDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'minggu') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        dateMatch = txDate >= weekAgo;
      } else if (dateFilter === 'bulan') {
        dateMatch = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === 'semua') {
        dateMatch = true;
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

      // Type Filter
      const typeMatch = typeFilter === 'all' || t.tipe === typeFilter;

      return dateMatch && typeMatch;
    });
  };

  const filteredData = getFilteredTransactions();
  const totalPemasukan = filteredData.filter(t => t.tipe === 'pemasukan').reduce((s, t) => s + Number(t.jumlah), 0);
  const totalPengeluaran = filteredData.filter(t => t.tipe === 'pengeluaran').reduce((s, t) => s + Number(t.jumlah), 0);
  
  // Saldo selalu total keseluruhan
  const globalPemasukan = transactions.filter(t => t.tipe === 'pemasukan').reduce((s, t) => s + Number(t.jumlah), 0);
  const globalPengeluaran = transactions.filter(t => t.tipe === 'pengeluaran').reduce((s, t) => s + Number(t.jumlah), 0);
  const globalSaldo = globalPemasukan - globalPengeluaran;

  const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now);

  const toggleTypeFilter = (tipe: TypeFilter) => {
    if (typeFilter === tipe) setTypeFilter('all');
    else setTypeFilter(tipe);
  };

  return (
    <div className="max-w-[860px] mx-auto px-4 md:px-6 py-8 animate-fade-in">
      {/* Greeting */}
      <div className="mb-6">
        <p className="type-caption" style={{ color: '#7a7a7a' }}>
          {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }).format(now)}
        </p>
        <h1 className="type-display-md text-[#1d1d1f] mt-1 capitalize">{walletName}</h1>
      </div>

      {/* Date Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {(['hari', 'minggu', 'bulan', 'semua', 'custom'] as DateFilter[]).map(filter => (
          <button
            key={filter}
            onClick={() => setDateFilter(filter)}
            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all flex items-center gap-2 ${
              dateFilter === filter 
                ? 'bg-[#1d1d1f] text-white shadow-md' 
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

      {/* Balance Card */}
      <BalanceCard
        saldo={globalSaldo}
        pemasukan={totalPemasukan}
        pengeluaran={totalPengeluaran}
        monthName={dateFilter === 'bulan' ? monthName : 'Periode Terpilih'}
        loading={loading}
      />

      {/* Stats Row (Clickable to Filter) */}
      <div className="grid grid-cols-2 gap-4 mt-4 mb-8">
        <button 
          onClick={() => toggleTypeFilter('pemasukan')}
          className={`card-utility text-left transition-all ${typeFilter === 'pemasukan' ? 'ring-2 ring-[#30D158] bg-[rgba(48,209,88,0.05)]' : 'hover:scale-[1.02]'}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ background: 'rgba(48,209,88,0.12)' }}>
              <TrendingUp size={16} style={{ color: '#30D158' }} />
            </div>
            <span className="type-caption" style={{ color: '#7a7a7a' }}>Pemasukan</span>
          </div>
          {loading ? <div className="h-6 w-32 rounded animate-pulse bg-[#f0f0f0]" /> : (
            <p className="type-body-strong" style={{ color: '#30D158', fontSize: '18px' }}>{formatRupiah(totalPemasukan)}</p>
          )}
        </button>

        <button 
          onClick={() => toggleTypeFilter('pengeluaran')}
          className={`card-utility text-left transition-all ${typeFilter === 'pengeluaran' ? 'ring-2 ring-[#FF375F] bg-[rgba(255,55,95,0.05)]' : 'hover:scale-[1.02]'}`}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ background: 'rgba(255,55,95,0.12)' }}>
              <TrendingDown size={16} style={{ color: '#FF375F' }} />
            </div>
            <span className="type-caption" style={{ color: '#7a7a7a' }}>Pengeluaran</span>
          </div>
          {loading ? <div className="h-6 w-32 rounded animate-pulse bg-[#f0f0f0]" /> : (
            <p className="type-body-strong" style={{ color: '#FF375F', fontSize: '18px' }}>{formatRupiah(totalPengeluaran)}</p>
          )}
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="type-body-strong text-[#1d1d1f]">Riwayat Transaksi</h3>
        {typeFilter !== 'all' && (
          <div className="flex items-center gap-1 text-[12px] text-[#0066cc] bg-[rgba(0,102,204,0.1)] px-2 py-1 rounded-full">
            <Filter size={12} /> {typeFilter === 'pemasukan' ? 'Pemasukan Saja' : 'Pengeluaran Saja'}
          </div>
        )}
      </div>

      {/* Transaction List */}
      <TransactionList transactions={filteredData} loading={loading} />
    </div>
  );
}
