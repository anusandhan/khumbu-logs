import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { MountainSnow } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Khumbu Logs',
  description: 'An app that let`s you generate aggregated worklogs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className='grid grid-cols-1 space-2' >
          <div className='flex items-center gap-1.5'>
          <div className='flex w-6 h-6 p-1 bg-slate-200 rounded justify-center items-center'>
            <MountainSnow size={16}/>
          </div>
          <h4>Khumbu</h4>
          </div>
          <p className='text-slate-600'>
          Select a project or an individual to see the worklogs & summary
          </p>
        </nav>
        {children}
        </body>
    </html>
  )
}
