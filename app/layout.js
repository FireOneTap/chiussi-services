import './globals.css'
import { Montserrat } from 'next/font/google'

const font = Montserrat({ subsets: ['latin'], weight: ['400', '700', '900'] })

export const metadata = {
  title: 'Chiussi Services | Dépannage Informatique Var 83',
  description: 'Assistance informatique et administrative dans le Var.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={font.className}>{children}</body>
    </html>
  )
}
