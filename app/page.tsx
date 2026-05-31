'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Wallet, Sparkles } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        if (data?.session) {
          router.push('/dashboard');
        } else {
          setMessage('Pendaftaran berhasil! Silakan pindah ke tab Masuk.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(msg.includes('credentials') ? 'Email atau kata sandi salah.' : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 relative overflow-hidden"
      style={{ background: '#f8f9fa' }}
    >
      {/* Subtle Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

      {/* Brand */}
      <div className="text-center mb-10 relative z-10">
        <div className="relative w-20 h-20 mx-auto mb-6 group cursor-default">
          {/* Outer glow ring */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0066cc] to-[#3399ff] rounded-[24px] blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
          
          {/* Main Logo Box */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#005bb5] via-[#007aff] to-[#3399ff] rounded-[24px] shadow-[0_8px_32px_rgba(0,102,204,0.4)] flex items-center justify-center overflow-hidden border border-white/20">
            {/* Glass reflection */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>
            
            <Wallet size={36} color="white" strokeWidth={1.5} className="relative z-10 drop-shadow-md" />
            
            {/* Sparkle badge */}
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-sm animate-pulse" style={{ animationDuration: '3s' }}>
              <Sparkles size={14} className="text-white" />
            </div>
          </div>
        </div>

        <h1
          className="font-extrabold tracking-tight"
          style={{ 
            fontSize: '38px', 
            lineHeight: '1.2', 
            letterSpacing: '-0.04em',
            background: 'linear-gradient(135deg, #1d1d1f 0%, #434345 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.05))'
          }}
        >
          Nya-tet
        </h1>
        <p className="mt-2 font-medium" style={{ color: '#7a7a7a', fontSize: '15px', letterSpacing: '-0.01em' }}>
          Catat keuangan, <span className="text-[#0066cc] font-semibold">cukup bicara.</span>
        </p>
      </div>

      {/* Card */}
      <div
        className="w-full relative z-10 shadow-[0_20px_40px_rgba(0,0,0,0.04)] backdrop-blur-xl"
        style={{
          maxWidth: '380px',
          background: 'rgba(255,255,255,0.85)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.5)',
          padding: '32px 28px',
        }}
      >
        {/* Tab */}
        <div
          className="flex rounded-[10px] p-1 mb-6"
          style={{ background: '#f5f5f7' }}
        >
          {(['signin', 'signup'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setMessage(''); }}
              className="flex-1 py-2 rounded-[8px] transition-all duration-200"
              style={{
                fontSize: '14px',
                fontWeight: 500,
                background: mode === m ? '#ffffff' : 'transparent',
                color: mode === m ? '#1d1d1f' : '#7a7a7a',
                boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {m === 'signin' ? 'Masuk' : 'Daftar'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1d1d1f', marginBottom: '6px' }}>
                Nama
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nama lengkap"
                required={mode === 'signup'}
                className="input-field"
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1d1d1f', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1d1d1f', marginBottom: '6px' }}>
              Kata Sandi
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 karakter"
              required
              minLength={8}
              className="input-field"
            />
          </div>

          {error && (
            <div style={{ fontSize: '13px', color: '#FF3B30', background: 'rgba(255,59,48,0.08)', borderRadius: '8px', padding: '10px 14px' }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{ fontSize: '13px', color: '#30D158', background: 'rgba(48,209,88,0.08)', borderRadius: '8px', padding: '10px 14px' }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '4px', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Memproses...' : mode === 'signin' ? 'Masuk' : 'Buat Akun'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#f0f0f0]"></div>
          <span className="text-[12px] text-[#7a7a7a]">atau</span>
          <div className="flex-1 h-px bg-[#f0f0f0]"></div>
        </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="btn-secondary flex items-center justify-center gap-2"
            style={{ width: '100%', background: '#ffffff', border: '1px solid #e0e0e0', color: '#1d1d1f' }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Masuk dengan Google
          </button>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 mb-4">
        <p className="text-[12px] md:text-[13px] text-[#7a7a7a] font-medium">
          © {new Date().getFullYear()} Nya-tet. Dibuat oleh <span className="text-[#1d1d1f]">Ryan Wardiana</span>.
        </p>
        <p className="text-[11px] md:text-[12px] text-[#a1a1a6] mt-1">
          Hak Cipta Dilindungi Undang-Undang.
        </p>
      </div>
    </div>
  );
}
