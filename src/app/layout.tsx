'use client'

import "./globals.css";
import { AuthProvider } from '@/lib/auth-context'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="icon" href="/logo.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="font-body text-body-md overflow-x-hidden bg-[#FAFAF5]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
