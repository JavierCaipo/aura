ALTER TABLE public.investment_goals
ADD COLUMN financial_stage text;

ALTER TABLE public.investment_goals
ADD CONSTRAINT valid_financial_stage 
CHECK (financial_stage IN ('DEBT_EXTERMINATION', 'WEALTH_EXPANSION') OR financial_stage IS NULL);

ALTER TABLE public.investment_goals
ADD CONSTRAINT unique_user_month_goal UNIQUE (user_id, month_year);
