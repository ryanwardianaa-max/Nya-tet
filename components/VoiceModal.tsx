'use client';

import { useState, useRef, useEffect } from 'react';
import { AIVoiceResult, Transaction, CATEGORIES } from '@/lib/types';
import { Mic, MicOff, X, Check } from 'lucide-react';
import ConfirmCard from './ConfirmCard';

interface VoiceModalProps {
  onClose: () => void;
  onSaved: (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => void;
}

type ModalState = 'idle' | 'recording' | 'processing' | 'confirm' | 'saved';

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function VoiceModal({ onClose, onSaved }: VoiceModalProps) {
  const [state, setState] = useState<ModalState>('idle');
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<AIVoiceResult | null>(null);
  const [error, setError] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startRecording = () => {
    setError('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Browser Anda tidak mendukung pengenalan suara. Gunakan Chrome atau Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onstart = () => setState('recording');
    recognition.onresult = (event) => {
      const t = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      setTranscript(t);
    };
    recognition.onerror = () => {
      setError('Gagal merekam suara. Coba lagi.');
      setState('idle');
    };
    recognition.onend = async () => {
      if (transcript || recognitionRef.current) {
        await processTranscript(transcript);
      }
    };

    recognition.start();
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
  };

  const processTranscript = async (text: string) => {
    if (!text.trim()) {
      setState('idle');
      return;
    }

    setState('processing');
    try {
      const res = await fetch('/api/ai/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setState('confirm');
    } catch {
      setError('Gagal memproses suara. Coba lagi.');
      setState('idle');
    }
  };

  const handleManualTranscript = async () => {
    if (transcript.trim()) {
      await processTranscript(transcript);
    }
  };

  const handleSave = () => {
    if (!result) return;
    onSaved({
      jumlah: result.jumlah,
      tipe: result.tipe,
      kategori: result.kategori,
      keterangan: result.keterangan,
      source: 'voice',
    });
    setState('saved');
    setTimeout(onClose, 1000);
  };

  const handleRetry = () => {
    setTranscript('');
    setResult(null);
    setError('');
    setState('idle');
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-sheet">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="type-display-md text-[#1d1d1f]" style={{ fontSize: '22px' }}>
              {state === 'confirm' ? 'Konfirmasi Transaksi' : 'Catat via Suara'}
            </h2>
            <p className="type-caption mt-1" style={{ color: '#7a7a7a' }}>
              {state === 'idle' && 'Ucapkan pengeluaran Anda'}
              {state === 'recording' && 'Sedang merekam...'}
              {state === 'processing' && 'AI sedang menganalisis...'}
              {state === 'confirm' && 'Periksa dan simpan transaksi'}
              {state === 'saved' && 'Transaksi tersimpan!'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-icon-chip"
            style={{ background: '#f5f5f7', color: '#1d1d1f' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Saved State */}
        {state === 'saved' && (
          <div className="text-center py-12 animate-scale-in">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(48, 209, 88, 0.15)' }}>
              <Check size={28} style={{ color: '#30D158' }} />
            </div>
            <p className="type-body-strong text-[#1d1d1f]">Tersimpan!</p>
          </div>
        )}

        {/* Confirm State */}
        {state === 'confirm' && result && (
          <ConfirmCard
            result={result}
            onChange={setResult}
            onSave={handleSave}
            onRetry={handleRetry}
          />
        )}

        {/* Idle / Recording / Processing */}
        {(state === 'idle' || state === 'recording' || state === 'processing') && (
          <>
            {/* Mic Button */}
            <div className="flex flex-col items-center py-8">
              <div className="relative mb-8">
                {state === 'recording' && (
                  <>
                    <div className="absolute inset-0 rounded-full animate-pulse-ring"
                      style={{ background: 'rgba(0,102,204,0.15)' }} />
                    <div className="absolute inset-[-8px] rounded-full animate-pulse-ring"
                      style={{ background: 'rgba(0,102,204,0.08)', animationDelay: '0.3s' }} />
                  </>
                )}
                <button
                  onClick={state === 'recording' ? stopRecording : startRecording}
                  disabled={state === 'processing'}
                  className="relative w-24 h-24 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: state === 'recording' ? '#FF375F' : '#0066cc',
                    color: 'white',
                    border: 'none',
                    cursor: state === 'processing' ? 'not-allowed' : 'pointer',
                  }}
                >
                  {state === 'processing' ? (
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : state === 'recording' ? (
                    <MicOff size={32} />
                  ) : (
                    <Mic size={32} />
                  )}
                </button>
              </div>

              {/* Waveform during recording */}
              {state === 'recording' && (
                <div className="flex items-center gap-1 mb-6" style={{ height: '40px' }}>
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="waveform-bar"
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: `${0.8 + (i % 3) * 0.2}s`,
                        height: `${20 + (i % 4) * 8}px`,
                      }}
                    />
                  ))}
                </div>
              )}

              <p className="type-caption text-center" style={{ color: '#7a7a7a', maxWidth: '260px' }}>
                {state === 'idle' && 'Tekan mikrofon, lalu ucapkan\n"Beli kopi 25 ribu"'}
                {state === 'recording' && 'Bicara sekarang... Tekan stop jika selesai.'}
                {state === 'processing' && 'AI sedang menganalisis ucapan Anda...'}
              </p>
            </div>

            {/* Transcript display */}
            {transcript && (
              <div className="rounded-[11px] px-4 py-3 mb-4"
                style={{ background: '#f5f5f7', border: '1px solid #e0e0e0' }}>
                <p className="type-caption-strong mb-1" style={{ color: '#7a7a7a' }}>Transkripsi:</p>
                <p className="type-body text-[#1d1d1f]">{transcript}</p>
                {state === 'idle' && (
                  <button
                    onClick={handleManualTranscript}
                    className="btn-primary mt-3"
                    style={{ padding: '8px 16px', fontSize: '14px' }}
                  >
                    Proses Teks Ini
                  </button>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-[8px] px-4 py-3 mb-4"
                style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)' }}>
                <p className="type-caption" style={{ color: '#FF3B30' }}>{error}</p>
              </div>
            )}

            {/* Quick examples */}
            <div className="mt-4">
              <p className="type-fine mb-3" style={{ color: '#7a7a7a' }}>Contoh ucapan:</p>
              <div className="flex flex-wrap gap-2">
                {['Beli kopi 25 ribu', 'Bayar parkir 3 ribu', 'Makan siang 40 ribu', 'Gaji 5 juta'].map(ex => (
                  <button
                    key={ex}
                    onClick={() => { setTranscript(ex); }}
                    className="category-chip text-sm"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
