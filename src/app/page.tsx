'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  animate,
} from 'framer-motion'
import Link from 'next/link'

// ─────────────────────────────────────────────
// Animated counter hook
// ─────────────────────────────────────────────
function useCounter(target: number, duration = 1.5) {
  const [value, setValue] = useState(0)
  const triggered = useRef(false)

  const trigger = useCallback(() => {
    if (triggered.current) return
    triggered.current = true
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(v),
    })
    return controls.stop
  }, [target, duration])

  return { value, trigger }
}

// ─────────────────────────────────────────────
// Feature card with cursor spotlight
// ─────────────────────────────────────────────
function FeatureCard({
  icon,
  title,
  body,
  delay = 0,
}: {
  icon: React.ReactNode
  title: string
  body: string
  delay?: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  const ref2 = useRef(null)
  const inView = useInView(ref2, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref2}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="feature-card"
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {/* Spotlight */}
        <motion.div
          className="card-spotlight"
          style={{
            background: `radial-gradient(320px circle at ${mouseX}px ${mouseY}px, rgba(124,92,252,0.13), transparent 70%)`,
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="feature-icon">{icon}</div>
          <h3 className="feature-title font-display">{title}</h3>
          <p className="feature-body">{body}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// Scrollytelling demo card
// ─────────────────────────────────────────────
function DemoCard() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-120px' })
  const { value, trigger } = useCounter(150.5, 1.8)

  useEffect(() => {
    if (inView) trigger()
  }, [inView, trigger])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.92, y: 30 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card"
      style={{ padding: '2rem', minWidth: 260 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <div className="pulse-dot" />
        <span style={{ fontSize: '0.75rem', color: 'var(--color-brand-2)', fontWeight: 600, letterSpacing: '0.08em' }}>
          TIEMPO REAL
        </span>
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        Gastado este mes
      </p>
      <div
        className="font-display"
        style={{
          fontSize: 'clamp(2.25rem, 6vw, 3.25rem)',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #fff 40%, var(--color-brand-2))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1.1,
        }}
      >
        S/ {value.toFixed(2)}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1.2, duration: 0.5 }}
        style={{
          marginTop: '1.25rem',
          padding: '0.625rem 0.875rem',
          background: 'rgba(94,234,212,0.08)',
          border: '1px solid rgba(94,234,212,0.2)',
          borderRadius: '0.625rem',
          fontSize: '0.8125rem',
          color: 'var(--color-brand-2)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span>⚡</span> 1 transacción registrada
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// Animated mesh gradient background
// ─────────────────────────────────────────────
function MeshBackground() {
  return (
    <div aria-hidden className="mesh-bg">
      <motion.div
        className="mesh-orb mesh-orb-1"
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="mesh-orb mesh-orb-2"
        animate={{ x: [0, -50, 30, 0], y: [0, 40, -25, 0], scale: [1, 0.9, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
      <motion.div
        className="mesh-orb mesh-orb-3"
        animate={{ x: [0, 25, -40, 0], y: [0, -20, 30, 0], scale: [1, 1.05, 0.92, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────
// Grid particle background
// ─────────────────────────────────────────────
function GridLines() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }}
    />
  )
}

// ─────────────────────────────────────────────
// Magnetic CTA button
// ─────────────────────────────────────────────
function MagneticCTA({ href, children }: { href: string; children: React.ReactNode }) {
  const btnRef = useRef<HTMLAnchorElement>(null)
  const x = useSpring(0, { stiffness: 200, damping: 20 })
  const y = useSpring(0, { stiffness: 200, damping: 20 })

  function onMouseMove(e: React.MouseEvent) {
    const rect = btnRef.current?.getBoundingClientRect()
    if (!rect) return
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    x.set(dx * 0.25)
    y.set(dy * 0.25)
  }

  function onMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.a
      ref={btnRef}
      href={href}
      style={{ x, y, display: 'inline-block', textDecoration: 'none' }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileTap={{ scale: 0.96 }}
    >
      <div className="cta-btn font-display">
        <span className="cta-btn-inner">{children}</span>
        <div className="cta-btn-glow" />
      </div>
    </motion.a>
  )
}

// ─────────────────────────────────────────────
// Word reveal animation
// ─────────────────────────────────────────────
function RevealText({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(' ')
  return (
    <span className={className} style={{ display: 'inline' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: '100%', filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: '0%', filter: 'blur(0px)' }}
          transition={{
            duration: 0.7,
            delay: delay + i * 0.07,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ display: 'inline-block', overflow: 'hidden', marginRight: '0.25em' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0])

  const demoRef = useRef(null)
  const demoInView = useInView(demoRef, { once: true, margin: '-100px' })

  return (
    <>
      <GridLines />

      <main style={{ background: '#09090b', minHeight: '100dvh', position: 'relative', overflowX: 'hidden' }}>

        {/* ══════════════════════════════════════════════ */}
        {/* NAV */}
        {/* ══════════════════════════════════════════════ */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
            padding: '1.25rem 2rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(9,9,11,0.7)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '1.875rem', height: '1.875rem', borderRadius: '0.5rem',
                background: 'linear-gradient(135deg, #7c5cfc, #5b4bd4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.875rem', boxShadow: '0 2px 16px rgba(124,92,252,0.4)',
              }}
            >⚡</div>
            <span className="font-display" style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#fff' }}>
              Aura OS
            </span>
          </div>

          <Link
            href="/login"
            style={{
              fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none', padding: '0.5rem 1.125rem',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: '2rem',
              transition: 'all 200ms',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.color = '#fff'
              el.style.borderColor = 'rgba(124,92,252,0.5)'
              el.style.background = 'rgba(124,92,252,0.08)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.color = 'rgba(255,255,255,0.7)'
              el.style.borderColor = 'rgba(255,255,255,0.12)'
              el.style.background = 'transparent'
            }}
          >
            Ingresar →
          </Link>
        </motion.nav>

        {/* ══════════════════════════════════════════════ */}
        {/* HERO */}
        {/* ══════════════════════════════════════════════ */}
        <section
          style={{
            position: 'relative', minHeight: '100dvh',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: 'clamp(6rem, 12vw, 10rem) 1.5rem 4rem',
            textAlign: 'center',
          }}
        >
          <MeshBackground />

          <motion.div style={{ y: heroY, opacity: heroOpacity, position: 'relative', zIndex: 1, maxWidth: 820 }}>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.375rem 1rem', borderRadius: '2rem',
                background: 'rgba(124,92,252,0.1)',
                border: '1px solid rgba(124,92,252,0.25)',
                marginBottom: '2rem',
                fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500,
              }}
            >
              <span style={{ color: '#7c5cfc' }}>⚡</span>
              Exclusivo para usuarios de Yape en Perú
            </motion.div>

            {/* H1 */}
            <h1
              className="font-display"
              style={{
                fontSize: 'clamp(2.75rem, 7vw, 5.5rem)',
                fontWeight: 700, lineHeight: 1.08,
                letterSpacing: '-0.03em',
                color: '#fff',
                marginBottom: '1.75rem',
              }}
            >
              <RevealText text="No solo gastes." delay={0.1} />
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #7c5cfc 0%, #5eead4 60%, #f472b6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                <RevealText text="Invierte en quien" delay={0.35} />
                <br />
                <RevealText text="quieres ser." delay={0.6} />
              </span>
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                color: 'rgba(255,255,255,0.55)',
                maxWidth: 540, margin: '0 auto 2.5rem',
                lineHeight: 1.65,
              }}
            >
              Conecta tu iPhone. Paga. Aura OS construye tu imperio
              financiero en piloto automático, sin abrir una sola app.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <MagneticCTA href="/login">Reclama tu futuro →</MagneticCTA>
              <motion.a
                href="#demo"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.875rem 1.75rem', borderRadius: '0.75rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.6)', fontSize: '0.9375rem',
                  textDecoration: 'none', fontWeight: 500,
                  backdropFilter: 'blur(8px)',
                  transition: 'all 200ms',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.6)' }}
              >
                Ver demo ↓
              </motion.a>
            </motion.div>

            {/* Social proof */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              style={{ marginTop: '2.5rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)' }}
            >
              Gratuito para siempre · Sin tarjeta de crédito · Listo en 2 minutos
            </motion.p>
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)' }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 24, height: 38, border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', justifyContent: 'center', paddingTop: 6 }}
            >
              <motion.div
                animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: 3, height: 8, background: 'rgba(255,255,255,0.5)', borderRadius: 2 }}
              />
            </motion.div>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════ */}
        {/* SCROLLYTELLING DEMO */}
        {/* ══════════════════════════════════════════════ */}
        <section
          id="demo"
          ref={demoRef}
          style={{
            padding: 'clamp(4rem, 8vw, 7rem) 1.5rem',
            maxWidth: 1100, margin: '0 auto',
          }}
        >
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={demoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <p style={{ fontSize: '0.8125rem', color: '#7c5cfc', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              Cómo funciona
            </p>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
              Pagas. Aura OS lo registra.
              <br />
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>Tú ni lo notas.</span>
            </h2>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              alignItems: 'center',
            }}
          >
            {/* Left: Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                { step: '01', icon: '📱', title: 'Pagas con Yape', desc: '"Pagaste S/ 150.50 a Bodega Don Luis"', delay: 0.1 },
                { step: '02', icon: '🔗', title: 'El Shortcut lo intercepta', desc: 'En segundo plano, sin que toques nada más.', delay: 0.25 },
                { step: '03', icon: '⚡', title: 'Aura OS actualiza', desc: 'Tu saldo refleja el nuevo gasto en menos de 3 segundos.', delay: 0.4 },
              ].map(({ step, icon, title, desc, delay }) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -30 }}
                  animate={demoInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: 'flex', gap: '1rem', alignItems: 'flex-start',
                    padding: '1.25rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '0.875rem',
                  }}
                >
                  <div
                    style={{
                      width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem', flexShrink: 0,
                      background: 'rgba(124,92,252,0.12)', border: '1px solid rgba(124,92,252,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.125rem',
                    }}
                  >
                    {icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.6875rem', color: '#7c5cfc', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '0.25rem' }}>{step}</p>
                    <h3 className="font-display" style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#fff', marginBottom: '0.25rem' }}>{title}</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Right: Live dashboard card */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <DemoCard />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════ */}
        {/* FEATURES GRID */}
        {/* ══════════════════════════════════════════════ */}
        <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <FeatureLabel>Para personas que piensan en el futuro</FeatureLabel>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
              Diseñado para quien
              <br />
              <span style={{ background: 'linear-gradient(135deg, #7c5cfc, #5eead4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                quiere más.
              </span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <FeatureCard
              delay={0}
              icon={<ShortcutIcon />}
              title="Magia invisible"
              body="El Shortcut de iOS trabaja en silencio. Cada pago de Yape se registra antes de que guardes el teléfono. Tú solo vives."
            />
            <FeatureCard
              delay={0.12}
              icon={<RealtimeIcon />}
              title="Tu capital, iluminado"
              body="Dashboard en tiempo real. Supabase Realtime actualiza tu saldo sin recargar. Ves tu realidad financiera en vivo, no ayer."
            />
            <FeatureCard
              delay={0.24}
              icon={<InvestIcon />}
              title="Decisiones de alto calibre"
              body="Cuando sabes exactamente cuánto gastas, sabes exactamente cuánto puedes invertir. De la supervivencia a la estrategia."
            />
          </div>
        </section>

        {/* ══════════════════════════════════════════════ */}
        {/* CTA FINAL */}
        {/* ══════════════════════════════════════════════ */}
        <section
          style={{
            padding: 'clamp(5rem, 10vw, 9rem) 1.5rem',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Glow */}
          <div aria-hidden style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '40rem', height: '20rem',
            background: 'radial-gradient(ellipse, rgba(124,92,252,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <h2
              className="font-display"
              style={{
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                fontWeight: 700, lineHeight: 1.1,
                color: '#fff', marginBottom: '1.25rem',
              }}
            >
              Tu futuro financiero
              <br />
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>comienza hoy.</span>
            </h2>
            <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.45)', marginBottom: '2.5rem' }}>
              Gratis. Sin fricciones. Solo resultados.
            </p>
            <MagneticCTA href="/login">Comenzar gratis →</MagneticCTA>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════ */}
        {/* FOOTER */}
        {/* ══════════════════════════════════════════════ */}
        <footer
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '2rem 2rem',
            display: 'flex', flexWrap: 'wrap',
            alignItems: 'center', justifyContent: 'space-between',
            gap: '1rem',
            maxWidth: 1100, margin: '0 auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem',
              background: 'linear-gradient(135deg, #7c5cfc, #5b4bd4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem',
            }}>⚡</div>
            <span className="font-display" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)' }}>
              Aura OS
            </span>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8125rem' }}>— V0.1</span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link href="/login" style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.35)' }}
            >
              Ingresar
            </Link>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.5rem', padding: '0.375rem 0.75rem',
                color: 'rgba(255,255,255,0.4)', fontSize: '0.8125rem', cursor: 'pointer',
                transition: 'all 200ms',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fff'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
            >
              ↑ Volver arriba
            </button>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', width: '100%', textAlign: 'center', marginTop: '0.5rem' }}>
            Hecho con precisión en Lima, Perú.
          </p>
        </footer>
      </main>

      <style>{`
        /* Mesh background */
        .mesh-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
        .mesh-orb { position: absolute; border-radius: 50%; filter: blur(80px); }
        .mesh-orb-1 { width: 50vw; height: 50vw; top: -15%; left: -10%; background: radial-gradient(circle, rgba(124,92,252,0.18) 0%, transparent 70%); }
        .mesh-orb-2 { width: 40vw; height: 40vw; top: 20%; right: -10%; background: radial-gradient(circle, rgba(94,234,212,0.1) 0%, transparent 70%); }
        .mesh-orb-3 { width: 35vw; height: 35vw; bottom: -10%; left: 30%; background: radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 70%); }

        /* CTA button */
        .cta-btn { position: relative; padding: 1px; border-radius: 0.875rem; background: linear-gradient(135deg, #7c5cfc, #5eead4, #f472b6); cursor: pointer; }
        .cta-btn-inner { display: block; background: #0f0f17; border-radius: calc(0.875rem - 1px); padding: 0.875rem 2.25rem; font-size: 1rem; font-weight: 700; color: #fff; position: relative; z-index: 1; letter-spacing: -0.01em; }
        .cta-btn-glow { position: absolute; inset: 0; border-radius: 0.875rem; background: linear-gradient(135deg, #7c5cfc, #5eead4); opacity: 0; filter: blur(16px); transition: opacity 300ms; z-index: 0; }
        .cta-btn:hover .cta-btn-glow { opacity: 0.5; }
        .cta-btn:hover .cta-btn-inner { background: #13131f; }

        /* Glass card */
        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1.25rem;
          box-shadow: 0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
        }

        /* Feature cards */
        .feature-card {
          height: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1rem;
          padding: 1.75rem;
          cursor: default;
          transition: border-color 300ms;
        }
        .feature-card:hover { border-color: rgba(124,92,252,0.25); }
        .card-spotlight { position: absolute; inset: 0; border-radius: 1rem; pointer-events: none; transition: opacity 300ms; }
        .feature-icon { font-size: 2rem; margin-bottom: 1.125rem; }
        .feature-title { font-size: 1.0625rem; font-weight: 700; color: #fff; margin-bottom: 0.625rem; }
        .feature-body { font-size: 0.9rem; color: rgba(255,255,255,0.45); line-height: 1.65; }
      `}</style>
    </>
  )
}

// ─────────────────────────────────────────────
// Micro-components
// ─────────────────────────────────────────────
function FeatureLabel({ children }: { children: React.ReactNode }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      style={{
        fontSize: '0.8125rem', color: '#7c5cfc', fontWeight: 600,
        letterSpacing: '0.1em', marginBottom: '0.875rem', textTransform: 'uppercase',
      }}
    >
      {children}
    </motion.p>
  )
}

function ShortcutIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill="rgba(124,92,252,0.15)" />
      <path d="M9 14h10M14 9l5 5-5 5" stroke="#7c5cfc" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RealtimeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill="rgba(94,234,212,0.1)" />
      <circle cx="14" cy="14" r="3" fill="#5eead4" />
      <circle cx="14" cy="14" r="6" stroke="#5eead4" strokeWidth="1.5" strokeOpacity="0.4" />
      <circle cx="14" cy="14" r="9" stroke="#5eead4" strokeWidth="1" strokeOpacity="0.15" />
    </svg>
  )
}

function InvestIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill="rgba(244,114,182,0.1)" />
      <polyline points="7,19 12,13 16,16 21,9" stroke="#f472b6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="18,9 21,9 21,12" stroke="#f472b6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
