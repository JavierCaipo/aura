'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

const AppleIcon = () => (
  <svg style={{ width: '1.25rem', height: '1.25rem' }} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.54 9.103 1.51 12.06 1.005 1.45 2.176 3.074 3.747 3.014 1.52-.06 2.087-.975 3.923-.975 1.819 0 2.348.975 3.939.94 1.623-.027 2.66-1.478 3.649-2.923 1.144-1.674 1.614-3.291 1.637-3.376-.035-.015-3.149-1.206-3.183-4.783-.028-2.985 2.445-4.417 2.559-4.484-1.397-2.053-3.562-2.288-4.325-2.336-2.023-.162-3.953 1.233-4.978 1.233zM16.143 3.535c.879-1.071 1.468-2.562 1.306-4.048-1.272.05-2.812.846-3.725 1.912-.816.945-1.531 2.456-1.341 3.917 1.42.11 2.879-.714 3.76-1.781z" />
  </svg>
)

const GoogleIcon = () => (
  <svg style={{ width: '1.25rem', height: '1.25rem' }} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.664 0-8.472-3.793-8.472-8.471 0-4.677 3.808-8.47 8.472-8.47 2.036 0 3.89.774 5.3 2.06L20.5 1.096C18.28-.973 15.34-2 12.24-2 5.588-2 .096 3.491.096 10.143c0 6.65 5.492 12.143 12.144 12.143 6.96 0 11.57-4.89 11.57-11.785 0-.79-.09-1.562-.25-2.215H12.24z" />
  </svg>
)

function LoginContent() {
  const searchParams = useSearchParams()
  const hasAuthError = searchParams.get('error') === 'auth'
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null)

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    setLoadingProvider(provider)
    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback`
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      })
      if (error) {
        console.error('OAuth sign in error:', error)
        setLoadingProvider(null)
      }
    } catch (err) {
      console.error('Unexpected error during OAuth sign in:', err)
      setLoadingProvider(null)
    }
  }

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
        <div 
          className="card" 
          style={{ 
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.01)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <h2 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.375rem', color: '#fff' }}>
              Iniciar Sesión
            </h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
              Acceso instantáneo con tu proveedor preferido.
            </p>
          </div>

          {hasAuthError && (
            <div
              role="alert"
              style={{
                background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                color: '#fca5a5',
                marginBottom: '1.25rem',
                textAlign: 'center',
              }}
            >
              Hubo un problema al iniciar sesión. Inténtalo de nuevo.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {/* Apple OAuth Button */}
            <motion.button
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
              whileTap={{ scale: 0.99 }}
              disabled={loadingProvider !== null}
              onClick={() => handleOAuthSignIn('apple')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.875rem',
                borderRadius: '0.75rem',
                fontSize: '0.9375rem',
                fontWeight: 500,
                color: '#fff',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                opacity: loadingProvider !== null && loadingProvider !== 'apple' ? 0.5 : 1,
              }}
            >
              {loadingProvider === 'apple' ? (
                <>
                  <span className="spinner" />
                  <span>Conectando…</span>
                </>
              ) : (
                <>
                  <AppleIcon />
                  <span>Continuar con Apple</span>
                </>
              )}
            </motion.button>

            {/* Google OAuth Button */}
            <motion.button
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
              whileTap={{ scale: 0.99 }}
              disabled={loadingProvider !== null}
              onClick={() => handleOAuthSignIn('google')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.875rem',
                borderRadius: '0.75rem',
                fontSize: '0.9375rem',
                fontWeight: 500,
                color: '#fff',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                opacity: loadingProvider !== null && loadingProvider !== 'google' ? 0.5 : 1,
              }}
            >
              {loadingProvider === 'google' ? (
                <>
                  <span className="spinner" />
                  <span>Conectando…</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  <span>Continuar con Google</span>
                </>
              )}
            </motion.button>
          </div>
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
