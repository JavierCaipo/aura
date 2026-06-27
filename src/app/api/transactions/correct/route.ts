import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
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

    let { transaction_id, category_id, keyword } = body

    console.log("[CORRECT_TRACE] Payload:", { id: transaction_id, category_id })

    // Ensure keyword is safe
    if (!keyword || keyword.trim() === '') {
      keyword = 'yape'
    }

    if (!transaction_id || !category_id) {
      return NextResponse.json({ error: 'Faltan parámetros (transaction_id, category_id)' }, { status: 422 })
    }

    // Update transaction
    const { data: updatedTx, error: txError } = await supabase
      .from('transactions')
      .update({ category_id })
      .eq('id', transaction_id)
      .eq('user_id', user.id)
      .select()

    if (txError) {
      console.error("Supabase Update Error:", txError)
      return NextResponse.json({ error: txError.message }, { status: 500 })
    }

    if (!updatedTx || updatedTx.length === 0) {
      return NextResponse.json({ error: 'Ninguna fila actualizada. Verifica el ID o las políticas RLS.' }, { status: 404 })
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
      console.error('[correct api] Error actualizando memoria IA:', memError)
      return NextResponse.json({ error: memError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
