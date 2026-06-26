'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Props {
  webhookToken: string
  userEmail: string
}

export default function SetupClient({ webhookToken, userEmail }: Props) {
  const [copied, setCopied] = useState(false)
  const [copiedProd, setCopiedProd] = useState(false)
  const webhookInputRef = useRef<HTMLInputElement>(null)
  
  async function handleCopyToken() {
    try {
      await navigator.clipboard.writeText(webhookToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      if (webhookInputRef.current) {
        webhookInputRef.current.select()
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    }
  }

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
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
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
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/dashboard" className="btn btn-ghost" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', textDecoration: 'none' }}>
            ← Volver
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '2rem' }}>Configuración</h1>

        {/* ══════════════════════════════════════════════════ */}
        {/* PASO 1: COPIAR TOKEN */}
        {/* ══════════════════════════════════════════════════ */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🔑</span>
            <h2 className="font-display" style={{ fontSize: '1.0625rem', fontWeight: 600 }}>
              1. Copia tu Token de Seguridad
            </h2>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
            Este token es tu identificador único personal.
          </p>

          <div className="webhook-field">
            <span className="webhook-url-text">{webhookToken || 'Cargando...'}</span>
            <button
              onClick={handleCopyToken}
              className={`btn btn-copy${copied ? ' copied' : ''}`}
              aria-label="Copiar Token"
              style={{ flexShrink: 0 }}
            >
              {copied ? '✓ ¡Copiado!' : '📋 Copiar Token'}
            </button>
          </div>

          <input
            ref={webhookInputRef}
            readOnly
            value={webhookToken}
            aria-hidden
            tabIndex={-1}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, width: 0 }}
          />
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* PASO 2: INSTALAR ATAJO */}
        {/* ══════════════════════════════════════════════════ */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.01) 0%, rgba(124,92,252,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.05)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle background glow */}
          <div
            aria-hidden
            style={{
              position: 'absolute', bottom: '-50%', left: '-10%',
              width: '15rem', height: '15rem',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>⚙️</span>
            <h2 className="font-display" style={{ fontSize: '1.0625rem', fontWeight: 600 }}>
              2. Instala el Motor en tu iPhone
            </h2>
          </div>

          <a
            href="https://www.icloud.com/shortcuts/00adb50e59bb4cc5b1a255e158ff9957"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, var(--color-brand) 0%, #5b4bd4 100%)',
              border: 'none',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 12px rgba(124,92,252,0.25)',
              transition: 'all 200ms',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(124,92,252,0.4)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,92,252,0.25)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
             Instalar Atajo iOS
          </a>

          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.5 }}>
            Al instalar el atajo, iOS te pedirá tu Token. Pégalo y tu ecosistema estará conectado.
          </p>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* AC-04 · Notas de Calibración */}
        {/* ══════════════════════════════════════════════════ */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🧠</span>
            <h2 className="font-display" style={{ fontSize: '1.0625rem', fontWeight: 600 }}>
              Notas de Calibración del Sistema
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.375rem' }}>
                1. Privacidad Espacial (Ubicación)
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
                Al ejecutar el atajo por primera vez, iOS solicitará permiso de ubicación. Aura OS utiliza esta coordenada en milisegundos para dotar a la IA de contexto ambiental (ej. diferenciar un restaurante de un peaje). Si prefieres no compartirla, selecciona 'No permitir'. Nuestro motor seguirá funcionando impecablemente utilizando solo el contexto de tus palabras.
              </p>
            </div>

            <div style={{ height: '1px', background: 'var(--color-border)' }} />

            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.375rem' }}>
                2. Simulacros Manuales
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
                Si tocas el Atajo manualmente desde la app, verás un mensaje técnico indicando `amount requerido`. Esto es el sistema de seguridad protegiendo tu base de datos al no detectar un monto real. Para probar el sistema correctamente, usa la opción 'Compartir' desde una nota de texto que simule un Yape.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
