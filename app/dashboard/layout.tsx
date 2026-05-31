'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Home, PieChart, User, Plus, Mic, Camera, FileText, X } from 'lucide-react';
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

  const handleTransactionSaved = (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'> & { created_at?: string }) => {
    window.dispatchEvent(new CustomEvent('transaction-added', { detail: tx }));
  };

  const navItems = [
    { name: 'Beranda', path: '/dashboard/beranda', icon: Home },
    { name: 'Laporan', path: '/dashboard/laporan', icon: PieChart },
  ];

  const navItemsRight = [
    { name: 'Profil', path: '/dashboard/profil', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f5f5f7' }}>
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
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-[#e0e0e0] px-6 py-2 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
        <div className="max-w-[860px] mx-auto flex items-center justify-between relative">
          
          {/* Left Items */}
          <div className="flex gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.path)}
                  className="flex flex-col items-center gap-1 min-w-[60px] py-1"
                >
                  <Icon 
                    size={24} 
                    className={`transition-colors ${isActive ? 'text-[#0066cc]' : 'text-[#7a7a7a]'}`} 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                  <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-[#0066cc]' : 'text-[#7a7a7a]'}`}>
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Center FAB (Floating Action Button) */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-8">
            <button
              onClick={() => setInputMenuOpen(true)}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_8px_20px_rgba(0,102,204,0.4)] transition-transform hover:scale-105 active:scale-95 ${inputMenuOpen ? 'bg-[#1d1d1f] rotate-45' : 'bg-[#0066cc]'}`}
              style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              <Plus size={30} strokeWidth={2.5} />
            </button>
          </div>

          {/* Right Items */}
          <div className="flex gap-8">
            <div className="min-w-[60px]"></div> {/* Spacer to balance FAB */}
            {navItemsRight.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.path)}
                  className="flex flex-col items-center gap-1 min-w-[60px] py-1"
                >
                  <Icon 
                    size={24} 
                    className={`transition-colors ${isActive ? 'text-[#0066cc]' : 'text-[#7a7a7a]'}`} 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                  <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-[#0066cc]' : 'text-[#7a7a7a]'}`}>
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
          
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
