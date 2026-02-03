import Link from "next/link"

export default function Header() {
  return (
    <header className="bg-[#1A2E44] text-white py-4 px-6">
      <nav className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-black italic uppercase tracking-tighter text-lg hover:opacity-80 transition-opacity">
          CHIUSSI SERVICES
        </Link>
        <Link href="/tickets" className="text-[#00D4FF] font-bold hover:opacity-80 transition-opacity">
          Besoin d'aide ?
        </Link>
      </nav>
    </header>
  )
}
