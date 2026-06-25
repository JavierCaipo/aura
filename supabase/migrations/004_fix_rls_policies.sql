-- Permite a los usuarios actualizar sus propias transacciones
CREATE POLICY "Transactions: update own"
ON public.transactions FOR UPDATE
USING (auth.uid() = user_id);
