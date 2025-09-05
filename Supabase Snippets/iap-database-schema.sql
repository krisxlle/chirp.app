-- Supabase IAP Database Schema
-- This script creates the necessary tables for In-App Purchases

-- ========================================
-- STEP 1: Add crystal balance columns to users table
-- ========================================
-- Add crystal balance columns to existing users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS crystal_balance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_crystals_purchased INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_crystals_spent INTEGER DEFAULT 0;

-- ========================================
-- STEP 2: Create purchase history table
-- ========================================
CREATE TABLE IF NOT EXISTS public.purchase_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id VARCHAR(255) NOT NULL,
    crystals INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    transaction_id VARCHAR(255) NOT NULL UNIQUE,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    receipt TEXT NOT NULL,
    validated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 3: Create feature flags table
-- ========================================
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    enabled BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 4: Create crystal transactions table (for spending crystals)
-- ========================================
CREATE TABLE IF NOT EXISTS public.crystal_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Positive for earned, negative for spent
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('purchase', 'spend', 'reward', 'refund')),
    description TEXT,
    reference_id VARCHAR(255), -- Reference to purchase, chirp, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 5: Create paywall analytics table
-- ========================================
CREATE TABLE IF NOT EXISTS public.paywall_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('shown', 'dismissed', 'purchased', 'converted')),
    trigger_event VARCHAR(100),
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 6: Enable RLS on all tables
-- ========================================
ALTER TABLE public.purchase_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crystal_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paywall_analytics ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 7: Create RLS policies
-- ========================================
-- Purchase history policies
CREATE POLICY "Users can view own purchase history" ON public.purchase_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchase history" ON public.purchase_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchase history" ON public.purchase_history
    FOR UPDATE USING (auth.uid() = user_id);

-- Feature flags policies (admin only)
CREATE POLICY "Authenticated users can view feature flags" ON public.feature_flags
    FOR SELECT USING (auth.role() = 'authenticated');

-- Crystal transactions policies
CREATE POLICY "Users can view own crystal transactions" ON public.crystal_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crystal transactions" ON public.crystal_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Paywall analytics policies
CREATE POLICY "Users can insert paywall analytics" ON public.paywall_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own paywall analytics" ON public.paywall_analytics
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- ========================================
-- STEP 8: Create indexes for performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_purchase_history_user_id ON public.purchase_history(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_transaction_id ON public.purchase_history(transaction_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_purchase_date ON public.purchase_history(purchase_date);
CREATE INDEX IF NOT EXISTS idx_crystal_transactions_user_id ON public.crystal_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_crystal_transactions_type ON public.crystal_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_crystal_transactions_created_at ON public.crystal_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_paywall_analytics_user_id ON public.paywall_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_paywall_analytics_event_type ON public.paywall_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_paywall_analytics_created_at ON public.paywall_analytics(created_at);

-- ========================================
-- STEP 9: Insert default feature flags
-- ========================================
INSERT INTO public.feature_flags (name, enabled, settings) VALUES
('iap_settings', TRUE, '{
    "enableIAP": true,
    "enablePaywall": true,
    "enableCrystalShop": true,
    "enableBonusCrystals": true,
    "enablePurchaseValidation": true,
    "fallbackToOfflineMode": true
}'),
('paywall_config', TRUE, '{
    "enabled": true,
    "triggerEvents": ["insufficient_crystals", "premium_feature"],
    "showAfterActions": ["post_chirp", "view_profile"],
    "cooldownMinutes": 30,
    "maxShowsPerDay": 3
}')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- STEP 10: Grant permissions
-- ========================================
-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.purchase_history TO authenticated;
GRANT ALL ON public.feature_flags TO authenticated;
GRANT ALL ON public.crystal_transactions TO authenticated;
GRANT ALL ON public.paywall_analytics TO authenticated;

-- Grant read-only permissions to anonymous users
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.feature_flags TO anon;

-- ========================================
-- STEP 11: Create functions for crystal management
-- ========================================
-- Function to add crystals to user
CREATE OR REPLACE FUNCTION public.add_crystals(
    user_uuid UUID,
    amount INTEGER,
    transaction_type VARCHAR(50),
    description TEXT DEFAULT NULL,
    reference_id VARCHAR(255) DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Update user's crystal balance
    UPDATE public.users 
    SET 
        crystal_balance = crystal_balance + amount,
        total_crystals_purchased = CASE 
            WHEN transaction_type = 'purchase' THEN total_crystals_purchased + amount
            ELSE total_crystals_purchased
        END,
        updated_at = NOW()
    WHERE id = user_uuid;

    -- Record transaction
    INSERT INTO public.crystal_transactions (
        user_id, amount, transaction_type, description, reference_id
    ) VALUES (
        user_uuid, amount, transaction_type, description, reference_id
    );

    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Function to spend crystals
CREATE OR REPLACE FUNCTION public.spend_crystals(
    user_uuid UUID,
    amount INTEGER,
    description TEXT DEFAULT NULL,
    reference_id VARCHAR(255) DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    current_balance INTEGER;
BEGIN
    -- Get current balance
    SELECT crystal_balance INTO current_balance
    FROM public.users
    WHERE id = user_uuid;

    -- Check if user has enough crystals
    IF current_balance < amount THEN
        RETURN FALSE;
    END IF;

    -- Update user's crystal balance
    UPDATE public.users 
    SET 
        crystal_balance = crystal_balance - amount,
        total_crystals_spent = total_crystals_spent + amount,
        updated_at = NOW()
    WHERE id = user_uuid;

    -- Record transaction
    INSERT INTO public.crystal_transactions (
        user_id, amount, transaction_type, description, reference_id
    ) VALUES (
        user_uuid, -amount, 'spend', description, reference_id
    );

    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- ========================================
-- STEP 12: Add comments for documentation
-- ========================================
COMMENT ON TABLE public.purchase_history IS 'Stores all in-app purchase transactions';
COMMENT ON TABLE public.feature_flags IS 'Feature flags for controlling IAP functionality';
COMMENT ON TABLE public.crystal_transactions IS 'All crystal transactions (earned/spent)';
COMMENT ON TABLE public.paywall_analytics IS 'Analytics for paywall interactions';

COMMENT ON FUNCTION public.add_crystals IS 'Adds crystals to user account and records transaction';
COMMENT ON FUNCTION public.spend_crystals IS 'Spends crystals from user account if sufficient balance';

-- Success message
SELECT 'IAP Database Schema Setup Complete!' as status, 
       'All tables, policies, and functions created successfully' as message;
