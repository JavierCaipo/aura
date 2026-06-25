import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Transaction } from '@/types'

interface Props {
  transactions: Transaction[]
}

const CATEGORY_COLORS: Record<string, string> = {
  'Infraestructura Vital': '#64748b', // Gris azulado
  'Ocio Estratégico': '#818cf8',      // Púrpura/Azul tenue
  'Expansión y Activos': '#2dd4bf',   // Verde/Cian vibrante
  'Fugas de Capital': '#ef4444',      // Rojo advertencia
  'Amortiguación de Riesgo': '#fbbf24', // Dorado sutil
  'Uncategorized': '#71717a'          // Gris neutro
}

export default function CategoryBreakdown({ transactions }: Props) {
  const { breakdown, total } = useMemo(() => {
    let totalSpend = 0
    const sums: Record<string, number> = {}

    transactions.forEach(tx => {
      const amount = tx.net_amount != null ? Number(tx.net_amount) : Number(tx.amount)
      const cat = tx.category_id || 'Uncategorized'
      sums[cat] = (sums[cat] || 0) + amount
      totalSpend += amount
    })

    const result = Object.entries(sums)
      .map(([name, amount]) => ({
        name,
        amount,
        percent: totalSpend > 0 ? (amount / totalSpend) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)

    return { breakdown: result, total: totalSpend }
  }, [transactions])

  if (total === 0) return null

  return (
    <div className="card" style={{ padding: '2rem', marginBottom: '1.25rem' }}>
      <h2 className="font-display" style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '1.5rem' }}>
        Distribución de Capital
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <AnimatePresence>
          {breakdown.map((item) => {
            const color = CATEGORY_COLORS[item.name] || CATEGORY_COLORS['Uncategorized']
            
            return (
              <motion.div
                key={item.name}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text)', fontWeight: 500 }}>
                    {item.name}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text)', fontWeight: 600, marginRight: '0.5rem' }}>
                      S/ {item.amount.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-muted)' }}>
                      {item.percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {/* Stacked bar equivalent: simple horizontal progress bar per category */}
                <div style={{ position: 'relative', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                      position: 'absolute', top: 0, bottom: 0, left: 0,
                      background: color,
                      borderRadius: '3px',
                      boxShadow: `0 0 8px ${color}40`
                    }}
                  />
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
