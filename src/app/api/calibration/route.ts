import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: { financial_stage?: string; monthly_limit?: number; target_surplus?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 422 })
  }

  const { financial_stage, monthly_limit, target_surplus } = body

  if (!financial_stage || monthly_limit === undefined || target_surplus === undefined) {
    return NextResponse.json({ error: 'Faltan parámetros (financial_stage, monthly_limit, target_surplus)' }, { status: 422 })
  }

  const today = new Date()
  const month_year = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

  const { error: upsertError } = await supabase
    .from('investment_goals')
    .upsert({
      user_id: user.id,
      month_year,
      monthly_limit,
      target_investment_surplus: target_surplus,
      financial_stage
    }, {
      onConflict: 'user_id, month_year'
    })

  if (upsertError) {
    console.error('[calibration api] Error guardando calibración:', upsertError)
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Calibración guardada exitosamente' })
}
