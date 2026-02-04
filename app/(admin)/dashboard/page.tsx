'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import { Session } from '@supabase/supabase-js'
import AdminCalendar from '../../../components/AdminCalendar'
import { error as logError } from '../../../lib/client-logger'
import { Search, MapPin, Phone, Mail, LogOut, AlertCircle } from "lucide-react"

export default function DashboardPage() {
  const [tickets, setTickets] = useState<any[]>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const router = useRouter() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setSession(session)
        fetchTickets()
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  async function fetchTickets() {
    try {
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('tickets')
        .select('*')
        .eq('status', 'nouveau')
        .order('created_at', { ascending: false })
      
      if (supabaseError) {
        logError('Erreur lors du chargement des tickets', supabaseError)
        setError('Impossible de charger les tickets. Veuillez rafraîchir la page.')
        setTickets([])
        return
      }
      
      if (data) {
        setTickets(data)
      }
    } catch (err) {
      logError('Erreur inattendue lors du fetch des tickets', err)
      setError('Une erreur inattendue s\'est produite. Veuillez réessayer.')
      setTickets([])
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="min-h-screen bg-[#1A2E44] text-white flex items-center justify-center">Chargement...</div>

  const filtered = tickets.filter(t => 
    t.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    t.city?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#1A2E44] text-white p-4 md:p-8 font-sans">
      <div className="max-w-[98%] mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-400 font-bold">Erreur</p>
              <p className="text-red-300 text-sm">{error}</p>
              <button 
                onClick={fetchTickets}
                className="mt-2 text-red-400 hover:text-red-300 font-bold text-sm underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">ADMIN <span className="text-[#00D4FF]">CONSOLE</span></h1>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-20" size={18}/>
              <input 
                className="bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 w-full focus:border-[#00D4FF] outline-none transition-all"
                placeholder="Rechercher un client..."
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 px-4 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all"
            >
              <LogOut size={18} /> Déconnexion
            </button>
          </div>
        </div>

        <div id="external-events" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-16">
          {filtered.map(t => (
            <div key={t.id} 
                 data-id={t.id} title={t.full_name} data-city={t.city} data-phone={t.phone} 
                 data-email={t.email} data-service={t.service_type} data-desc={t.description}
                 className="fc-event-ticket bg-white/5 border border-white/10 p-4 rounded-2xl cursor-grab border-l-4 border-l-[#00D4FF] hover:bg-white/10 transition-all flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black bg-[#00D4FF] text-[#1A2E44] px-2 py-0.5 rounded uppercase">{t.service_type}</span>
                <span className="text-[10px] font-bold opacity-40 uppercase flex items-center gap-1"><MapPin size={10}/> {t.city}</span>
              </div>
              <h3 className="font-black uppercase text-lg leading-none tracking-tight">{t.full_name}</h3>
              <p className="text-[11px] opacity-60 italic line-clamp-2 border-l border-white/10 pl-2">{t.description}</p>
              <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-bold"><Phone size={12} className="text-[#00D4FF]"/> {t.phone}</div>
                <div className="flex items-center gap-2 text-[10px] opacity-40"><Mail size={12}/> {t.email}</div>
              </div>
            </div>
          ))}
        </div>

        <AdminCalendar session={session} />
      </div>
    </div>
  )
}