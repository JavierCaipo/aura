'use server'

import { createClient } from '@/lib/supabase/server'

export async function sendMagicLink(formData: FormData) {
  const email = formData.get('email') as string

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Por favor ingresa un email válido.' }
  }

  const supabase = await createClient()

  // Construir URL sin trailing slash para evitar doble barra
  const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003').replace(/\/$/, '')
  const redirectTo = `${siteUrl}/auth/callback`

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  })

  if (error) {
    console.error('SUPABASE AUTH ERROR:', error.message, '| status:', error.status, '| name:', error.name)
    return { error: 'No pudimos enviar el enlace. Intenta de nuevo.' }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
