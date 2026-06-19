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
      <body className="font-body text-body-md overflow-x-hidden bg-[#FAFAF5]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
