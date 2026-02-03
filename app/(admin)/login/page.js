'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Lock, Mail } from "lucide-react"
import Link from 'next/link'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError("Identifiants incorrects")
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#1A2E44] text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-[#00D4FF] font-black italic mb-8 uppercase text-sm tracking-tighter">
          <ChevronLeft className="w-5 h-5 mr-1" /> Retour Accueil
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
          <h1 className="text-4xl font-black italic uppercase mb-8 tracking-tighter text-center">
            ADMIN <span className="text-[#00D4FF]">LOGIN</span>
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-4 flex items-center gap-2 text-gray-400">
                <Mail className="w-3 h-3 text-[#00D4FF]" /> Email
              </label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-black/20 outline-none focus:ring-2 focus:ring-[#00D4FF] font-bold transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-4 flex items-center gap-2 text-gray-400">
                <Lock className="w-3 h-3 text-[#00D4FF]" /> Mot de passe
              </label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-black/20 outline-none focus:ring-2 focus:ring-[#00D4FF] font-bold transition-all" />
            </div>

            {error && <div className="text-red-500 font-bold text-xs bg-red-500/10 p-4 rounded-xl italic border border-red-500/20">{error}</div>}

            <button disabled={loading} className="w-full bg-[#00D4FF] text-[#1A2E44] py-5 rounded-2xl font-black uppercase italic tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center shadow-xl shadow-[#00D4FF]/20">
              {loading ? "CONNEXION..." : "SE CONNECTER"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
