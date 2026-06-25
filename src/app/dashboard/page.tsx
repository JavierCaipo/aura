import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import DashboardClient from './DashboardClient'
import { Transaction } from '@/types'

interface Profile {
  webhook_token: string
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // Verify session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile (webhook_token)
  const { data: profile } = await supabase
    .from('profiles')
    .select('webhook_token')
    .eq('id', user.id)
    .single<Profile>()

  if (!profile) {
    // Profile not yet created — can happen in edge cases
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-muted)' }}>Configurando tu cuenta… recarga en un momento.</p>
      </div>
    )
  }

  // Fetch current month transactions
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, amount, currency, raw_text, created_at')
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth)
    .order('created_at', { ascending: false })

  const initialTotal = (transactions ?? []).reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0)

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/yape?token=${profile.webhook_token}`

  const monthName = now.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
  const monthYear = startOfMonth.substring(0, 7) // "YYYY-MM"

  // Fetch investment goals
  const { data: goal } = await supabase
    .from('investment_goals')
    .select('monthly_limit, target_investment_surplus')
    .eq('user_id', user.id)
    .eq('month_year', monthYear)
    .maybeSingle()

  const monthlyLimit = goal ? Number(goal.monthly_limit) : 2500
  const targetSurplus = goal ? Number(goal.target_investment_surplus) : 500

  async function handleSignOut() {
    'use server'
    await signOut()
    redirect('/login')
  }

  return (
    <DashboardClient
      userId={user.id}
      userEmail={user.email ?? ''}
      webhookUrl={webhookUrl}
      initialTotal={initialTotal}
      initialTransactions={transactions ?? []}
      monthName={monthName}
      startOfMonth={startOfMonth}
      monthlyLimit={monthlyLimit}
      targetSurplus={targetSurplus}
      signOutAction={handleSignOut}
    />
  )
}
