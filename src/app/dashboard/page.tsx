import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import DashboardClient from './DashboardClient'

interface Profile {
  webhook_token: string
}

interface Transaction {
  id: string
  amount: number
  currency: string
  raw_text: string | null
  created_at: string
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
      signOutAction={handleSignOut}
    />
  )
}
