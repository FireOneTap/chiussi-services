'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Sun, Moon } from "lucide-react"

export default function LegalPage() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#1A2E44] text-white' : 'bg-gray-50 text-[#1A2E44]'}`}>
      <button onClick={() => setDarkMode(!darkMode)} className="fixed bottom-6 right-6 p-4 rounded-full bg-[#00D4FF] text-[#1A2E44] shadow-2xl z-50">
        {darkMode ? <Sun /> : <Moon />}
      </button>

      <nav className="p-6">
        <Link href="/" className="text-[#00D4FF] font-black italic flex items-center text-sm">
          <ChevronLeft className="mr-1 w-4 h-4" /> RETOUR ACCUEIL
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black mb-12 italic uppercase tracking-tighter">Mentions <span className="text-[#00D4FF]">Légales</span></h1>
        
        <div className={`space-y-8 font-medium leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <section>
            <h2 className={`text-xl font-black uppercase italic mb-4 ${darkMode ? 'text-white' : 'text-[#1A2E44]'}`}>1. Présentation de l'entreprise</h2>
            <p><strong>Nom :</strong> Alexis Chiussi / Chiussi Services</p>
            <p><strong>Siège social :</strong> 83310 La Garde-Freinet</p>
            <p><strong>Contact :</strong> alexischiussi@hotmail.com | 06 62 04 38 91</p>
            <p><strong>Statut :</strong> Entrepreneur Individuel (EI)</p>
          </section>

          <section>
            <h2 className={`text-xl font-black uppercase italic mb-4 ${darkMode ? 'text-white' : 'text-[#1A2E44]'}`}>2. Hébergement</h2>
            <p>Le site est hébergé par Vercel Inc., situé au 340 S Lemon Ave #4133 Walnut, CA 91789, USA.</p>
          </section>

          <section>
            <h2 className={`text-xl font-black uppercase italic mb-4 ${darkMode ? 'text-white' : 'text-[#1A2E44]'}`}>3. Protection des données (RGPD)</h2>
            <p>Les informations collectées via le formulaire (Nom, Email, Téléphone, Ville, Description) sont utilisées exclusivement pour répondre à vos demandes de devis et d'intervention. Elles sont stockées de manière sécurisée via Supabase.</p>
            <p>Conformément à la loi « informatique et libertés », vous pouvez exercer votre droit d'accès aux données vous concernant et les faire rectifier ou supprimer en contactant : alexischiussi@hotmail.com</p>
          </section>

          <section>
            <h2 className={`text-xl font-black uppercase italic mb-4 ${darkMode ? 'text-white' : 'text-[#1A2E44]'}`}>4. Prestations et Tarifs</h2>
            <p>Les tarifs indiqués sur le site sont donnés à titre indicatif. Un devis gratuit est systématiquement proposé pour toute intervention complexe.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
