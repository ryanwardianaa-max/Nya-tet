'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { LogOut, Trash2, Shield, Info, X, AlertTriangle } from 'lucide-react';

export default function ProfilPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleResetData = async () => {
    try {
      setIsResetting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      
      alert('Semua data transaksi berhasil dihapus permanen.');
      setShowResetConfirm(false);
    } catch (err) {
      console.error(err);
      alert('Gagal mereset data.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-[860px] mx-auto px-4 md:px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="type-display-md text-[#1d1d1f]">Profil Akun</h1>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-[24px] p-6 mb-8 border border-[#e0e0e0] flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#0066cc] flex items-center justify-center text-white text-2xl font-semibold shadow-md">
          {email ? email.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <p className="type-body-strong text-[#1d1d1f] text-lg">Pengguna Nya-tet</p>
          <p className="type-caption text-[#7a7a7a]">{email || 'Memuat...'}</p>
        </div>
      </div>

      {/* Menus */}
      <div className="bg-white rounded-[24px] border border-[#e0e0e0] overflow-hidden mb-8">
        <button 
          onClick={() => setShowAbout(true)}
          className="w-full flex items-center gap-4 p-5 text-left border-b border-[#f0f0f0] hover:bg-[#fafafc] transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#1d1d1f]">
            <Info size={20} />
          </div>
          <div>
            <p className="type-body-strong text-[#1d1d1f]">Tentang Nya-tet</p>
            <p className="text-[12px] text-[#7a7a7a]">Informasi versi dan developer</p>
          </div>
        </button>

        <button 
          onClick={() => setShowPrivacy(true)}
          className="w-full flex items-center gap-4 p-5 text-left border-b border-[#f0f0f0] hover:bg-[#fafafc] transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#1d1d1f]">
            <Shield size={20} />
          </div>
          <div>
            <p className="type-body-strong text-[#1d1d1f]">Kebijakan Privasi</p>
            <p className="text-[12px] text-[#7a7a7a]">Keamanan data dan database</p>
          </div>
        </button>

        <button 
          onClick={() => setShowResetConfirm(true)}
          className="w-full flex items-center gap-4 p-5 text-left hover:bg-[#fafafc] transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-[rgba(255,59,48,0.1)] flex items-center justify-center text-[#ff3b30]">
            <Trash2 size={20} />
          </div>
          <div>
            <p className="type-body-strong text-[#ff3b30]">Reset Data</p>
            <p className="text-[12px] text-[#7a7a7a]">Hapus seluruh transaksi akun ini</p>
          </div>
        </button>
      </div>

      <button 
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 p-4 rounded-[18px] bg-white border border-[#e0e0e0] text-[#ff3b30] font-semibold hover:bg-[#fafafc] transition-colors"
      >
        <LogOut size={20} /> Keluar
      </button>

      {/* ── Modals ── */}
      
      {/* Reset Confirm Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowResetConfirm(false)}>
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-[rgba(255,59,48,0.1)] flex items-center justify-center text-[#ff3b30] mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="type-display-md text-center mb-2">Peringatan Bahaya</h3>
            <p className="type-body text-center text-[#7a7a7a] mb-6">
              Anda yakin ingin mereset data? <strong>Seluruh riwayat transaksi Anda akan dihapus secara permanen dari database</strong> dan tidak dapat dikembalikan lagi.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleResetData}
                disabled={isResetting}
                className="w-full p-4 rounded-[14px] bg-[#ff3b30] text-white font-semibold flex justify-center items-center"
              >
                {isResetting ? 'Menghapus...' : 'Ya, Hapus Semua Data'}
              </button>
              <button 
                onClick={() => setShowResetConfirm(false)}
                className="w-full p-4 rounded-[14px] bg-[#f0f0f0] text-[#1d1d1f] font-semibold"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 animate-fade-in" onClick={() => setShowPrivacy(false)}>
          <div className="bg-white rounded-t-[24px] sm:rounded-[24px] p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-slide-up sm:animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="type-display-md">Kebijakan Privasi</h3>
              <button onClick={() => setShowPrivacy(false)} className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#7a7a7a]"><X size={18} /></button>
            </div>
            <div className="prose prose-sm text-[#333]">
              <p>Keamanan data Anda adalah prioritas kami.</p>
              <h4>1. Penyimpanan Data</h4>
              <p>Semua data transaksi Anda disimpan secara aman di cloud database menggunakan <strong>Supabase</strong> (arsitektur PostgreSQL). Data Anda tersimpan di server terenkripsi dengan standar internasional.</p>
              <h4>2. Keamanan Berlapis (RLS)</h4>
              <p>Database Nya-tet dilengkapi dengan fitur <em>Row Level Security (RLS)</em>, yang memastikan bahwa setiap pengguna hanya dapat melihat dan mengubah datanya sendiri. Mustahil bagi pengguna lain untuk mengakses catatan keuangan Anda.</p>
              <h4>3. Login Google Oauth 2.0</h4>
              <p>Kami menggunakan layanan autentikasi Google resmi. Aplikasi Nya-tet tidak pernah melihat atau menyimpan kata sandi (password) email Anda.</p>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 animate-fade-in" onClick={() => setShowAbout(false)}>
          <div className="bg-white rounded-t-[24px] sm:rounded-[24px] p-6 max-w-lg w-full animate-slide-up sm:animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="type-display-md">Tentang Nya-tet</h3>
              <button onClick={() => setShowAbout(false)} className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#7a7a7a]"><X size={18} /></button>
            </div>
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-[20px] bg-[#0066cc] flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-500/30">
                <span className="text-2xl font-bold">N</span>
              </div>
              <h4 className="type-display-md text-xl">Nya-tet</h4>
              <p className="text-[#7a7a7a] text-sm">Versi 1.1.0</p>
            </div>
            <p className="text-center text-[#333] mb-6">
              Aplikasi pencatatan keuangan cerdas berbasis Artificial Intelligence.
              Didukung oleh model bahasa <strong>Google Gemini 1.5 Flash</strong> untuk menerjemahkan ucapan suara dan gambar struk belanja menjadi data transaksi keuangan terstruktur.
            </p>
            <div className="p-4 bg-[#f5f5f7] rounded-[16px] text-center">
              <p className="text-sm font-medium text-[#1d1d1f]">Dikembangkan untuk kemudahan mengatur finansial sehari-hari.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
