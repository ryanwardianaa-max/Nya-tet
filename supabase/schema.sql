-- ============================================================
-- FinAI — Supabase Database Schema
-- Run this in your Supabase project's SQL Editor
-- ============================================================

-- Enable UUID extension (already enabled by default in Supabase)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Transactions Table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  jumlah      numeric(15, 2) NOT NULL CHECK (jumlah > 0),
  tipe        text NOT NULL CHECK (tipe IN ('pemasukan', 'pengeluaran')),
  kategori    text NOT NULL DEFAULT 'Lainnya',
  keterangan  text DEFAULT '',
  source      text NOT NULL DEFAULT 'manual' CHECK (source IN ('voice', 'scan', 'manual')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Row Level Security ──────────────────────────────────────
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own transactions
CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own transactions
CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_transactions_user_id
  ON public.transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_created_at
  ON public.transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_created
  ON public.transactions(user_id, created_at DESC);

-- ── Realtime ─────────────────────────────────────────────────
-- Enable realtime for this table in Supabase Dashboard:
-- Database → Replication → supabase_realtime → Add table: transactions
-- Or run:
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
