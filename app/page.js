'use client'
import { useState } from 'react'
import Link from 'next/link'
import { 
  Laptop, ShieldCheck, Wifi, GraduationCap, Building2, 
  FileText, ChevronRight, Phone, Mail, MapPin, 
  HelpCircle, Sun, Moon, Clock 
} from "lucide-react"

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false)

  const toggleDark = () => setDarkMode(!darkMode)

  const services = [
    {
      title: "Particuliers",
      icon: <Laptop className="w-8 h-8 text-[#00D4FF]" />,
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop",
      items: [
        { name: "Diagnostic informatique", price: "45€", desc: "Analyse complète : lenteurs, pannes, virus, réseau." },
        { name: "Dépannage domicile", price: "65€/h", desc: "Intervention pour pannes logicielles ou matérielles." },
        { name: "Assistance à distance", price: "40€/h", desc: "Intervention rapide via connexion sécurisée." },
        { name: "Réinstallation OS", price: "80€", desc: "Sauvegarde, réinstallation Windows/Linux & pilotes." },
        { name: "Nettoyage & Optimisation", price: "60€", desc: "Suppression virus et optimisation du démarrage." },
        { name: "Installation Box & Wi-Fi", price: "70€", desc: "Configuration complète box, Wi-Fi et périphériques." },
        { name: "Sécurisation Wi-Fi", price: "50€", desc: "Mise en place de mots de passe et conseils sécurité." },
        { name: "Installation Imprimante", price: "40€", desc: "Connexion PC/Wi-Fi et tests de configuration." },
        { name: "Formation (1h)", price: "50€/h", desc: "Initiation : bureautique, Internet, sécurité." },
        { name: "Accompagnement Seniors", price: "45€/h", desc: "Assistance personnalisée, claire et bienveillante." }
      ],
      bonus: "50% de Crédit d'Impôt"
    },
    {
      title: "Professionnels",
      icon: <Building2 className={`w-8 h-8 ${darkMode ? 'text-white' : 'text-[#1A2E44]'}`} />,
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop",
      items: [
        { name: "Diagnostic sur site", price: "80€ HT", desc: "Analyse complète du poste, réseau ou logiciel." },
        { name: "Support sur site", price: "85€/h HT", desc: "Dépannage matériel, réseau, imprimantes." },
        { name: "Support à distance", price: "50€/h HT", desc: "Assistance rapide et sécurisée." },
        { name: "Installation poste", price: "90€ HT", desc: "Préparation PC, logiciels, messagerie pro." },
        { name: "Organisation & Sauvegardes", price: "80€ HT", desc: "Structuration, cloud, sauvegarde locale." },
        { name: "Sécurisation basique", price: "70€ HT", desc: "Antivirus, mises à jour, bonnes pratiques." }
      ],
      bonus: "Intervention Prioritaire"
    },
    {
      title: "Administratif",
      icon: <FileText className="w-8 h-8 text-[#00D4FF]" />,
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600&auto=format&fit=crop",
      items: [
        { name: "Saisie de documents", price: "35€/h", desc: "Courriers, tableaux, dossiers professionnels." },
        { name: "Classement numérique", price: "40€/h", desc: "Organisation, numérisation et archivage." },
        { name: "Gestion mails & agenda", price: "35€/h", desc: "Tri, planification, rappels et suivi." },
        { name: "Numérisation", price: "Sur devis", desc: "Passage au zéro papier de vos archives." }
      ],
      bonus: "Gestion à distance possible"
    }
  ]

  const faqs = [
    { q: "Comment bénéficier des 50% de crédit d'impôt ?", a: "En tant qu'entreprise de Services à la Personne, mes interventions de dépannage à domicile vous permettent de déduire 50% des sommes versées de vos impôts (selon plafond)." },
    { q: "Quels sont vos délais d'intervention ?", a: "J'interviens rapidement sous 24h à 48h, principalement à La Garde-Freinet et dans les communes limitrophes du Golfe." },
    { q: "Y a-t-il des frais de déplacement ?", a: "Le déplacement est offert sur La Garde-Freinet. Pour les autres communes du Golfe de Saint-Tropez, un forfait kilométrique réduit est appliqué." }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#1A2E44] text-white' : 'bg-white text-[#1A2E44]'}`}>
      
      <button onClick={toggleDark} className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl bg-[#00D4FF] text-[#1A2E44] hover:scale-110 transition-transform">
        {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>

      {/* 1. HERO SECTION */}
      <header className={`relative pt-20 pb-32 overflow-hidden transition-colors ${darkMode ? 'bg-black/20' : 'bg-[#1A2E44]'}`}>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#00D4FF]/5 skew-x-12 transform translate-x-1/4" />
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-white">
          <div className="inline-block bg-[#00D4FF] text-[#1A2E44] text-[10px] font-black px-3 py-1 rounded-full mb-6 uppercase tracking-widest">
            Golfe de Saint-Tropez • La Garde-Freinet
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-none italic uppercase">
            CHIUSSI <span className="text-[#00D4FF]">SERVICES</span><br/>DÉPANNAGE
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed font-medium">
            Votre expert en <strong>dépannage informatique à La Garde-Freinet</strong> et dans tout le Golfe de Saint-Tropez. Assistance de proximité pour particuliers et professionnels.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/tickets" className="bg-[#00D4FF] text-[#1A2E44] px-8 py-4 rounded-xl font-black text-center hover:scale-105 transition-transform flex items-center justify-center shadow-lg uppercase italic">
              DEMANDER UN DEVIS <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
            <a href="tel:0662043891" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-black text-center hover:bg-white/20 transition-all flex items-center justify-center italic">
              <Phone className="mr-2 w-5 h-5 text-[#00D4FF]" /> 06 62 04 38 91
            </a>
          </div>
        </div>
      </header>

      {/* 2. SERVICES SECTION */}
      <section className="py-24 max-w-6xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((s, idx) => (
            <div key={idx} className={`rounded-3xl shadow-xl border flex flex-col h-full overflow-hidden transition-all ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'}`}>
              <div className="h-32 overflow-hidden">
                <img src={s.image} className="w-full h-full object-cover opacity-60" />
              </div>
              <div className="p-8 flex-grow">
                <div className="mb-6">{s.icon}</div>
                <h3 className="text-xl font-black mb-6 uppercase italic">{s.title}</h3>
                <ul className="space-y-6 flex-grow">
                  {s.items.map((item, i) => (
                    <li key={i} className={`border-b pb-3 ${darkMode ? 'border-white/5' : 'border-gray-50'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-black ${darkMode ? 'text-gray-200' : 'text-[#1A2E44]'}`}>{item.name}</span>
                        <span className="font-black text-[#00D4FF] ml-2 text-sm">{item.price}</span>
                      </div>
                      <p className="text-[11px] font-medium leading-tight italic text-gray-400">
                        {item.desc}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-6 italic">
                  <span className="text-[10px] font-black text-[#00D4FF] uppercase tracking-wider bg-[#00D4FF]/10 px-3 py-2 rounded-full block text-center">
                    {s.bonus}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FAQ SECTION */}
      <section className="py-20 max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-center gap-3 mb-12">
          <HelpCircle className="w-6 h-6 text-[#00D4FF]" />
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-center">Questions Fréquentes</h2>
        </div>
        <div className="grid gap-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className={`p-6 rounded-2xl border transition-colors ${darkMode ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
              <h4 className={`font-black text-sm uppercase mb-2 italic ${darkMode ? 'text-[#00D4FF]' : 'text-[#1A2E44]'}`}>{faq.q}</h4>
              <p className="text-sm font-medium leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className={`py-20 text-white transition-colors ${darkMode ? 'bg-black/40' : 'bg-[#1A2E44]'}`}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-md">
            <h2 className="text-3xl font-black mb-4 uppercase italic tracking-tighter text-center md:text-left">Chiussi Services</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Spécialiste du dépannage informatique à <strong>La Garde-Freinet</strong>. Interventions sur Grimaud, Cogolin, Gassin, Saint-Tropez et tout le Golfe.
            </p>
          </div>
          <div className="flex flex-col gap-4 font-bold text-sm italic">
            <a href="mailto:alexischiussi@hotmail.com" className="flex items-center text-gray-300 hover:text-[#00D4FF] transition-colors">
              <Mail className="w-5 h-5 mr-4 text-[#00D4FF]" /> alexischiussi@hotmail.com
            </a>
            <a href="tel:0662043891" className="flex items-center text-gray-300 hover:text-[#00D4FF] transition-colors">
              <Phone className="w-5 h-5 mr-4 text-[#00D4FF]" /> 06 62 04 38 91
            </a>
            <div className="flex items-center text-gray-300">
              <MapPin className="w-5 h-5 mr-4 text-[#00D4FF]" /> 83310 La Garde-Freinet
            </div>
          </div>
        </div>
        
        {/* SECTION MENTIONS LÉGALES AJOUTÉE */}
        <div className="max-w-6xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-center">
          <Link href="/mentions" className="text-[10px] text-gray-500 hover:text-[#00D4FF] uppercase tracking-widest transition-colors font-bold">
            Mentions Légales & Politique de Confidentialité
          </Link>
        </div>
      </footer>
    </div>
  )
}
