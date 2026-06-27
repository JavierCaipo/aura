-- Drop the existing policy to ensure we have the correct one
DROP POLICY IF EXISTS "Transactions: update own" ON public.transactions;

-- Recreate policy with both USING and WITH CHECK to be absolutely certain
CREATE POLICY "Transactions: update own"
ON public.transactions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
