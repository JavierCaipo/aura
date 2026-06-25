import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SetupClient from './SetupClient'

interface Profile {
  webhook_token: string
}

export default async function SetupPage() {
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
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-muted)' }}>Configurando tu cuenta… recarga en un momento.</p>
      </div>
    )
  }

  return <SetupClient webhookToken={profile.webhook_token} userEmail={user.email ?? ''} />
}
