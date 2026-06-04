'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Home, PieChart, PlusCircle, User, Mic, Camera, FileText, X } from 'lucide-react';
import VoiceModal from '@/components/VoiceModal';
import ScanModal from '@/components/ScanModal';
import ManualModal from '@/components/ManualModal';
import { Transaction } from '@/lib/types';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [inputMenuOpen, setInputMenuOpen] = useState(false);
  
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Gunakan session dari local storage terlebih dahulu (instan)
    // lalu verifikasi ke server di background
    const checkAuth = async () => {
      try {
        // getSession() sangat cepat karena baca local storage, bukan hit server
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/');
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router, supabase]);

  const handleTransactionSaved = (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'> & { created_at?: string }) => {
    window.dispatchEvent(new CustomEvent('transaction-added', { detail: tx }));
  };

  // Tampilkan konten langsung (tidak blokir dengan spinner penuh)
  // Hanya tampilkan shimmer tipis di atas halaman saat auth belum selesai

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f5f5f7' }}>
      {/* ── Loading bar tipis saat auth sedang dicek ── */}
      {isCheckingAuth && (
        <div
          className="fixed top-0 left-0 right-0 z-[100] h-[3px]"
          style={{ background: 'linear-gradient(90deg, #0066cc, #30D158, #0066cc)', backgroundSize: '200% 100%', animation: 'shimmer 1.2s linear infinite' }}
        />
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 pb-24">
        {children}
      </main>

      {/* ── Input Pop-up Menu ── */}
      {inputMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in flex flex-col justify-end"
          onClick={() => setInputMenuOpen(false)}
        >
          <div 
            className="bg-white rounded-t-[32px] p-6 pb-28 animate-slide-up"
            style={{ boxShadow: '0 -10px 40px rgba(0,0,0,0.1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="type-display-md text-[#1d1d1f] text-xl">Tambah Transaksi</h3>
              <button 
                onClick={() => setInputMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#7a7a7a]"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => { setInputMenuOpen(false); setVoiceOpen(true); }}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#0066cc] text-white transition-transform group-hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/30">
                  <Mic size={28} />
                </div>
                <span className="type-body font-medium text-[#1d1d1f]">Suara AI</span>
              </button>
              
              <button
                onClick={() => { setInputMenuOpen(false); setScanOpen(true); }}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#ff9500] text-white transition-transform group-hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/30">
                  <Camera size={28} />
                </div>
                <span className="type-body font-medium text-[#1d1d1f]">Scan Nota</span>
              </button>
              
              <button
                onClick={() => { setInputMenuOpen(false); setManualOpen(true); }}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#30d158] text-white transition-transform group-hover:scale-105 active:scale-95 shadow-lg shadow-green-500/30">
                  <FileText size={28} />
                </div>
                <span className="type-body font-medium text-[#1d1d1f]">Manual</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Navigation Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e0e0e0] px-4 py-2 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
        <div className="max-w-md mx-auto flex items-center justify-between">
          
          <Link
            href="/dashboard/beranda"
            className="flex flex-col items-center gap-1 w-[25%] py-1"
          >
            <Home 
              size={24} 
              className={`transition-colors ${pathname === '/dashboard/beranda' ? 'text-[#0066cc]' : 'text-[#7a7a7a]'}`} 
              strokeWidth={pathname === '/dashboard/beranda' ? 2 : 1.5} 
            />
            <span className={`text-[10px] font-medium transition-colors ${pathname === '/dashboard/beranda' ? 'text-[#0066cc]' : 'text-[#7a7a7a]'}`}>
              Beranda
            </span>
          </Link>

          <Link
            href="/dashboard/laporan"
            className="flex flex-col items-center gap-1 w-[25%] py-1"
          >
            <PieChart 
              size={24} 
              className={`transition-colors ${pathname === '/dashboard/laporan' ? 'text-[#0066cc]' : 'text-[#7a7a7a]'}`} 
              strokeWidth={pathname === '/dashboard/laporan' ? 2 : 1.5} 
            />
            <span className={`text-[10px] font-medium transition-colors ${pathname === '/dashboard/laporan' ? 'text-[#0066cc]' : 'text-[#7a7a7a]'}`}>
              Laporan
            </span>
          </Link>

          <button
            onClick={() => setInputMenuOpen(true)}
            className="flex flex-col items-center gap-1 w-[25%] py-1 outline-none"
          >
            <PlusCircle 
              size={24} 
              className={`transition-colors ${inputMenuOpen ? 'text-[#0066cc]' : 'text-[#7a7a7a]'}`} 
              strokeWidth={inputMenuOpen ? 2 : 1.5} 
            />
            <span className={`text-[10px] font-medium transition-colors ${inputMenuOpen ? 'text-[#0066cc]' : 'text-[#7a7a7a]'}`}>
              Catat
            </span>
          </button>

          <Link
            href="/dashboard/profil"
            className="flex flex-col items-center gap-1 w-[25%] py-1"
          >
            <User 
              size={24} 
              className={`transition-colors ${pathname === '/dashboard/profil' ? 'text-[#0066cc]' : 'text-[#7a7a7a]'}`} 
              strokeWidth={pathname === '/dashboard/profil' ? 2 : 1.5} 
            />
            <span className={`text-[10px] font-medium transition-colors ${pathname === '/dashboard/profil' ? 'text-[#0066cc]' : 'text-[#7a7a7a]'}`}>
              Profil
            </span>
          </Link>
          
        </div>
      </div>

      {/* ── Modals ── */}
      {voiceOpen && (
        <VoiceModal
          onClose={() => setVoiceOpen(false)}
          onSaved={handleTransactionSaved}
        />
      )}
      {scanOpen && (
        <ScanModal
          onClose={() => setScanOpen(false)}
          onSaved={handleTransactionSaved}
        />
      )}
      {manualOpen && (
        <ManualModal
          onClose={() => setManualOpen(false)}
          onSaved={handleTransactionSaved}
        />
      )}
    </div>
  );
}
