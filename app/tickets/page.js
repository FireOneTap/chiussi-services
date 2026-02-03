'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Send, ChevronLeft, Laptop, Building2, FileText, 
  User, Mail, Phone, MessageSquare, Sun, Moon, MapPin, CheckCircle, AlertCircle
} from "lucide-react"

export default function TicketsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [service, setService] = useState('Particulier')
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState(null)
  const [csrfToken, setCSRFToken] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  // États pour les données du formulaire
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    city: '',
    description: ''
  })

  // Récupérer le token CSRF au chargement de la page
  const fetchCSRFToken = async () => {
    try {
      const response = await fetch('/api/csrf-token')
      const data = await response.json()
      if (data.token) {
        setCSRFToken(data.token)
      }
    } catch (err) {
      console.error('Erreur récupération token CSRF:', err)
      setError('Erreur de sécurité. Veuillez recharger la page.')
    }
  }

  // Appeler fetchCSRFToken au montage du composant
  useEffect(() => {
    fetchCSRFToken()
  }, [])

  const toggleDark = () => setDarkMode(!darkMode)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    // Valider le champ en temps réel
    validateField(name, value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Valider tous les champs avant submission
    validateAllFields()
    
    if (Object.keys(fieldErrors).length > 0) {
      setError('Veuillez corriger les erreurs dans le formulaire.')
      return
    }
    
    // Vérifier que le token CSRF est disponible
    if (!csrfToken) {
      setError('Erreur de sécurité. Veuillez recharger la page et réessayer.')
      return
    }

    setIsSending(true)
    setError(null)

    try {
      // Appeler l'API de validation server-side avec le token CSRF
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csrfToken: csrfToken,
          service_type: service,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          description: formData.description
        })
      })

      const result = await response.json()

      if (!response.ok) {
        // Erreur de validation ou serveur
        if (result.errors) {
          // Afficher les erreurs de validation
          const errorMessages = Object.values(result.errors).join('\n')
          setError(errorMessages)
        } else {
          setError(result.error || 'Une erreur est survenue. Veuillez réessayer.')
        }
        return
      }

      // Succès
      setIsSent(true)
    } catch (err) {
      console.error('Erreur:', err)
      setError('Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.')
    } finally {
      setIsSending(false)
    }
  }

  if (isSent) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-[#1A2E44] text-white' : 'bg-gray-50 text-[#1A2E44]'}`}>
        <div className="text-center p-12 bg-white dark:bg-white/5 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 max-w-md mx-6">
          <CheckCircle className="w-20 h-20 text-[#00D4FF] mx-auto mb-6" />
          <h2 className="text-3xl font-black uppercase italic mb-4">Ticket Envoyé !</h2>
          <p className="font-medium text-gray-500 mb-8 italic">Merci, j'ai bien reçu votre demande. Je vous recontacte rapidement sur le secteur du Golfe.</p>
          <Link href="/" className="bg-[#1A2E44] dark:bg-[#00D4FF] dark:text-[#1A2E44] text-white px-8 py-4 rounded-xl font-black uppercase italic tracking-widest inline-block shadow-lg hover:scale-105 transition-transform">
            RETOUR ACCUEIL
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#1A2E44] text-white' : 'bg-gray-50 text-[#1A2E44]'}`}>
      
      {/* BOUTON MODE SOMBRE */}
      <button onClick={toggleDark} className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl bg-[#00D4FF] text-[#1A2E44] hover:scale-110 transition-transform">
        {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>

      {/* NAV */}
      <nav className={`py-6 px-6 transition-colors ${darkMode ? 'bg-black/20' : 'bg-[#1A2E44]'}`}>
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="flex items-center text-[#00D4FF] font-black italic hover:opacity-80 transition-opacity text-sm tracking-tighter">
            <ChevronLeft className="mr-1 w-5 h-5" /> RETOUR ACCUEIL
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 italic uppercase tracking-tighter leading-none">
            OUVRIR UN <span className="text-[#00D4FF]">TICKET</span>
          </h1>
          <p className={`font-medium italic ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Dépannage et assistance sur La Garde-Freinet & le Golfe.
          </p>
        </div>

        {/* FORMULAIRE STYLE ORIGINAL */}
        <div className={`rounded-[2.5rem] shadow-2xl border p-8 md:p-12 transition-all ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'}`}>
          <form className="space-y-8" onSubmit={handleSubmit}>
            
            {/* SÉLECTION SERVICE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'Particulier', icon: <Laptop className="w-5 h-5" /> },
                { id: 'Professionnel', icon: <Building2 className="w-5 h-5" /> },
                { id: 'Administratif', icon: <FileText className="w-5 h-5" /> }
              ].map((t) => (
                <button 
                  key={t.id}
                  type="button" 
                  onClick={() => setService(t.id)} 
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-black uppercase text-xs italic ${service === t.id ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF]' : 'border-transparent bg-gray-100 dark:bg-white/5 text-gray-400'}`}
                >
                  {t.icon} {t.id}
                </button>
              ))}
            </div>

            {/* CHAMPS DE SAISIE */}
            <div className="grid md:grid-cols-2 gap-6">
              <InputGroup name="full_name" value={formData.full_name} onChange={handleChange} icon={<User className="w-4 h-4" />} label="Nom complet" placeholder="Jean Dupont" darkMode={darkMode} error={fieldErrors.full_name} />
              <InputGroup name="email" value={formData.email} onChange={handleChange} icon={<Mail className="w-4 h-4" />} label="Email" placeholder="jean@exemple.com" type="email" darkMode={darkMode} error={fieldErrors.email} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InputGroup name="phone" value={formData.phone} onChange={handleChange} icon={<Phone className="w-4 h-4" />} label="Téléphone" placeholder="06 .. .. .. .." darkMode={darkMode} error={fieldErrors.phone} />
              <InputGroup name="city" value={formData.city} onChange={handleChange} icon={<MapPin className="w-4 h-4" />} label="Ville" placeholder="La Garde-Freinet" darkMode={darkMode} error={fieldErrors.city} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-4 flex items-center">
                <MessageSquare className="w-3 h-3 mr-2 text-[#00D4FF]" /> Description du besoin
              </label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                required 
                rows="4" 
                className={`w-full px-6 py-4 rounded-2xl border outline-none focus:ring-2 transition-all font-medium ${fieldErrors.description ? 'border-red-400 focus:ring-red-400' : `focus:ring-[#00D4FF] ${darkMode ? 'border-white/10' : 'border-gray-100'}`} ${darkMode ? 'bg-black/20 text-white placeholder:text-gray-700' : 'bg-gray-50 text-[#1A2E44] placeholder:text-gray-300'}`} 
                placeholder="Expliquez brièvement votre problème..."
              ></textarea>
              {fieldErrors.description && <p className="text-red-500 text-xs font-bold italic ml-4">{fieldErrors.description}</p>}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 font-bold text-xs bg-red-50 dark:bg-red-500/10 p-4 rounded-xl italic">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <button 
              disabled={isSending}
              className="w-full bg-[#00D4FF] text-[#1A2E44] py-5 rounded-2xl font-black uppercase italic tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center shadow-xl shadow-[#00D4FF]/20 disabled:opacity-50"
            >
              {isSending ? "ENVOI EN COURS..." : "ENVOYER LA DEMANDE"} <Send className="ml-3 w-5 h-5" />
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

function InputGroup({ icon, label, placeholder, name, value, onChange, type = "text", darkMode, error }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest ml-4 flex items-center">
        <span className="text-[#00D4FF] mr-2">{icon}</span> {label}
      </label>
      <input 
        name={name}
        value={value}
        onChange={onChange}
        required 
        type={type} 
        placeholder={placeholder} 
        className={`w-full px-6 py-4 rounded-2xl border outline-none focus:ring-2 transition-all font-bold ${error ? 'border-red-400 focus:ring-red-400' : `focus:ring-[#00D4FF] ${darkMode ? 'border-white/10' : 'border-gray-100'}`} ${darkMode ? 'bg-black/20 text-white placeholder:text-gray-700' : 'bg-gray-50 text-[#1A2E44] placeholder:text-gray-300'}`} 
      />
      {error && <p className="text-red-500 text-xs font-bold italic ml-4">{error}</p>}
    </div>
  )
}
