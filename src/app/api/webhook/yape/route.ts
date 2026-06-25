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
  let body: { raw_text?: string; amount?: number; time?: string; location?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 422 })
  }

  const amount = Number(body.amount)
  if (!body.amount || isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: 'amount requerido y debe ser positivo' }, { status: 422 })
  }

  // 5. Fetch user AI memory
  const { data: memories } = await supabaseAdmin
    .from('user_ai_memory')
    .select('keyword, forced_category')
    .eq('user_id', profile.id)

  // 6. Call OpenRouter
  let category_id = 'Uncategorized'
  let net_amount = amount
  let confidence = 0

  if (process.env.OPENROUTER_API_KEY && body.raw_text) {
    try {
      const systemPrompt = `You are an AI financial categorizer for Aura OS.
Rules:
1. Analyze the 'raw_text' of the Yape transaction.
2. Return a STRICT JSON object: { "category_id": string, "net_amount": number, "confidence": number }
3. 'net_amount' is usually equal to amount, UNLESS the text implies a split bill, refund, or reimbursement (e.g. "mitad", "tu parte"). Then calculate the actual net spend for the user.
4. Use the user's custom memory rules if the text contains a keyword:
${JSON.stringify(memories || [])}`

      const userPrompt = `Transaction: ${body.raw_text} | Amount: ${amount} | Time: ${body.time || 'unknown'} | Location: ${body.location || 'unknown'}`

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      })

      if (res.ok) {
        const jsonResponse = await res.json()
        const aiData = JSON.parse(jsonResponse.choices[0].message.content)
        category_id = aiData.category_id || 'Uncategorized'
        net_amount = aiData.net_amount ?? amount
        confidence = aiData.confidence ?? 0
      } else {
        console.error('[openrouter] fetch error:', await res.text())
      }
    } catch (err) {
      console.error('[openrouter] exception:', err)
    }
  }

  // 7. Insert enriched transaction using the admin client
  const { data: transaction, error: insertError } = await supabaseAdmin
    .from('transactions')
    .insert({
      user_id: profile.id,
      amount,
      currency: 'PEN',
      raw_text: body.raw_text ?? null,
      category_id,
      net_amount,
      geolocation: body.location ?? null
    })
    .select('id, amount, created_at')
    .single()

  if (insertError) {
    console.error('[webhook] insert error:', insertError)
    return NextResponse.json({ error: 'Error al registrar el gasto' }, { status: 500 })
  }

  return NextResponse.json(transaction, { status: 200 })
}