CREATE TABLE public.categories (
    id text PRIMARY KEY,
    description text
);

INSERT INTO public.categories (id, description) VALUES
('Infraestructura Vital', 'Gastos necesarios para operar el día a día (vivienda, alimentación básica, salud, transporte esencial).'),
('Ocio Estratégico', 'Gastos de disfrute que recargan energía sin exceder los límites (salidas, restaurantes, hobbies).'),
('Expansión y Activos', 'Inversiones en educación, negocios, herramientas o activos que generan valor futuro.'),
('Fugas de Capital', 'Gastos impulsivos, comisiones bancarias, o cosas que no aportan valor real.'),
('Amortiguación de Riesgo', 'Seguros, fondo de emergencia, ahorro conservador.'),
('Uncategorized', 'Gastos aún no clasificados.');

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are readable by everyone." 
ON public.categories FOR SELECT 
USING (true);

-- Ensure existing data complies with the new foreign key
UPDATE public.transactions 
SET category_id = 'Uncategorized' 
WHERE category_id IS NOT NULL AND category_id NOT IN (
    'Infraestructura Vital', 
    'Ocio Estratégico', 
    'Expansión y Activos', 
    'Fugas de Capital', 
    'Amortiguación de Riesgo', 
    'Uncategorized'
);

-- Apply Foreign Key to transactions table
ALTER TABLE public.transactions
ADD CONSTRAINT fk_transaction_category
FOREIGN KEY (category_id) REFERENCES public.categories(id);
