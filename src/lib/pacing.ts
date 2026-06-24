import { Transaction } from '@/types'

export interface PacingResult {
  currentSpend: number
  projectedSpend: number
  monthlyLimit: number
  targetSurplus: number
  isOnTrack: boolean
  remainingDays: number
  dailyBudgetRemaining: number
}

/**
 * Calculates the investment pacing and projected spend for the current month.
 */
export function calculatePacing(
  transactions: Transaction[],
  monthlyLimit: number,
  targetSurplus: number,
  currentDate: Date = new Date()
): PacingResult {
  // Use net_amount if available (for split bills), otherwise fallback to amount
  const currentSpend = transactions.reduce((acc, tx) => {
    const amount = tx.net_amount != null ? Number(tx.net_amount) : Number(tx.amount)
    return acc + amount
  }, 0)

  // Calculate days
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const currentDay = currentDate.getDate()
  
  // Projection based on linear run rate
  const runRate = currentSpend / currentDay
  const projectedSpend = runRate * daysInMonth
  
  const remainingDays = daysInMonth - currentDay + 1 // including today
  const remainingBudget = monthlyLimit - currentSpend
  const dailyBudgetRemaining = remainingDays > 0 ? remainingBudget / remainingDays : 0

  const isOnTrack = projectedSpend <= monthlyLimit

  return {
    currentSpend,
    projectedSpend,
    monthlyLimit,
    targetSurplus,
    isOnTrack,
    remainingDays,
    dailyBudgetRemaining: Math.max(0, dailyBudgetRemaining)
  }
}
