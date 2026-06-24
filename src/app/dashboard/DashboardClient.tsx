'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Transaction {
  id: string
  amount: number
  currency: string
  raw_text: string | null
  created_at: string
}

interface Props {
  userId: string
  userEmail: string
  webhookUrl: string
  initialTotal: number
  initialTransactions: Transaction[]
  monthName: string
  startOfMonth: string
  signOutAction: () => Promise<void>
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
  })
}

export default function DashboardClient({
  userId,
  userEmail,
  webhookUrl,
  initialTotal,
  initialTransactions,
  monthName,
  startOfMonth,
  signOutAction,
}: Props) {
  const [total, setTotal] = useState(initialTotal)
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [copied, setCopied] = useState(false)
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting')
  const [toast, setToast] = useState<string | null>(null)
  const webhookInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // ── Supabase Realtime subscription ──────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`transactions:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newTx = payload.new as Transaction
          setTransactions((prev) => [newTx, ...prev])
          setTotal((prev) => prev + Number(newTx.amount))
          showToast(`+${formatAmount(Number(newTx.amount))} registrado 🎉`)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setRealtimeStatus('connected')
        else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') setRealtimeStatus('disconnected')
        else setRealtimeStatus('connecting')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(webhookUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback: select the hidden input
      if (webhookInputRef.current) {
        webhookInputRef.current.select()
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    }
  }

  const today = new Date()
  const monthLabel = today.toLocaleDateString('es-PE', { month: 'long' })
  const yearLabel = today.getFullYear()

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'radial-gradient(ellipse 80% 40% at 50% -5%, rgba(124,92,252,0.1) 0%, transparent 60%), var(--color-bg)',
        padding: '0 1rem 3rem',
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '1.25rem 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '2rem', height: '2rem',
              borderRadius: '0.5rem',
              background: 'linear-gradient(135deg, var(--color-brand), #5b4bd4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem',
            }}
          >⚡</div>
          <span className="font-display" style={{ fontWeight: 600, fontSize: '1.0625rem' }}>Aura OS</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Realtime status dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div
              className={realtimeStatus === 'connected' ? 'pulse-dot' : ''}
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: realtimeStatus === 'connected'
                  ? 'var(--color-brand-2)'
                  : realtimeStatus === 'connecting'
                  ? '#fbbf24'
                  : '#f87171',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
              {realtimeStatus === 'connected' ? 'En vivo' : realtimeStatus === 'connecting' ? 'Conectando…' : 'Sin conexión'}
            </span>
          </div>

          <span style={{ fontSize: '0.8125rem', color: 'var(--color-muted)' }}>{userEmail}</span>

          <form action={signOutAction}>
            <button
              id="sign-out-btn"
              type="submit"
              className="btn btn-ghost"
              style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
            >
              Salir
            </button>
          </form>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* ══════════════════════════════════════════════════ */}
        {/* AC-04 · Balance Card */}
        {/* ══════════════════════════════════════════════════ */}
        <div
          className="card"
          style={{
            padding: '2rem',
            marginBottom: '1.25rem',
            background: 'linear-gradient(135deg, var(--color-surface) 0%, rgba(124,92,252,0.06) 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background glow */}
          <div
            aria-hidden
            style={{
              position: 'absolute', top: '-2rem', right: '-2rem',
              width: '12rem', height: '12rem',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124,92,252,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Gastado en {monthLabel} {yearLabel}
              </p>
            </div>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                background: 'rgba(94,234,212,0.08)',
                border: '1px solid rgba(94,234,212,0.2)',
                borderRadius: '2rem',
                padding: '0.25rem 0.625rem',
              }}
            >
              <div className="pulse-dot" />
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-brand-2)', fontWeight: 600 }}>TIEMPO REAL</span>
            </div>
          </div>

          <div className="amount-display" style={{ marginBottom: '0.75rem' }}>
            {formatAmount(total)}
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
            {transactions.length} {transactions.length === 1 ? 'transacción' : 'transacciones'} este mes
          </p>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* AC-02 · Webhook URL Card */}
        {/* ══════════════════════════════════════════════════ */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🔗</span>
            <h2 className="font-display" style={{ fontSize: '1.0625rem', fontWeight: 600 }}>
              Tu URL de Webhook
            </h2>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
            Pega esta URL en tu iOS Shortcut para registrar gastos automáticamente.
          </p>

          <div className="webhook-field">
            <span className="webhook-url-text">{webhookUrl}</span>
            <button
              id="copy-webhook-btn"
              onClick={handleCopy}
              className={`btn btn-copy${copied ? ' copied' : ''}`}
              aria-label="Copiar URL del webhook"
              style={{ flexShrink: 0 }}
            >
              {copied ? '✓ ¡Copiada!' : '📋 Copiar'}
            </button>
          </div>

          {/* Hidden input fallback for clipboard */}
          <input
            ref={webhookInputRef}
            readOnly
            value={webhookUrl}
            aria-hidden
            tabIndex={-1}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, width: 0 }}
          />
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* AC-03 · 3-Step iOS Shortcut Guide */}
        {/* ══════════════════════════════════════════════════ */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📱</span>
            <h2 className="font-display" style={{ fontSize: '1.0625rem', fontWeight: 600 }}>
              Instala el Shortcut de iOS
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {/* Step 1 */}
            <Step
              number={1}
              icon="⬇️"
              title="Descarga el Shortcut"
              description="Abre el siguiente enlace desde tu iPhone para agregar el Shortcut de Yape a tu app Atajos."
              action={
                <a
                  id="shortcut-download-link"
                  href="https://www.icloud.com/shortcuts/tu-shortcut-id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', textDecoration: 'none' }}
                >
                  Abrir en iPhone →
                </a>
              }
            />

            <StepDivider />

            {/* Step 2 */}
            <Step
              number={2}
              icon="📋"
              title="Pega tu URL de Webhook"
              description='Al instalar el Shortcut, te pedirá tu URL. Cópiala arriba con el botón "Copiar" y pégala en el campo indicado.'
              action={
                <button
                  onClick={handleCopy}
                  className={`btn btn-copy${copied ? ' copied' : ''}`}
                  style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                >
                  {copied ? '✓ URL copiada' : '📋 Copiar URL'}
                </button>
              }
            />

            <StepDivider />

            {/* Step 3 */}
            <Step
              number={3}
              icon="🧪"
              title="Prueba el Shortcut"
              description='Abre Atajos → ejecuta "Registrar gasto Yape" → ingresa un monto. El saldo de arriba debería actualizarse en segundos.'
              action={null}
            />
          </div>
        </div>

        {/* Recent transactions */}
        {transactions.length > 0 && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 className="font-display" style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '1rem' }}>
              Últimos gastos
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {transactions.slice(0, 8).map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.75rem',
                    background: 'var(--color-subtle)',
                    borderRadius: '0.5rem',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--color-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tx.raw_text ?? 'Gasto Yape'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                      {formatAmount(Number(tx.amount))}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                      {formatDate(tx.created_at)} {formatTime(tx.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Toast notification */}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  )
}

// ── Sub-components ───────────────────────────────────

function Step({
  number,
  icon,
  title,
  description,
  action,
}: {
  number: number
  icon: string
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', gap: '1rem', padding: '1rem 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', paddingTop: '0.125rem' }}>
        <div className="step-number active">{number}</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '1rem' }}>{icon}</span>
          <h3 className="font-display" style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{title}</h3>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: action ? '0.875rem' : 0 }}>
          {description}
        </p>
        {action}
      </div>
    </div>
  )
}

function StepDivider() {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch' }}>
      <div style={{ width: '2rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '1px', background: 'var(--color-border)', flex: 1 }} />
      </div>
      <div style={{ flex: 1 }} />
    </div>
  )
}
