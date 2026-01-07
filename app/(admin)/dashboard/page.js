'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { LogOut, Trash2, CheckCircle, MapPin, Phone, Mail, RefreshCw, MessageSquare, Clock } from "lucide-react"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function DashboardPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push('/login')
      else fetchTickets()
    }
    check()
  }, [])

  async function fetchTickets() {
    setLoading(true)
    const { data } = await supabase.from('tickets').select('*').order('created_at', { ascending: false })
    if (data) setTickets(data)
    setLoading(false)
  }

  async function updateStatus(id, currentStatus) {
    const next = currentStatus === 'nouveau' ? 'terminé' : 'nouveau'
    await supabase.from('tickets').update({ status: next }).eq('id', id)
    fetchTickets()
  }

  async function deleteTicket(id) {
    if (confirm("Supprimer ?")) {
      await supabase.from('tickets').delete().eq('id', id)
      fetchTickets()
    }
  }

  return (
    <div className="min-h-screen bg-[#1A2E44] text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
            ADMIN <span className="text-[#00D4FF]">CONSOLE</span>
          </h1>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} 
            className="bg-red-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase italic tracking-widest hover:scale-105 transition-transform">
            DÉCONNEXION
          </button>
        </div>

        <div className="grid gap-8">
          {tickets.map((t) => (
            <div key={t.id} className={`bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 transition-all ${t.status === 'terminé' ? 'opacity-30' : 'hover:bg-white/[0.08]'}`}>
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-grow space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-[#00D4FF] text-[#1A2E44] px-4 py-1 rounded-full text-[10px] font-black uppercase italic tracking-widest">{t.service_type}</span>
                    <span className="text-gray-500 text-[10px] font-black uppercase italic flex items-center gap-1"><Clock size={12}/> {new Date(t.created_at).toLocaleDateString()}</span>
                  </div>

                  <h3 className="text-3xl font-black uppercase italic tracking-tighter">{t.full_name}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-y border-white/5 font-bold italic text-sm">
                    <div className="flex items-center gap-2 text-gray-400"><MapPin size={16} className="text-[#00D4FF]"/> {t.city}</div>
                    <div className="flex items-center gap-2 text-gray-400"><Phone size={16} className="text-[#00D4FF]"/> {t.phone}</div>
                    <div className="flex items-center gap-2 text-gray-400 truncate"><Mail size={16} className="text-[#00D4FF]"/> {t.email}</div>
                  </div>

                  <div className="bg-black/20 p-6 rounded-2xl italic text-gray-400 text-lg leading-relaxed border border-white/5">
                    "{t.description}"
                  </div>
                </div>

                <div className="flex lg:flex-col gap-4">
                  <button onClick={() => updateStatus(t.id, t.status)} className={`flex-1 p-5 rounded-2xl font-black transition-all hover:scale-105 flex items-center justify-center ${t.status === 'nouveau' ? 'bg-[#00D4FF] text-[#1A2E44]' : 'bg-green-500 text-white'}`}>
                    <CheckCircle size={24} />
                  </button>
                  <button onClick={() => deleteTicket(t.id)} className="flex-1 p-5 bg-white/5 border border-white/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all hover:scale-105 flex items-center justify-center">
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
