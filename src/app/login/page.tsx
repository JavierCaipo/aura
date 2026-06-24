'use client'

import { sendMagicLink } from '@/app/actions/auth'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const hasAuthError = searchParams.get('error') === 'auth'

  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => sendMagicLink(formData),
    null
  )

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,92,252,0.12) 0%, transparent 70%), var(--color-bg)',
      }}
    >
      {/* Background grid */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: 0.3,
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, var(--color-brand), #5b4bd4)',
              boxShadow: '0 4px 24px rgba(124,92,252,0.4)',
              marginBottom: '1.25rem',
              fontSize: '1.5rem',
            }}
          >
            ⚡
          </div>
          <h1 className="font-display gradient-text" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Aura OS
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.9375rem' }}>
            Tu tracker de gastos Yape
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          {state?.success ? (
            // Success state
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
              <h2 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                ¡Revisa tu bandeja!
              </h2>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Te enviamos un enlace mágico. Haz clic en él para ingresar, sin contraseña.
              </p>
            </div>
          ) : (
            // Form state
            <form action={action} noValidate>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.375rem' }}>
                  Ingresa con tu email
                </h2>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
                  Te enviaremos un enlace mágico. Sin contraseña.
                </p>
              </div>

              {(hasAuthError) && (
                <div
                  role="alert"
                  style={{
                    background: 'rgba(248,113,113,0.1)',
                    border: '1px solid rgba(248,113,113,0.3)',
                    borderRadius: 'var(--radius-btn)',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    color: '#fca5a5',
                    marginBottom: '1rem',
                  }}
                >
                  El enlace expiró o es inválido. Intenta de nuevo.
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="email"
                  style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  required
                  className={`input${state?.error ? ' error' : ''}`}
                  aria-describedby={state?.error ? 'email-error' : undefined}
                />
                {state?.error && (
                  <p id="email-error" role="alert" style={{ color: '#fca5a5', fontSize: '0.8125rem', marginTop: '0.375rem' }}>
                    {state.error}
                  </p>
                )}
              </div>

              <button
                id="send-magic-link-btn"
                type="submit"
                disabled={pending}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8125rem' }}
              >
                {pending ? (
                  <><span className="spinner" /> Enviando…</>
                ) : (
                  <>✨ Enviar enlace mágico</>
                )}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--color-muted)' }}>
          Al ingresar, aceptas nuestros términos de uso.
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
