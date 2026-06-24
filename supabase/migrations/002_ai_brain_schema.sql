-- Phase 2: AI Brain Schema Update
-- Adding fields for transaction netting, and tables for investment pacing and personalized memory.

-- 1. Evolve `transactions` table
ALTER TABLE public.transactions
ADD COLUMN category_id text,
ADD COLUMN geolocation text,
ADD COLUMN net_amount numeric,
ADD COLUMN parent_transaction_id uuid REFERENCES public.transactions(id);

-- 2. Create `investment_goals` table
CREATE TABLE public.investment_goals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    monthly_limit numeric NOT NULL,
    target_investment_surplus numeric NOT NULL,
    month_year text NOT NULL, -- e.g., '2026-06'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.investment_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own investment goals." 
ON public.investment_goals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investment goals." 
ON public.investment_goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investment goals." 
ON public.investment_goals FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own investment goals." 
ON public.investment_goals FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Create `user_ai_memory` table
CREATE TABLE public.user_ai_memory (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    keyword text NOT NULL,
    forced_category text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_ai_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI memory." 
ON public.user_ai_memory FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI memory." 
ON public.user_ai_memory FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI memory." 
ON public.user_ai_memory FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI memory." 
ON public.user_ai_memory FOR DELETE 
USING (auth.uid() = user_id);
