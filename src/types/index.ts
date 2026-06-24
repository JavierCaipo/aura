export interface Transaction {
  id: string
  amount: number
  currency: string
  raw_text: string | null
  created_at: string
  // New AI Brain fields
  category_id?: string | null
  geolocation?: string | null
  net_amount?: number | null
  parent_transaction_id?: string | null
}

export interface InvestmentGoal {
  id: string
  user_id: string
  monthly_limit: number
  target_investment_surplus: number
  month_year: string
  created_at: string
}

export interface UserAiMemory {
  id: string
  user_id: string
  keyword: string
  forced_category: string
  created_at: string
}
