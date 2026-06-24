import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aura OS — Tu tracker de gastos Yape',
  description: 'Registra tus gastos de Yape automáticamente con un iOS Shortcut. Sin fricciones.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
