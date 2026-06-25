'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function CalibrationModal() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [stage, setStage] = useState<'DEBT_EXTERMINATION' | 'WEALTH_EXPANSION' | null>(null)
  const [targetSurplus, setTargetSurplus] = useState('')
  const [monthlyLimit, setMonthlyLimit] = useState('')
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  const handleStageSelect = (selectedStage: 'DEBT_EXTERMINATION' | 'WEALTH_EXPANSION') => {
    setStage(selectedStage)
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/calibration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          financial_stage: stage,
          monthly_limit: Number(monthlyLimit),
          target_surplus: Number(targetSurplus)
        })
      })

      if (res.ok) {
        setVisible(false)
        router.refresh()
      } else {
        console.error('Failed to calibrate')
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 50% 0%, rgba(124,92,252,0.1) 0%, transparent 70%)' }} />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{ width: '100%', maxWidth: '440px' }}
          >
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>♟️</span>
                <h2 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                  ¿Cuál es tu misión principal este mes?
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                  Aura OS adaptará el Pacing de Capital a tu estrategia actual.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                  onClick={() => handleStageSelect('DEBT_EXTERMINATION')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.75rem', cursor: 'pointer', transition: 'all 200ms', textAlign: 'left'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                >
                  <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9375rem', marginBottom: '0.125rem' }}>Exterminar Deuda</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Liquidar pasivos como prioridad absoluta</div>
                  </div>
                </button>

                <button
                  onClick={() => handleStageSelect('WEALTH_EXPANSION')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.75rem', cursor: 'pointer', transition: 'all 200ms', textAlign: 'left'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                >
                  <span style={{ fontSize: '1.5rem' }}>🚀</span>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9375rem', marginBottom: '0.125rem' }}>Acelerar Expansión</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Acumular capital e invertir en activos</div>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            style={{ width: '100%', maxWidth: '440px' }}
          >
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button 
                    onClick={() => setStep(1)} 
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
                  >←</button>
                  <span style={{ fontSize: '1.25rem' }}>{stage === 'DEBT_EXTERMINATION' ? '🛡️' : '🚀'}</span>
                  <h2 className="font-display" style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-text)' }}>
                    Configura tus Parámetros
                  </h2>
                </div>
                
                {stage === 'DEBT_EXTERMINATION' ? (
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.5, background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    Usuarios en esta fase que restringen sus 'Fugas de Capital' liquidan deudas 3x más rápido.
                  </p>
                ) : (
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.5, background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    El capital que retienes es el ejército que trabaja para ti. Fija límites agresivos.
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                    {stage === 'DEBT_EXTERMINATION' ? '¿Cuánto capital destinarás a neutralizar deuda este mes?' : '¿Qué monto de capital asegurarás este mes?'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }}>S/</span>
                    <input
                      type="number"
                      required
                      value={targetSurplus}
                      onChange={e => setTargetSurplus(e.target.value)}
                      placeholder="500"
                      className="input"
                      style={{ paddingLeft: '2.5rem', fontSize: '1rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                    ¿Cuál es tu límite máximo para operar (gasto vital)?
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }}>S/</span>
                    <input
                      type="number"
                      required
                      value={monthlyLimit}
                      onChange={e => setMonthlyLimit(e.target.value)}
                      placeholder="2500"
                      className="input"
                      style={{ paddingLeft: '2.5rem', fontSize: '1rem' }}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ marginTop: '0.5rem', padding: '0.875rem', fontSize: '0.9375rem', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Inicializando...' : 'Iniciar Proyección'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
