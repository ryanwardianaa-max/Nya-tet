'use client';

import { useState, useRef, useEffect } from 'react';
import { AIScanResult, Transaction } from '@/lib/types';
import { Camera, Upload, X, Check, ImageIcon } from 'lucide-react';
import ConfirmCard from './ConfirmCard';
import { AIVoiceResult } from '@/lib/types';

interface ScanModalProps {
  onClose: () => void;
  onSaved: (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => void;
}

type ModalState = 'idle' | 'camera' | 'processing' | 'confirm' | 'saved';

export default function ScanModal({ onClose, onSaved }: ScanModalProps) {
  const [state, setState] = useState<ModalState>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AIVoiceResult | null>(null);
  const [error, setError] = useState('');

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      setState('camera');
    } catch (err) {
      console.error(err);
      setError('Gagal mengakses kamera. Pastikan izin diberikan pada browser Anda.');
    }
  };

  useEffect(() => {
    if (state === 'camera' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [state]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg');
        setPreview(base64);
        stopCamera();
        processImage(base64);
      }
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Pilih file gambar (JPG, PNG)');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      await processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (imageBase64: string) => {
    setState('processing');
    setError('');
    try {
      const res = await fetch('/api/ai/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      });
      const data: AIScanResult & { error?: string } = await res.json();
      if (data.error) throw new Error(data.error);
      setResult({
        jumlah: data.jumlah,
        kategori: data.kategori,
        keterangan: data.keterangan || data.toko || 'Pembelian',
        tipe: 'pengeluaran',
      });
      setState('confirm');
    } catch {
      setError('Gagal membaca struk. Coba foto lebih jelas.');
      setState('idle');
    }
  };

  const handleSave = () => {
    if (!result) return;
    onSaved({ 
      ...result, 
      source: 'scan',
      created_at: result.tanggal ? new Date(result.tanggal).toISOString() : new Date().toISOString()
    });
    setState('saved');
    setTimeout(handleClose, 1000);
  };

  const handleRetry = () => {
    setPreview(null);
    setResult(null);
    setError('');
    setState('idle');
  };

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="modal-sheet">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="type-display-md text-[#1d1d1f]" style={{ fontSize: '22px' }}>
              {state === 'confirm' ? 'Konfirmasi Struk' : 'Scan Nota'}
            </h2>
            <p className="type-caption mt-1" style={{ color: '#7a7a7a' }}>
              {state === 'idle' && 'Foto struk untuk ekstrak otomatis'}
              {state === 'camera' && 'Arahkan kamera ke struk'}
              {state === 'processing' && 'AI membaca struk...'}
              {state === 'confirm' && 'Periksa dan simpan'}
              {state === 'saved' && 'Tersimpan!'}
            </p>
          </div>
          <button onClick={handleClose} className="btn-icon-chip" style={{ background: '#f5f5f7', color: '#1d1d1f' }}>
            <X size={18} />
          </button>
        </div>

        {/* ── Saved ── */}
        {state === 'saved' && (
          <div className="text-center py-12 animate-scale-in">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(48,209,88,0.15)' }}>
              <Check size={28} style={{ color: '#30D158' }} />
            </div>
            <p className="type-body-strong text-[#1d1d1f]">Tersimpan!</p>
          </div>
        )}

        {/* ── Confirm ── */}
        {state === 'confirm' && result && (
          <>
            {preview && (
              <div className="mb-6 rounded-[11px] overflow-hidden"
                style={{ boxShadow: 'rgba(0,0,0,0.22) 3px 5px 30px 0px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Struk" className="w-full object-cover max-h-44" />
              </div>
            )}
            <ConfirmCard result={result} onChange={setResult} onSave={handleSave} onRetry={handleRetry} />
          </>
        )}

        {/* ── Processing ── */}
        {state === 'processing' && (
          <div className="flex flex-col items-center py-12">
            {preview && (
              <div className="mb-6 rounded-[11px] overflow-hidden w-40"
                style={{ boxShadow: 'rgba(0,0,0,0.22) 3px 5px 30px 0px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Struk" className="w-full" />
              </div>
            )}
            <div className="w-10 h-10 border-2 rounded-full animate-spin mb-4"
              style={{ borderColor: '#e0e0e0', borderTopColor: '#0066cc' }} />
            <p className="type-caption" style={{ color: '#7a7a7a' }}>Vision AI membaca struk...</p>
          </div>
        )}

        {/* ── Camera Interface ── */}
        {state === 'camera' && (
          <div className="flex flex-col items-center">
            <div className="w-full rounded-[11px] overflow-hidden bg-black mb-4 aspect-[3/4] relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {/* Capture Button Overlay */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <button 
                  onClick={takePhoto}
                  className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-transparent active:scale-95 transition-transform"
                >
                  <div className="w-12 h-12 bg-white rounded-full"></div>
                </button>
              </div>
            </div>
            <button 
              onClick={() => { stopCamera(); setState('idle'); }}
              className="type-body-strong text-[#7a7a7a]"
            >
              Batal
            </button>
          </div>
        )}

        {/* ── Idle ── */}
        {state === 'idle' && (
          <>
            {/* Drop zone */}
            <div
              className="rounded-[18px] flex flex-col items-center justify-center py-10 mb-6 cursor-pointer"
              style={{ border: '2px dashed #e0e0e0', background: '#fafafc' }}
              onClick={startCamera}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleFileSelect(file);
              }}
            >
              <div className="w-14 h-14 rounded-[18px] flex items-center justify-center mb-3"
                style={{ background: 'rgba(0,102,204,0.1)' }}>
                <Camera size={26} style={{ color: '#0066cc' }} />
              </div>
              <p className="type-body-strong text-[#1d1d1f] mb-1">Ambil Foto Struk</p>
              <p className="type-caption text-center" style={{ color: '#7a7a7a', maxWidth: '200px' }}>
                Struk belanja, kwitansi, nota pembayaran
              </p>
            </div>

            {/* ── Input Galeri ── */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
                e.target.value = '';
              }}
            />

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={startCamera}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <Camera size={16} /> Buka Kamera
              </button>
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Upload size={16} /> Dari Galeri
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-[8px] px-4 py-3"
                style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)' }}>
                <p className="type-caption" style={{ color: '#FF3B30' }}>{error}</p>
              </div>
            )}

          </>
        )}
      </div>
    </div>
  );
}
