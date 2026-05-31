'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import VoiceModal from '@/components/VoiceModal';
import ScanModal from '@/components/ScanModal';
import ManualModal from '@/components/ManualModal';
import { Transaction } from '@/lib/types';
import { Mic, Camera, Plus, LogOut, BarChart2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleTransactionSaved = (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    // Dispatch a custom event so dashboard page can pick it up
    window.dispatchEvent(new CustomEvent('transaction-added', { detail: tx }));
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f5f5f7' }}>
      {/* ── Main Content ── */}
      <main className="flex-1 pb-24">
        {children}
      </main>

      {/* ── Action Bar ── */}
      <div className="action-bar flex items-center justify-center gap-8 md:gap-10">
        
        {/* Logout button (Bottom Left) */}
        <button
          onClick={handleSignOut}
          className="absolute left-6 md:left-8 flex flex-col items-center gap-1 group"
          title="Keluar"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all group-hover:scale-105 group-active:scale-95"
            style={{ background: '#ffe5e5', color: '#ff3b30' }}>
            <LogOut size={18} />
          </div>
          <span className="type-fine" style={{ color: '#ff3b30', fontSize: '10px' }}>Keluar</span>
        </button>

        {/* Scan button */}
        <button
          onClick={() => setScanOpen(true)}
          className="flex flex-col items-center gap-1 group"
          title="Scan Nota"
        >
          <div className="w-12 h-12 rounded-[14px] flex items-center justify-center transition-all group-hover:scale-105 group-active:scale-95"
            style={{ background: '#f0f0f0', color: '#1d1d1f' }}>
            <Camera size={22} />
          </div>
          <span className="type-fine" style={{ color: '#7a7a7a', fontSize: '10px' }}>Scan</span>
        </button>

        {/* Voice button — center, larger, Action Blue pill */}
        <button
          onClick={() => setVoiceOpen(true)}
          className="flex flex-col items-center gap-1 group"
          title="Rekam Suara"
        >
          <div
            className="w-16 h-16 rounded-pill flex items-center justify-center transition-all group-hover:scale-105 group-active:scale-95 relative"
            style={{ background: '#0066cc', color: 'white', borderRadius: '9999px' }}
          >
            <Mic size={26} />
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-pill animate-pulse-ring opacity-0"
              style={{ background: 'rgba(0,102,204,0.3)', borderRadius: '9999px', animationDuration: '2s', animationDelay: '0.5s' }} />
          </div>
          <span className="type-fine font-semibold" style={{ color: '#0066cc', fontSize: '10px' }}>Suara</span>
        </button>

        {/* Manual button */}
        <button
          onClick={() => setManualOpen(true)}
          className="flex flex-col items-center gap-1 group"
          title="Catat Manual"
        >
          <div className="w-12 h-12 rounded-[14px] flex items-center justify-center transition-all group-hover:scale-105 group-active:scale-95"
            style={{ background: '#f0f0f0', color: '#1d1d1f' }}>
            <Plus size={22} />
          </div>
          <span className="type-fine" style={{ color: '#7a7a7a', fontSize: '10px' }}>Manual</span>
        </button>
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
