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
          <div className="bg-white rounded-t-[24px] sm:rounded-[24px] p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto animate-slide-up sm:animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 py-2">
              <h3 className="type-display-md">Kebijakan Privasi</h3>
              <button onClick={() => setShowPrivacy(false)} className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#7a7a7a]"><X size={18} /></button>
            </div>
            <div className="prose prose-sm text-[#333] pb-8">
              <p className="mb-4">Terakhir diperbarui: 31 Mei 2026. Keamanan privasi dan data finansial Anda adalah prioritas utama dan komitmen kami di Nya-tet.</p>
              
              <h4 className="font-semibold text-base mt-5 mb-2 text-[#1d1d1f]">1. Pengumpulan dan Penyimpanan Data</h4>
              <p className="mb-3 text-justify">Kami mengumpulkan informasi yang Anda masukkan secara langsung ke dalam aplikasi, yaitu data nominal transaksi, keterangan, dan kategori pengeluaran/pemasukan. Semua data ini disimpan secara aman di cloud database menggunakan <strong>Supabase (arsitektur PostgreSQL)</strong>. Data tersebut terenkripsi pada saat transit dan pada saat istirahat (<em>encryption at rest</em>) dengan standar internasional AES-256.</p>
              
              <h4 className="font-semibold text-base mt-5 mb-2 text-[#1d1d1f]">2. Keamanan Tingkat Lanjut (Row Level Security)</h4>
              <p className="mb-3 text-justify">Database Nya-tet dilengkapi dengan fitur keamanan <em>Row Level Security (RLS)</em> yang sangat ketat. Kebijakan RLS ini menjamin bahwa setiap sesi pengguna hanya dapat membaca, menulis, atau memodifikasi baris data yang secara kriptografis terikat dengan ID pengguna otentik mereka. Mustahil secara teknis bagi pengguna lain, atau bahkan celah eksploitasi, untuk mengakses catatan keuangan Anda tanpa otorisasi langsung dari sesi login Anda.</p>
              
              <h4 className="font-semibold text-base mt-5 mb-2 text-[#1d1d1f]">3. Autentikasi Menggunakan Akun Google</h4>
              <p className="mb-3 text-justify">Untuk menghindari risiko kebocoran kata sandi, Nya-tet menggunakan layanan autentikasi standar industri <strong>OAuth 2.0 yang dikelola langsung oleh Google</strong>. Nya-tet tidak pernah meminta, melihat, mencegat, ataupun menyimpan kata sandi (password) email Anda. Semua proses validasi identitas dilakukan di server Google, dan Nya-tet hanya menerima token akses yang aman.</p>

              <h4 className="font-semibold text-base mt-5 mb-2 text-[#1d1d1f]">4. Pemrosesan Data oleh Artificial Intelligence</h4>
              <p className="mb-3 text-justify">Saat Anda menggunakan fitur "Scan Nota" atau "Suara AI", gambar dan suara Anda dikirim secara anonim melalui koneksi HTTPS yang aman ke server <strong>Google Gemini AI</strong> untuk diproses menjadi teks terstruktur. Data gambar atau suara Anda hanya digunakan seketika untuk ekstraksi data (OCR) dan <strong>tidak disimpan</strong>, tidak dilatih (<em>not trained on</em>), dan tidak digunakan untuk tujuan periklanan oleh sistem AI kami.</p>

              <h4 className="font-semibold text-base mt-5 mb-2 text-[#1d1d1f]">5. Hak Anda (Penghapusan Data)</h4>
              <p className="mb-3 text-justify">Anda memiliki kontrol penuh atas data Anda. Melalui menu "Reset Data" di halaman profil ini, Anda kapan saja berhak memicu perintah penghapusan (<em>hard delete</em>). Sekali Anda mengonfirmasi penghapusan, seluruh riwayat transaksi Anda akan dimusnahkan secara permanen dari tabel server tanpa ada salinan yang tertinggal untuk dipulihkan.</p>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 animate-fade-in" onClick={() => setShowAbout(false)}>
          <div className="bg-white rounded-t-[24px] sm:rounded-[24px] p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto animate-slide-up sm:animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 py-2">
              <h3 className="type-display-md">Tentang Nya-tet</h3>
              <button onClick={() => setShowAbout(false)} className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[#7a7a7a]"><X size={18} /></button>
            </div>
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-[20px] bg-[#0066cc] flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-500/30">
                <span className="text-2xl font-bold">N</span>
              </div>
              <h4 className="type-display-md text-xl">Nya-tet AI Tracker</h4>
              <p className="text-[#7a7a7a] text-sm mt-1">Versi 2.0.0 (Build 2026.5)</p>
            </div>
            
            <div className="text-sm text-[#333] space-y-4 text-justify pb-4">
              <p>
                <strong>Nya-tet</strong> adalah aplikasi pencatatan keuangan generasi terbaru yang merevolusi cara Anda mengatur pengeluaran dan pemasukan finansial sehari-hari. Berbeda dengan aplikasi pembukuan tradisional yang memaksa Anda mengetik data secara manual setiap kali berbelanja, Nya-tet dirancang khusus untuk memahami konteks manusia dengan cepat.
              </p>
              
              <p>
                Ditenagai oleh teknologi model bahasa cerdas <strong>Google Gemini 1.5 Flash</strong>, fitur unggulan aplikasi ini memungkinkan Anda cukup mengambil foto struk belanja yang lecek sekalipun, atau menekan tombol rekam suara dan berbicara seperti: <em>"Habis 50 ribu buat beli kopi susu di cafe depan."</em> AI kami akan secara instan mengonversinya menjadi pencatatan terstruktur yang otomatis mendeteksi nominal harga, kategori (Makanan/Transportasi/Belanja), dan tanggal transaksi secara cerdas tanpa campur tangan Anda sedikitpun.
              </p>

              <div className="p-4 bg-[#f5f5f7] rounded-[16px] text-center my-6">
                <p className="font-medium text-[#1d1d1f] mb-1">Diciptakan dengan cinta dan kecerdasan 💻🤖</p>
                <p className="text-xs text-[#7a7a7a]">Dikembangkan oleh <strong>Ryan Wardiana</strong></p>
              </div>

              <p>
                Kami percaya bahwa mengatur uang tidak seharusnya menjadi beban. Dengan fitur pelaporan yang interaktif, dukungan integrasi ekspor PDF dan Microsoft Excel, hingga kemampuan membagikan rekapitulasi ringkas secara otomatis melalui WhatsApp, Nya-tet bertujuan agar Anda dapat mengambil kembali kendali penuh atas kesejahteraan finansial Anda.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
