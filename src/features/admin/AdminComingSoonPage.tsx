import React from 'react'
import { useLocation } from 'react-router-dom'
import { Clock } from 'lucide-react'

const SECTION_LABELS: Record<string, string> = {
  '/admin/reservations': 'Réservations',
  '/admin/barbers': 'Coiffeurs',
  '/admin/services': 'Services',
  '/admin/products': 'Produits',
  '/admin/gallery': 'Galerie',
  '/admin/clients': 'Clients',
  '/admin/contact': 'Contact',
}

const AdminComingSoonPage: React.FC = () => {
  const location = useLocation()
  const label = SECTION_LABELS[location.pathname] ?? 'Cette section'

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
        <Clock className="h-8 w-8 text-accent" />
      </div>
      <h1 className="font-heading text-2xl font-bold text-primary">{label}</h1>
      <p className="mt-2 max-w-xs text-sm text-gray-500">
        Cette section sera disponible dans un prochain sprint.
      </p>
      <div className="mt-6 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm font-medium text-accent">
        En cours de développement
      </div>
    </div>
  )
}

export default AdminComingSoonPage
