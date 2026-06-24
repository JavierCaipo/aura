import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  // 1. Token is required
  if (!token) {
    return NextResponse.json({ error: 'Token requerido' }, { status: 401 })
  }

  // 2. Instanciar el cliente con privilegios de administrador (Service Role Key)
  // Esto salta el RLS de forma segura porque validamos mediante el token único
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Asegúrate de tener esta variable en tu .env y en Vercel
  )

  // 3. Look up user by webhook_token
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('webhook_token', token)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }

  // 4. Parse & validate body
  let body: { raw_text?: string; amount?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 422 })
  }

  const amount = Number(body.amount)
  if (!body.amount || isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: 'amount requerido y debe ser positivo' }, { status: 422 })
  }

  // 5. Insert transaction using the admin client
  const { data: transaction, error: insertError } = await supabaseAdmin
    .from('transactions')
    .insert({
      user_id: profile.id,
      amount,
      currency: 'PEN',
      raw_text: body.raw_text ?? null,
    })
    .select('id, amount, created_at')
    .single()

  if (insertError) {
    console.error('[webhook] insert error:', insertError)
    return NextResponse.json({ error: 'Error al registrar el gasto' }, { status: 500 })
  }

  return NextResponse.json(transaction, { status: 200 })
}