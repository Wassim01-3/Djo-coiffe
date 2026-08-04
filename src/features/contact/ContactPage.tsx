import React from 'react'
import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react'
import { PrimaryButton } from '@components/buttons/PrimaryButton'
import { GhostButton } from '@components/buttons/GhostButton'
import { useSettingsContext } from '@contexts/SettingsContext'

const DAY_LABELS: { key: string; label: string }[] = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
]

const ContactPage: React.FC = () => {
  const { settings, isOpenNow } = useSettingsContext()

  const phone = settings.phone
  const whatsapp = settings.whatsapp
  const facebook = settings.facebook
  const instagram = settings.instagram
  const address = settings.address
  const mapsUrl = settings.mapsUrl
  const openingHours = settings.openingHours
  const open = isOpenNow()

  return (
    <div className="flex min-h-screen flex-col bg-background pt-4 pb-12">
      <div className="px-6 mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary">Contact</h1>
        <p className="mt-1 text-sm text-gray-500">Nous sommes là pour vous.</p>
      </div>

      {/* Map Placeholder / Link */}
      <div className="mx-4 mb-6 h-48 rounded-2xl bg-gray-200 overflow-hidden relative shadow-inner">
        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80"
          alt="Map location"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 rounded-xl bg-white/90 px-4 py-3 shadow-md backdrop-blur">
            <MapPin className="h-6 w-6 text-accent" />
            <span className="font-semibold text-primary">{settings.shopName}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4">
        {/* Address */}
        <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-card">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
            <MapPin className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-primary">Adresse</h3>
            <p className="mt-1 text-sm text-gray-500">{address || 'Non renseignée'}</p>
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <GhostButton className="mt-3 h-8 px-4 text-xs font-semibold gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" /> Ouvrir dans Maps
                </GhostButton>
              </a>
            )}
          </div>
        </div>

        {/* Phone */}
        {(phone || whatsapp) && (
          <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-card">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <Phone className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary">Téléphone</h3>
              <p className="mt-1 text-sm font-medium text-gray-600">{phone || whatsapp}</p>
              <div className="mt-4 flex gap-2">
                {phone && (
                  <a href={`tel:${phone}`} className="flex-1">
                    <PrimaryButton className="h-9 w-full text-xs">Appeler</PrimaryButton>
                  </a>
                )}
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <GhostButton className="h-9 w-full text-xs bg-green-50 text-green-600 hover:bg-green-100">
                      WhatsApp
                    </GhostButton>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Opening Hours */}
        <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-card">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-primary">Horaires</h3>
                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  open
                    ? 'bg-success/10 text-success'
                    : 'bg-danger/10 text-danger'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${open ? 'bg-success' : 'bg-danger'}`} />
                  {open ? 'Ouvert' : 'Fermé'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                {DAY_LABELS.map(({ key, label }) => {
                  type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
                  const h = openingHours[key as DayKey]
                  if (!h) return null
                  return (
                    <div key={key} className="flex justify-between border-b border-gray-50 pb-1.5 last:border-0 last:pb-0">
                      <span className="text-gray-500">{label}</span>
                      {h.closed ? (
                        <span className="font-medium text-danger">Fermé</span>
                      ) : (
                        <span className="font-medium text-primary">{h.open} – {h.close}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

        {/* Social Links */}
        {(facebook || instagram || whatsapp) && (
          <div className="flex justify-center gap-4 pt-2">
            {facebook && (
              <a href={facebook} target="_blank" rel="noopener noreferrer">
                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm transition-transform hover:scale-110">
                  {/* Facebook SVG */}
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
              </a>
            )}
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer">
                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm transition-transform hover:scale-110">
                  {/* Instagram SVG gradient */}
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                    <defs>
                      <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
                        <stop offset="0%" stopColor="#fdf497" />
                        <stop offset="10%" stopColor="#fd5949" />
                        <stop offset="50%" stopColor="#d6249f" />
                        <stop offset="100%" stopColor="#285AEB" />
                      </radialGradient>
                    </defs>
                    <rect width="24" height="24" rx="5.8" fill="url(#ig-grad)" />
                    <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="4.8" fill="url(#ig-grad)" />
                    <circle cx="12" cy="12" r="4.2" stroke="white" strokeWidth="1.8" fill="none" />
                    <circle cx="17.2" cy="6.8" r="1.1" fill="white" />
                  </svg>
                </button>
              </a>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm transition-transform hover:scale-110">
                  {/* WhatsApp SVG */}
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </button>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ContactPage
