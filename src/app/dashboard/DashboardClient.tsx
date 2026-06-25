'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

import { Transaction } from '@/types'
import { calculatePacing } from '@/lib/pacing'

interface Props {
  userId: string
  userEmail: string
  webhookUrl: string
  initialTotal: number
  initialTransactions: Transaction[]
  monthName: string
  startOfMonth: string
  monthlyLimit: number
  targetSurplus: number
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
  monthlyLimit,
  targetSurplus,
  signOutAction,
}: Props) {
  const [total, setTotal] = useState(initialTotal)
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [realtimeStatus, setRealtimeStatus] = useState<string>('connecting')
  const [toast, setToast] = useState<string | null>(null)

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
        (payload: any) => {
          const newTx = payload.new as Transaction
          setTransactions((prev) => [newTx, ...prev])
          setTotal((prev) => prev + Number(newTx.amount))
          showToast(`+${formatAmount(Number(newTx.amount))} registrado 🎉`)
        }
      )
      .subscribe((status: string) => {
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

          <UserAvatar userEmail={userEmail} signOutAction={signOutAction} />
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* ══════════════════════════════════════════════════ */}
        {/* AC-04 · Pacing Card */}
        {/* ══════════════════════════════════════════════════ */}
        {(() => {
          const pacing = calculatePacing(transactions, monthlyLimit, targetSurplus)
          const currentDay = today.getDate()
          const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
          const idealPercent = (currentDay / daysInMonth) * 100
          const progressPercent = Math.min(100, (pacing.currentSpend / pacing.monthlyLimit) * 100)
          const barColor = pacing.isOnTrack ? 'var(--color-brand-2)' : '#f59e0b'
          const glowColor = pacing.isOnTrack ? 'rgba(94,234,212,0.12)' : 'rgba(245,158,11,0.12)'

          return (
            <div
              className="card"
              style={{
                padding: '2rem',
                marginBottom: '1.25rem',
                background: `linear-gradient(135deg, var(--color-surface) 0%, ${glowColor} 100%)`,
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
                  background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                    Proyección de Capital • {monthLabel}
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    background: pacing.isOnTrack ? 'rgba(94,234,212,0.08)' : 'rgba(245,158,11,0.08)',
                    border: `1px solid ${pacing.isOnTrack ? 'rgba(94,234,212,0.2)' : 'rgba(245,158,11,0.2)'}`,
                    borderRadius: '2rem',
                    padding: '0.25rem 0.625rem',
                  }}
                >
                  <div className="pulse-dot" style={{ background: barColor, boxShadow: `0 0 8px ${barColor}` }} />
                  <span style={{ fontSize: '0.6875rem', color: barColor, fontWeight: 600 }}>
                    {pacing.isOnTrack ? 'ÓPTIMO' : 'ALERTA'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ position: 'relative', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', marginBottom: '1rem' }}>
                {/* Ideal Marker */}
                <div style={{
                  position: 'absolute', top: '-4px', bottom: '-4px', width: '2px',
                  background: 'rgba(255,255,255,0.4)', left: `${idealPercent}%`, zIndex: 2
                }} />
                {/* Actual Progress */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{
                    position: 'absolute', top: 0, bottom: 0, left: 0,
                    background: barColor, borderRadius: '4px', zIndex: 1,
                    boxShadow: `0 0 10px ${barColor}`
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--color-text)' }}>Gastado: {formatAmount(pacing.currentSpend)}</span>
                <span style={{ color: 'var(--color-muted)' }}>Límite: {formatAmount(pacing.monthlyLimit)}</span>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '1rem',
                borderRadius: '0.75rem',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  Capital Desplegado para Inversión Asegurado
                </p>
                <p className="font-display" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text)', background: 'linear-gradient(90deg, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {formatAmount(pacing.targetSurplus)}
                </p>
              </div>
            </div>
          )
        })()}

        {/* Recent transactions */}
        {transactions.length > 0 && (
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 className="font-display" style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '1rem' }}>
              Últimos gastos
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {transactions.slice(0, 8).map((tx) => (
                <TransactionItem key={tx.id} tx={tx} />
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

function UserAvatar({ userEmail, signOutAction }: { userEmail: string, signOutAction: () => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false)
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : 'U'

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '2rem', height: '2rem', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)',
          color: 'var(--color-text)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
          transition: 'border-color 200ms'
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
      >
        {initial}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0, zIndex: 50,
                background: 'rgba(15,15,15,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem',
                padding: '0.5rem', minWidth: '200px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ padding: '0.5rem 0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.25rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</p>
              </div>
              <a href="/dashboard/setup" style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text)', textDecoration: 'none',
                borderRadius: '0.375rem', transition: 'background 200ms'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                ⚙️ Configuración / iOS
              </a>
              <form action={signOutAction} style={{ margin: 0 }}>
                <button type="submit" style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                  padding: '0.5rem', fontSize: '0.8125rem', color: 'rgba(248,113,113,0.9)', 
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  borderRadius: '0.375rem', transition: 'background 200ms', textAlign: 'left'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  🚪 Salir
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function TransactionItem({ tx }: { tx: Transaction }) {
  const [isOpen, setIsOpen] = useState(false)
  const [category, setCategory] = useState(tx.category_id || 'Uncategorized')
  const [isUpdating, setIsUpdating] = useState(false)

  const categories = [
    'Infraestructura Vital',
    'Ocio Estratégico',
    'Expansión y Activos',
    'Fugas de Capital',
    'Amortiguación de Riesgo',
    'Uncategorized'
  ]

  const handleUpdate = async (newCategory: string) => {
    if (newCategory === category) {
      setIsOpen(false)
      return
    }
    const previous = category
    setCategory(newCategory)
    setIsOpen(false)
    setIsUpdating(true)

    try {
      const res = await fetch('/api/transactions/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: tx.id,
          category_id: newCategory,
          // Extract first word as keyword placeholder for the AI learning loop
          keyword: tx.raw_text ? tx.raw_text.split(' ')[0].toLowerCase() : 'yape'
        })
      })
      if (!res.ok) throw new Error('API Error')
    } catch {
      // Revert Optimistic UI if failed
      setCategory(previous)
    } finally {
      setIsUpdating(false)
    }
  }

  // Use net_amount if available, fallback to amount
  const displayAmount = tx.net_amount ?? tx.amount

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '0.75rem',
        gap: '1rem',
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: 500
          }}
        >
          {tx.raw_text ?? 'Gasto Yape'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {tx.geolocation && (
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-muted)' }}>📍 {tx.geolocation}</span>
          )}

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              style={{
                fontSize: '0.6875rem',
                background: 'rgba(124,92,252,0.1)',
                border: '1px solid rgba(124,92,252,0.2)',
                color: 'var(--color-brand-2)',
                padding: '0.125rem 0.5rem',
                borderRadius: '1rem',
                cursor: 'pointer',
                opacity: isUpdating ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                transition: 'all 200ms'
              }}
            >
              {category} ▾
            </button>

            <AnimatePresence>
              {isOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                    onClick={() => setIsOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      zIndex: 50,
                      background: 'rgba(15, 15, 15, 0.8)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '0.5rem',
                      padding: '0.25rem',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                      minWidth: '140px',
                    }}
                  >
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleUpdate(cat)}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.375rem 0.5rem',
                          fontSize: '0.75rem',
                          color: cat === category ? 'var(--color-brand-2)' : 'var(--color-text)',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text)' }}>
          {formatAmount(Number(displayAmount))}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
          {formatDate(tx.created_at)} {formatTime(tx.created_at)}
        </p>
      </div>
    </div>
  )
}
