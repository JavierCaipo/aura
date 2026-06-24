'use client'

import {
  useEffect, useRef, useState, useCallback, useMemo
} from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  animate,
  MotionValue,
} from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

// ─────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────
function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max)
}

// ─────────────────────────────────────────────────────────────
// ANIMATED COUNTER
// ─────────────────────────────────────────────────────────────
function useCounter(target: number, duration = 1.8) {
  const [value, setValue] = useState(0)
  const triggered = useRef(false)
  const trigger = useCallback(() => {
    if (triggered.current) return
    triggered.current = true
    animate(0, target, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: setValue })
  }, [target, duration])
  return { value, trigger }
}

// ─────────────────────────────────────────────────────────────
// FLUID NOISE BACKGROUND — CSS multi-layer mesh
// ─────────────────────────────────────────────────────────────
function FluidBackground() {
  return (
    <div className="fluid-bg" aria-hidden>
      {/* SVG noise filter */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feBlend in="SourceGraphic" mode="multiply" result="blend" />
          <feComposite in="blend" in2="SourceGraphic" operator="in" />
        </filter>
      </svg>

      <div className="fluid-noise-layer" />

      {/* Animated gradient orbs */}
      <motion.div className="orb orb-1"
        animate={{ x: [0, 60, -30, 0], y: [0, -50, 35, 0], scale: [1, 1.15, 0.9, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div className="orb orb-2"
        animate={{ x: [0, -70, 45, 0], y: [0, 55, -30, 0], scale: [1, 0.88, 1.12, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
      <motion.div className="orb orb-3"
        animate={{ x: [0, 40, -60, 0], y: [0, -35, 50, 0], scale: [1, 1.08, 0.94, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
      />
      <motion.div className="orb orb-4"
        animate={{ x: [0, -30, 55, 0], y: [0, 40, -45, 0] }}
        transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut', delay: 12 }}
      />

      {/* Waveform lines */}
      <svg className="wave-svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <motion.path
          d="M0,160 C360,80 720,240 1080,160 C1260,120 1350,180 1440,160 L1440,320 L0,320 Z"
          fill="rgba(124,92,252,0.04)"
          animate={{ d: [
            "M0,160 C360,80 720,240 1080,160 C1260,120 1350,180 1440,160 L1440,320 L0,320 Z",
            "M0,180 C300,120 600,200 900,140 C1100,100 1320,200 1440,170 L1440,320 L0,320 Z",
            "M0,140 C420,200 700,80 1000,180 C1200,230 1380,100 1440,140 L1440,320 L0,320 Z",
            "M0,160 C360,80 720,240 1080,160 C1260,120 1350,180 1440,160 L1440,320 L0,320 Z",
          ]}}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M0,200 C480,140 960,260 1440,200 L1440,320 L0,320 Z"
          fill="rgba(94,234,212,0.025)"
          animate={{ d: [
            "M0,200 C480,140 960,260 1440,200 L1440,320 L0,320 Z",
            "M0,220 C360,180 720,260 1080,180 C1260,140 1380,220 1440,210 L1440,320 L0,320 Z",
            "M0,180 C500,250 900,130 1440,190 L1440,320 L0,320 Z",
            "M0,200 C480,140 960,260 1440,200 L1440,320 L0,320 Z",
          ]}}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        />
      </svg>

      {/* Grid overlay */}
      <div className="grid-overlay" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 3D TILT CARD — works with mouse AND touch
// ─────────────────────────────────────────────────────────────
interface TiltCardProps {
  children: React.ReactNode
  className?: string
  intensity?: number
  glowColor?: string
}

function TiltCard({ children, className = '', intensity = 12, glowColor = 'rgba(124,92,252,0.3)' }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const rotateX = useSpring(0, { stiffness: 300, damping: 30 })
  const rotateY = useSpring(0, { stiffness: 300, damping: 30 })
  const glowX = useMotionValue(50)
  const glowY = useMotionValue(50)
  const glowOpacity = useSpring(0, { stiffness: 200, damping: 25 })

  function getRelativePos(clientX: number, clientY: number) {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0.5, y: 0.5 }
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    }
  }

  function applyTilt(x: number, y: number) {
    rotateY.set((x - 0.5) * intensity * 2)
    rotateX.set((y - 0.5) * -intensity * 2)
    glowX.set(x * 100)
    glowY.set(y * 100)
    glowOpacity.set(0.8)
  }

  function resetTilt() {
    rotateX.set(0)
    rotateY.set(0)
    glowOpacity.set(0)
  }

  function onMouseMove(e: React.MouseEvent) {
    const { x, y } = getRelativePos(e.clientX, e.clientY)
    applyTilt(x, y)
  }

  function onTouchMove(e: React.TouchEvent) {
    const touch = e.touches[0]
    const { x, y } = getRelativePos(touch.clientX, touch.clientY)
    applyTilt(x, y)
  }

  return (
    <motion.div
      ref={cardRef}
      className={className}
      onMouseMove={onMouseMove}
      onMouseLeave={resetTilt}
      onTouchMove={onTouchMove}
      onTouchEnd={resetTilt}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        transformPerspective: 800,
        willChange: 'transform',
      }}
    >
      {/* Dynamic glow follows cursor/touch */}
      <motion.div
        style={{
          position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', zIndex: 0,
          background: `radial-gradient(280px circle at ${glowX}% ${glowY}%, ${glowColor}, transparent 70%)`,
          opacity: glowOpacity,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// CLIP-PATH REVEAL — text mask animation
// ─────────────────────────────────────────────────────────────
function ClipReveal({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <div ref={ref} style={{ overflow: 'hidden', display: 'block' }}>
      <motion.div
        className={className}
        initial={{ clipPath: 'inset(100% 0 0 0)', opacity: 0.4, y: 20 }}
        animate={inView ? { clipPath: 'inset(0% 0 0 0)', opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAGNETIC BUTTON
// ─────────────────────────────────────────────────────────────
function MagneticCTA({ href, children, id }: { href: string; children: React.ReactNode; id?: string }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useSpring(0, { stiffness: 180, damping: 22 })
  const y = useSpring(0, { stiffness: 180, damping: 22 })

  function onMove(e: React.MouseEvent) {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    x.set((e.clientX - r.left - r.width / 2) * 0.3)
    y.set((e.clientY - r.top - r.height / 2) * 0.3)
  }
  function onLeave() { x.set(0); y.set(0) }

  return (
    <motion.a
      ref={ref} href={href} id={id}
      style={{ x, y, display: 'inline-block', textDecoration: 'none' }}
      onMouseMove={onMove} onMouseLeave={onLeave}
      whileTap={{ scale: 0.95 }}
    >
      <div className="cta-pill">
        <span className="cta-pill-text">{children}</span>
        <div className="cta-pill-glow" />
        <motion.div
          className="cta-pill-shimmer"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
        />
      </div>
    </motion.a>
  )
}

// ─────────────────────────────────────────────────────────────
// DEMO CARD (Glassmorphism + animated counter)
// ─────────────────────────────────────────────────────────────
function DemoCard() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { value, trigger } = useCounter(150.5, 2)
  const [showBadge, setShowBadge] = useState(false)

  useEffect(() => {
    if (!inView) return
    trigger()
    const t = setTimeout(() => setShowBadge(true), 1400)
    return () => clearTimeout(t)
  }, [inView, trigger])

  return (
    <TiltCard
      glowColor="rgba(94,234,212,0.2)"
      intensity={8}
      className="demo-glass-card"
    >
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
        animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="live-dot" />
            <span style={{ fontSize: '0.6875rem', color: '#5eead4', fontWeight: 700, letterSpacing: '0.1em' }}>EN VIVO</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
            {new Date().toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })}
          </div>
        </div>

        {/* Label */}
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          Gastado este mes
        </p>

        {/* Big number */}
        <div className="font-display demo-amount">
          S/ {value.toFixed(2)}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '1.25rem 0' }} />

        {/* Transaction badge */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={showBadge ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="demo-tx-badge"
        >
          <div className="demo-tx-icon">⚡</div>
          <div>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff' }}>Pago registrado</p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Bodega Don Luis · S/ 150.50</p>
          </div>
          <span className="demo-tx-time">ahora</span>
        </motion.div>

        {/* Mini bar chart */}
        <div style={{ display: 'flex', gap: '0.3rem', marginTop: '1.25rem', alignItems: 'flex-end', height: 36 }}>
          {[0.3, 0.5, 0.4, 0.7, 0.6, 0.9, 1].map((h, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={inView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.8 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              style={{
                flex: 1, height: `${h * 100}%`,
                background: i === 6
                  ? 'linear-gradient(to top, #7c5cfc, #5eead4)'
                  : 'rgba(255,255,255,0.08)',
                borderRadius: '3px 3px 0 0',
                transformOrigin: 'bottom',
              }}
            />
          ))}
        </div>
      </motion.div>
    </TiltCard>
  )
}

// ─────────────────────────────────────────────────────────────
// FEATURE CARD with tilt + clip reveal
// ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon, title, body, accent, delay = 0
}: {
  icon: React.ReactNode; title: string; body: string; accent: string; delay?: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <TiltCard className="feat-card" glowColor={accent} intensity={10}>
        <div className="feat-icon-wrap">{icon}</div>
        <h3 className="font-display feat-title">{title}</h3>
        <p className="feat-body">{body}</p>
      </TiltCard>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// SCROLL PROGRESS BAR
// ─────────────────────────────────────────────────────────────
function ScrollBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40 })
  return (
    <motion.div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 100,
        background: 'linear-gradient(90deg, #7c5cfc, #5eead4)',
        scaleX, transformOrigin: '0%',
      }}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// FLOATING NAV
// ─────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <motion.nav
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed', top: scrolled ? 12 : 0, left: scrolled ? 16 : 0,
        right: scrolled ? 16 : 0, zIndex: 50,
        padding: '0.875rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderRadius: scrolled ? '1rem' : 0,
        background: scrolled ? 'rgba(9,9,11,0.85)' : 'rgba(9,9,11,0.6)',
        border: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
        borderBottom: scrolled ? undefined : '1px solid rgba(255,255,255,0.05)',
        transition: 'all 400ms cubic-bezier(0.16,1,0.3,1)',
        boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Image 
          src="/logo.png" 
          alt="Aura OS Logo" 
          width={36} 
          height={36} 
          className="rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)]"
          priority
        />
        <span className="text-xl font-bold tracking-tight text-white">
          Aura OS
        </span>
      </div>

      {/* CTA */}
      <Link href="/login" id="nav-login-btn" style={{
        fontSize: '0.875rem', fontWeight: 600,
        color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
        padding: '0.4375rem 1.125rem', borderRadius: '2rem',
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.04)',
        transition: 'all 200ms',
        display: 'flex', alignItems: 'center', gap: '0.375rem',
      }}
        onMouseEnter={e => {
          const el = e.currentTarget
          el.style.borderColor = 'rgba(124,92,252,0.5)'
          el.style.color = '#fff'
          el.style.background = 'rgba(124,92,252,0.1)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget
          el.style.borderColor = 'rgba(255,255,255,0.12)'
          el.style.color = 'rgba(255,255,255,0.75)'
          el.style.background = 'rgba(255,255,255,0.04)'
        }}
      >
        Ingresar <span style={{ opacity: 0.6 }}>→</span>
      </Link>
    </motion.nav>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.94])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.28], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80])

  const featRef = useRef(null)
  const featInView = useInView(featRef, { once: true, margin: '-80px' })

  const ctaRef = useRef(null)
  const ctaInView = useInView(ctaRef, { once: true, margin: '-80px' })

  return (
    <>
      <ScrollBar />
      <Nav />

      <main id="top" style={{ background: '#09090b', minHeight: '100dvh', overflowX: 'hidden', position: 'relative' }}>
        <FluidBackground />

        {/* ══════════════════════════════════════════ */}
        {/* HERO */}
        {/* ══════════════════════════════════════════ */}
        <section style={{
          position: 'relative', minHeight: '100dvh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 'clamp(7rem,14vw,11rem) 1.25rem 5rem',
          textAlign: 'center',
        }}>
          <motion.div
            style={{ scale: heroScale, opacity: heroOpacity, y: heroY, position: 'relative', zIndex: 1, maxWidth: 860, width: '100%' }}
          >
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.375rem 1.125rem', borderRadius: '2rem',
                background: 'rgba(124,92,252,0.1)',
                border: '1px solid rgba(124,92,252,0.3)',
                marginBottom: '2.25rem',
                fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500,
              }}
            >
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ color: '#7c5cfc', fontSize: '0.625rem' }}
              >●</motion.span>
              Para usuarios de Yape en Perú · Gratuito
            </motion.div>

            {/* H1 with clip-path reveal */}
            <div style={{ marginBottom: '1.875rem' }}>
              <div style={{ overflow: 'hidden' }}>
                <motion.h1
                  className="font-display hero-h1"
                  initial={{ y: '102%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                  No solo gastes.
                </motion.h1>
              </div>
              <div style={{ overflow: 'hidden' }}>
                <motion.div
                  className="font-display hero-h1-accent"
                  initial={{ y: '102%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
                >
                  Invierte en quien
                </motion.div>
              </div>
              <div style={{ overflow: 'hidden' }}>
                <motion.div
                  className="font-display hero-h1-accent"
                  initial={{ y: '102%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
                >
                  quieres ser.
                </motion.div>
              </div>
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, filter: 'blur(8px)', y: 16 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ duration: 0.9, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="hero-subtitle"
            >
              Conecta tu iPhone. Paga. Aura OS construye tu imperio
              financiero en piloto automático, sin abrir una sola app.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <MagneticCTA href="/login" id="hero-cta-btn">Reclama tu futuro →</MagneticCTA>
              <motion.a
                href="#demo"
                whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.875rem 1.75rem', borderRadius: '0.875rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.5)', fontSize: '0.9375rem',
                  textDecoration: 'none', fontWeight: 500,
                  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                Ver cómo funciona ↓
              </motion.a>
            </motion.div>

            {/* Trust line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              style={{ marginTop: '3rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.02em' }}
            >
              Sin tarjeta de crédito · Listo en 2 minutos · Para siempre gratis
            </motion.p>
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)' }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 22, height: 36,
                border: '1.5px solid rgba(255,255,255,0.15)',
                borderRadius: 11,
                display: 'flex', justifyContent: 'center', paddingTop: 5,
              }}
            >
              <motion.div
                animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: 3, height: 7, background: 'rgba(255,255,255,0.4)', borderRadius: 2 }}
              />
            </motion.div>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════ */}
        {/* SCROLLYTELLING DEMO */}
        {/* ══════════════════════════════════════════ */}
        <section id="demo" style={{ padding: 'clamp(5rem,9vw,8rem) 1.25rem', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            {/* Section heading */}
            <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem,6vw,5rem)' }}>
              <ClipReveal delay={0}>
                <p style={{ fontSize: '0.75rem', color: '#7c5cfc', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>
                  Flujo de magia invisible
                </p>
              </ClipReveal>
              <ClipReveal delay={0.1}>
                <h2 className="font-display section-h2">
                  Pagas con Yape.<br />
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>Aura OS lo convierte en datos.</span>
                </h2>
              </ClipReveal>
            </div>

            {/* Two-column demo */}
            <div className="demo-grid">
              {/* Left: Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  {
                    n: '01', emoji: '📱', title: 'Pagas con Yape',
                    sub: '"Pagaste S/ 150.50 a Bodega Don Luis"',
                    delay: 0.1,
                  },
                  {
                    n: '02', emoji: '⚡', title: 'El Shortcut actúa',
                    sub: 'Extrae el monto y hace POST al webhook en segundo plano.',
                    delay: 0.22,
                  },
                  {
                    n: '03', emoji: '📊', title: 'Dashboard actualizado',
                    sub: 'Tu saldo refleja el gasto en menos de 3 segundos. Sin tocar nada.',
                    delay: 0.34,
                  },
                ].map(({ n, emoji, title, sub, delay }) => (
                  <ClipReveal key={n} delay={delay}>
                    <TiltCard className="step-card" glowColor="rgba(124,92,252,0.2)" intensity={6}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div className="step-icon-wrap">{emoji}</div>
                        <div>
                          <span style={{ fontSize: '0.625rem', color: '#7c5cfc', fontWeight: 800, letterSpacing: '0.1em' }}>{n}</span>
                          <h3 className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '0.1rem 0 0.25rem' }}>{title}</h3>
                          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.55 }}>{sub}</p>
                        </div>
                      </div>
                    </TiltCard>
                  </ClipReveal>
                ))}
              </div>

              {/* Right: Live card */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DemoCard />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════ */}
        {/* FEATURES */}
        {/* ══════════════════════════════════════════ */}
        <section ref={featRef} style={{ padding: 'clamp(5rem,9vw,8rem) 1.25rem', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem,6vw,5rem)' }}>
              <ClipReveal>
                <p style={{ fontSize: '0.75rem', color: '#5eead4', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>
                  Para quien piensa en el largo plazo
                </p>
              </ClipReveal>
              <ClipReveal delay={0.1}>
                <h2 className="font-display section-h2">
                  Diseñado para quien<br />
                  <span style={{
                    background: 'linear-gradient(135deg, #7c5cfc, #5eead4 60%, #f472b6)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>quiere más.</span>
                </h2>
              </ClipReveal>
            </div>

            <div className="feat-grid">
              <FeatureCard
                delay={0}
                accent="rgba(124,92,252,0.25)"
                icon={<ShortcutSVG />}
                title="Magia invisible"
                body="El Shortcut de iOS trabaja en silencio. Cada pago de Yape se registra antes de que guardes el teléfono. Tú solo vives."
              />
              <FeatureCard
                delay={0.1}
                accent="rgba(94,234,212,0.2)"
                icon={<RealtimeSVG />}
                title="Tu capital, iluminado"
                body="Dashboard en tiempo real con Supabase Realtime. Ves tu realidad financiera en vivo, no la de ayer."
              />
              <FeatureCard
                delay={0.2}
                accent="rgba(244,114,182,0.2)"
                icon={<InvestSVG />}
                title="Decisiones de alto calibre"
                body="Cuando sabes cuánto gastas exactamente, sabes cuánto puedes invertir. De sobrevivir a construir."
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════ */}
        {/* FINAL CTA */}
        {/* ══════════════════════════════════════════ */}
        <section ref={ctaRef} style={{ padding: 'clamp(6rem,12vw,10rem) 1.25rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Glow blob */}
          <div aria-hidden style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '50vw', height: '25vw', maxWidth: 700,
            background: 'radial-gradient(ellipse, rgba(124,92,252,0.12) 0%, transparent 70%)',
            filter: 'blur(40px)', pointerEvents: 'none',
          }} />

          <motion.div
            initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
            animate={ctaInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'relative' }}
          >
            <h2 className="font-display" style={{
              fontSize: 'clamp(2.25rem,6vw,4.5rem)', fontWeight: 700,
              lineHeight: 1.1, color: '#fff', marginBottom: '1.25rem',
            }}>
              Tu futuro financiero<br />
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>comienza hoy.</span>
            </h2>
            <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2.75rem' }}>
              Gratis. Sin fricción. Solo resultados.
            </p>
            <MagneticCTA href="/login" id="final-cta-btn">Comenzar gratis →</MagneticCTA>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════ */}
        {/* FOOTER */}
        {/* ══════════════════════════════════════════ */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '1.75rem 1.5rem',
          position: 'relative', zIndex: 1,
        }}>
          <div style={{
            maxWidth: 1080, margin: '0 auto',
            display: 'flex', flexWrap: 'wrap',
            alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          }}>
            <div className="flex items-center gap-2">
              <Image 
                src="/logo.png" 
                alt="Aura OS Logo" 
                width={24} 
                height={24} 
                className="rounded-md shadow-[0_0_10px_rgba(168,85,247,0.3)]"
              />
              <span className="font-display" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)' }}>
                Aura OS
              </span>
              <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.75rem' }}>V0.1</span>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href="/login" style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'color 200ms' }}
                onMouseEnter={e => { (e.currentTarget).style.color = '#fff' }}
                onMouseLeave={e => { (e.currentTarget).style.color = 'rgba(255,255,255,0.3)' }}
              >Ingresar</Link>
              <button
                id="back-to-top-btn"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.5rem',
                  padding: '0.375rem 0.875rem',
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: '0.8125rem', cursor: 'pointer', transition: 'all 200ms',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.color = '#fff'
                  el.style.borderColor = 'rgba(255,255,255,0.2)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.color = 'rgba(255,255,255,0.35)'
                  el.style.borderColor = 'rgba(255,255,255,0.08)'
                }}
              >↑ Volver arriba</button>
            </div>

            <p style={{ width: '100%', textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.15)', marginTop: '0.25rem' }}>
              Hecho con precisión en Lima, Perú.
            </p>
          </div>
        </footer>
      </main>

      {/* ══════════════════════════════════════════ */}
      {/* GLOBAL STYLES */}
      {/* ══════════════════════════════════════════ */}
      <style>{`
        /* ── Fluid background ── */
        .fluid-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
        }
        .fluid-noise-layer {
          position: absolute; inset: 0;
          background: #09090b;
        }
        .orb {
          position: absolute; border-radius: 50%;
          will-change: transform;
        }
        .orb-1 {
          width: clamp(300px, 55vw, 700px); height: clamp(300px, 55vw, 700px);
          top: -15%; left: -10%;
          background: radial-gradient(circle, rgba(109,40,217,0.22) 0%, rgba(79,70,229,0.08) 50%, transparent 70%);
          filter: blur(60px);
        }
        .orb-2 {
          width: clamp(200px, 45vw, 600px); height: clamp(200px, 45vw, 600px);
          top: 30%; right: -8%;
          background: radial-gradient(circle, rgba(94,234,212,0.12) 0%, transparent 70%);
          filter: blur(70px);
        }
        .orb-3 {
          width: clamp(180px, 38vw, 500px); height: clamp(180px, 38vw, 500px);
          bottom: -5%; left: 25%;
          background: radial-gradient(circle, rgba(124,92,252,0.14) 0%, transparent 70%);
          filter: blur(80px);
        }
        .orb-4 {
          width: clamp(150px, 30vw, 400px); height: clamp(150px, 30vw, 400px);
          top: 55%; left: 40%;
          background: radial-gradient(circle, rgba(244,114,182,0.07) 0%, transparent 70%);
          filter: blur(80px);
        }
        .wave-svg {
          position: absolute; bottom: 0; left: 0; right: 0; width: 100%;
          opacity: 0.6;
        }
        .grid-overlay {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 64px 64px;
        }

        /* ── Hero ── */
        .hero-h1 {
          font-size: clamp(2.75rem, 8vw, 5.75rem);
          font-weight: 800; line-height: 1.06;
          letter-spacing: -0.04em; color: #fff;
        }
        .hero-h1-accent {
          font-size: clamp(2.75rem, 8vw, 5.75rem);
          font-weight: 800; line-height: 1.06;
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, #a78bfa 0%, #5eead4 55%, #f472b6 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-subtitle {
          font-size: clamp(1rem, 2.25vw, 1.1875rem);
          color: rgba(255,255,255,0.5);
          max-width: 520px; margin: 0 auto 2.5rem;
          line-height: 1.7; letter-spacing: 0.005em;
        }

        /* ── CTA Pill ── */
        .cta-pill {
          position: relative; overflow: hidden;
          padding: 1px; border-radius: 0.875rem;
          background: linear-gradient(135deg, #7c5cfc 0%, #5eead4 50%, #f472b6 100%);
          cursor: pointer;
        }
        .cta-pill-text {
          display: block;
          background: #0d0d18;
          border-radius: calc(0.875rem - 1px);
          padding: 0.875rem 2rem;
          font-size: clamp(0.9375rem, 2vw, 1.0625rem);
          font-weight: 700; color: #fff; position: relative; z-index: 1;
          letter-spacing: -0.01em;
          transition: background 250ms;
        }
        .cta-pill:hover .cta-pill-text { background: #13132a; }
        .cta-pill-glow {
          position: absolute; inset: 0; border-radius: 0.875rem;
          background: linear-gradient(135deg, #7c5cfc, #5eead4);
          opacity: 0; filter: blur(20px);
          transition: opacity 350ms; z-index: 0;
        }
        .cta-pill:hover .cta-pill-glow { opacity: 0.55; }
        .cta-pill-shimmer {
          position: absolute; top: 0; bottom: 0; width: 60%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          z-index: 2; pointer-events: none; border-radius: 0.875rem;
        }

        /* ── Section headings ── */
        .section-h2 {
          font-size: clamp(1.875rem, 5vw, 3.25rem);
          font-weight: 800; line-height: 1.15;
          letter-spacing: -0.03em; color: #fff;
        }

        /* ── Demo grid ── */
        .demo-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 720px) {
          .demo-grid { grid-template-columns: 1fr 1fr; align-items: center; }
        }

        /* ── Step cards ── */
        .step-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1rem;
          padding: 1.25rem 1.375rem;
          position: relative; overflow: hidden;
          transition: border-color 300ms;
        }
        .step-card:hover { border-color: rgba(124,92,252,0.25); }
        .step-icon-wrap {
          width: 2.625rem; height: 2.625rem;
          border-radius: 0.75rem; flex-shrink: 0;
          background: rgba(124,92,252,0.1);
          border: 1px solid rgba(124,92,252,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.125rem;
        }

        /* ── Demo glass card ── */
        .demo-glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1.375rem;
          padding: 1.75rem 1.75rem 1.5rem;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.05) inset,
            0 12px 48px rgba(0,0,0,0.5),
            0 0 80px rgba(94,234,212,0.04);
          width: 100%; max-width: 320px;
          position: relative; overflow: hidden;
        }
        .demo-amount {
          font-size: clamp(2.25rem, 7vw, 3.25rem);
          font-weight: 800; line-height: 1.1;
          background: linear-gradient(135deg, #fff 40%, #5eead4);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .demo-tx-badge {
          display: flex; align-items: center; gap: 0.75rem;
          background: rgba(94,234,212,0.06);
          border: 1px solid rgba(94,234,212,0.15);
          border-radius: 0.75rem; padding: 0.75rem 0.875rem;
        }
        .demo-tx-icon {
          width: 2rem; height: 2rem; border-radius: 0.5rem;
          background: rgba(94,234,212,0.12);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.875rem; flex-shrink: 0;
        }
        .demo-tx-time {
          font-size: 0.6875rem; color: rgba(255,255,255,0.3);
          margin-left: auto; white-space: nowrap;
        }
        .live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #5eead4;
          animation: livePulse 2s infinite;
        }
        @keyframes livePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(94,234,212,0.5); }
          50% { box-shadow: 0 0 0 5px rgba(94,234,212,0); }
        }

        /* ── Feature cards ── */
        .feat-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width: 640px) {
          .feat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 960px) {
          .feat-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .feat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 1.125rem;
          padding: 1.75rem;
          position: relative; overflow: hidden;
          height: 100%;
          transition: border-color 350ms;
        }
        .feat-card:hover { border-color: rgba(255,255,255,0.14); }
        .feat-icon-wrap { margin-bottom: 1.125rem; }
        .feat-title { font-size: 1.0625rem; font-weight: 700; color: #fff; margin-bottom: 0.625rem; }
        .feat-body { font-size: 0.9rem; color: rgba(255,255,255,0.42); line-height: 1.7; }

        /* ── Smooth scrolling ── */
        html { scroll-behavior: smooth; }

        /* ── Touch optimization ── */
        * { -webkit-tap-highlight-color: transparent; }
        a, button { touch-action: manipulation; }
      `}</style>
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// SVG ICONS
// ─────────────────────────────────────────────────────────────
function ShortcutSVG() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill="rgba(124,92,252,0.12)" />
      <path d="M10 16h12M16 10l6 6-6 6" stroke="#7c5cfc" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function RealtimeSVG() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill="rgba(94,234,212,0.1)" />
      <circle cx="16" cy="16" r="3.5" fill="#5eead4" />
      <circle cx="16" cy="16" r="6.5" stroke="#5eead4" strokeWidth="1.5" strokeOpacity="0.4" />
      <circle cx="16" cy="16" r="9.5" stroke="#5eead4" strokeWidth="1" strokeOpacity="0.15" />
    </svg>
  )
}
function InvestSVG() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="9" fill="rgba(244,114,182,0.1)" />
      <polyline points="8,22 13,15 18,18 24,10" stroke="#f472b6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="21,10 24,10 24,13" stroke="#f472b6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
