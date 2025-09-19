-- Create crystal_transactions table for tracking crystal earnings and spending
-- This table is required for the crystal reward system to work properly

CREATE TABLE IF NOT EXISTS public.crystal_transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('reward', 'purchase', 'refund')),
  description TEXT,
  reference_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crystal_transactions_user_id ON public.crystal_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_crystal_transactions_type ON public.crystal_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_crystal_transactions_created_at ON public.crystal_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_crystal_transactions_reference_id ON public.crystal_transactions(reference_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.crystal_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view own crystal transactions" ON public.crystal_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crystal transactions" ON public.crystal_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.crystal_transactions TO authenticated;
GRANT ALL ON public.crystal_transactions TO service_role;

-- Add comment
COMMENT ON TABLE public.crystal_transactions IS 'All crystal transactions (earned/spent) for tracking user crystal balance changes';
