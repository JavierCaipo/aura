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
  
  // Build full URL dynamically on client side to avoid `undefined/api...` bug
  const [webhookUrl, setWebhookUrl] = useState('')
  const [prodWebhookUrl, setProdWebhookUrl] = useState('')

  useEffect(() => {
    // Determine the base origin on the client
    const origin = window.location.origin
    setWebhookUrl(`${origin}/api/webhook/yape?token=${webhookToken}`)
    setProdWebhookUrl(`https://aura.tresapps.app/api/webhook/yape?token=${webhookToken}`)
  }, [webhookToken])

  async function handleCopy() {
    if (!webhookUrl) return
    try {
      await navigator.clipboard.writeText(webhookUrl)
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

  async function handleCopyProdWebhook() {
    if (!prodWebhookUrl) return
    try {
      await navigator.clipboard.writeText(prodWebhookUrl)
      setCopiedProd(true)
      setTimeout(() => setCopiedProd(false), 2500)
    } catch {
      if (webhookInputRef.current) {
        webhookInputRef.current.value = prodWebhookUrl
        webhookInputRef.current.select()
        document.execCommand('copy')
        webhookInputRef.current.value = webhookUrl // restore
        setCopiedProd(true)
        setTimeout(() => setCopiedProd(false), 2500)
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
        {/* SECCIÓN DE INSTALACIÓN */}
        {/* ══════════════════════════════════════════════════ */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            marginBottom: '1.25rem',
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
              Instalación de Aura OS
            </h2>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Descarga el atajo oficial en tu iPhone y copia la dirección del webhook para integrarlo.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a
              href="https://www.icloud.com/shortcuts/526d45e6717941858a1b2afaef93bf96"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, var(--color-brand) 0%, #5b4bd4 100%)',
                border: 'none',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 12px rgba(124,92,252,0.25)',
                transition: 'all 200ms',
                cursor: 'pointer',
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
              📲 Instalar en iOS
            </a>

            <button
              onClick={handleCopyProdWebhook}
              className="btn btn-copy"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.5rem',
                transition: 'all 200ms',
                cursor: 'pointer',
                color: 'var(--color-text)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              }}
            >
              {copiedProd ? '✓ ¡Copiado!' : '📋 Copiar Webhook (Prod)'}
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* AC-02 · Webhook URL Card */}
        {/* ══════════════════════════════════════════════════ */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🔗</span>
            <h2 className="font-display" style={{ fontSize: '1.0625rem', fontWeight: 600 }}>
              Tu URL de Webhook Local
            </h2>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
            Si estás desarrollando en local (usando ngrok, por ejemplo), puedes copiar esta URL.
          </p>

          <div className="webhook-field">
            <span className="webhook-url-text">{webhookUrl || 'Cargando...'}</span>
            <button
              id="copy-webhook-btn"
              onClick={handleCopy}
              disabled={!webhookUrl}
              className={`btn btn-copy${copied ? ' copied' : ''}`}
              aria-label="Copiar URL del webhook"
              style={{ flexShrink: 0 }}
            >
              {copied ? '✓ ¡Copiada!' : '📋 Copiar'}
            </button>
          </div>

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
              Guía de Instalación Rápida
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <Step
              number={1}
              icon="⬇️"
              title="Descarga el Shortcut"
              description="Abre el enlace de arriba desde tu iPhone para agregar el Shortcut de Yape a tu app Atajos."
              action={null}
            />

            <StepDivider />

            <Step
              number={2}
              icon="📋"
              title="Pega tu URL de Webhook"
              description='Al instalar el Shortcut, te pedirá tu URL. Cópiala con el botón "Copiar Webhook (Prod)" y pégala en el campo indicado.'
              action={null}
            />

            <StepDivider />

            <Step
              number={3}
              icon="🧪"
              title="Prueba el Shortcut"
              description='Abre Atajos → ejecuta "Registrar gasto Yape" → ingresa un monto. Tu Dashboard se actualizará en vivo.'
              action={null}
            />
          </div>
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
