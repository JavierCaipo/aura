import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: { transaction_id?: string; category_id?: string; keyword?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 422 })
  }

  const { transaction_id, category_id, keyword } = body

  if (!transaction_id || !category_id || !keyword) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 422 })
  }

  // Update transaction
  const { error: txError } = await supabase
    .from('transactions')
    .update({ category_id })
    .eq('id', transaction_id)
    .eq('user_id', user.id)

  if (txError) {
    return NextResponse.json({ error: 'Error actualizando transacción' }, { status: 500 })
  }

  // 1. Delete existing keyword for user to simulate UPSERT without unique constraint
  await supabase
    .from('user_ai_memory')
    .delete()
    .eq('user_id', user.id)
    .eq('keyword', keyword)

  // 2. Insert new rule
  const { error: memError } = await supabase
    .from('user_ai_memory')
    .insert({
      user_id: user.id,
      keyword,
      forced_category: category_id
    })

  if (memError) {
    return NextResponse.json({ error: 'Error actualizando memoria IA' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
