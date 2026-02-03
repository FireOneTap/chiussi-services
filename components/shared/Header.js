import Link from "next/link"

export default function Header() {
  return (
    <header style={{backgroundColor: "#1A2E44", color: "white", padding: "1rem"}}>
      <nav>
        <Link href="/" style={{fontWeight: "bold", marginRight: "1rem"}}>CHIUSSI SERVICES</Link>
        <Link href="/tickets" style={{color: "#00D4FF"}}>Besoin d aide ?</Link>
      </nav>
    </header>
  )
}
