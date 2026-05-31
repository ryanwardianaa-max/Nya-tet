'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        setMessage('Cek email Anda untuk konfirmasi akun.');
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
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: '#f5f5f7' }}
    >
      {/* Brand */}
      <div className="text-center mb-10">
        <div
          className="w-14 h-14 rounded-[16px] flex items-center justify-center mx-auto mb-5"
          style={{ background: '#0066cc' }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
            <path d="M8 7h6" />
            <path d="M8 11h8" />
            <path d="M8 15h6" />
            <path d="M17.5 4.5l2 2-6.5 6.5-2 .5.5-2 6.5-6.5z" />
          </svg>
        </div>
        <h1
          className="font-semibold tracking-tight text-[#1d1d1f]"
          style={{ fontSize: '32px', lineHeight: '1.1', letterSpacing: '-0.03em' }}
        >
          Nya-tet
        </h1>
        <p style={{ color: '#7a7a7a', fontSize: '15px', marginTop: '6px' }}>
          Catat keuangan, cukup bicara.
        </p>
      </div>

      {/* Card */}
      <div
        className="w-full"
        style={{
          maxWidth: '380px',
          background: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #e0e0e0',
          padding: '28px 24px',
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
