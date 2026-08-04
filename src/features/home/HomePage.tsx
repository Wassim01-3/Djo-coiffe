import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Clock, Users, Star, ArrowRight, Gift, Crown } from 'lucide-react'
import { PrimaryButton } from '@components/buttons/PrimaryButton'
import { GhostButton } from '@components/buttons/GhostButton'
import { ROUTES } from '@constants/routes'
import { useAuthContext } from '@contexts/AuthContext'
import { useSettingsContext } from '@contexts/SettingsContext'
import { getActiveServices, getActiveBarbers } from '@services/catalog.service'
import { getActiveSubscription } from '@services/subscription.service'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@appFirebase/config'
import type { Subscription, Service, GalleryImage } from '@appTypes/models'
import logoFallback from '@assets/logo.png'
import { getIconComponent } from '@utils/iconMap'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { customer } = useAuthContext()
  const { settings, isOpenNow } = useSettingsContext()

  const [activeSub, setActiveSub] = useState<Subscription | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [galleryPreview, setGalleryPreview] = useState<GalleryImage[]>([])
  const [barberCount, setBarberCount] = useState<number | null>(null)

  useEffect(() => {
    getActiveServices().then(setServices).catch(console.error)
    getActiveBarbers().then((b) => setBarberCount(b.length)).catch(console.error)

    // Fetch last 6 gallery images for preview
    const q = query(collection(db, 'gallery'), orderBy('displayOrder'), limit(6))
    getDocs(q)
      .then((snap) => setGalleryPreview(snap.docs.map((d) => d.data() as GalleryImage)))
      .catch(console.error)

    if (customer?.id) {
      getActiveSubscription(customer.id)
        .then((sub) => setActiveSub(sub))
        .catch(console.error)
    }
  }, [customer?.id])

  const isLoyaltyEnabled = true
  const loyaltyCount = customer?.loyaltyCounter ?? 0
  const loyaltyTarget = 5
  const hasReward = customer?.rewardAvailable ?? false

  const isSubActive = !!activeSub

  // Calculate days remaining
  let daysRemaining = 0
  if (activeSub) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expDate = new Date(activeSub.expirationDate)
    const diffTime = Math.max(0, expDate.getTime() - today.getTime())
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const logoSrc = settings.logoUrl || logoFallback
  const shopName = settings.shopName || 'Djo Coiffe'

  return (
    <div className="flex flex-col pb-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary px-6 py-12 text-center text-white">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 space-y-6"
        >
          {/* Logo — transparent background */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center">
            <img
              src={logoSrc}
              alt={shopName}
              className="h-full w-full object-contain drop-shadow-lg"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).src = logoFallback
              }}
            />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">{shopName}</h1>
            <p className="mt-2 text-sm text-white/70">Professional Haircuts &amp; Grooming</p>
          </div>
          <div className="flex flex-col gap-3">
            <PrimaryButton onClick={() => navigate(ROUTES.RESERVATION)} className="h-12 w-full shadow-md">
              Réserver maintenant
            </PrimaryButton>
            <Link to={ROUTES.GALLERY}>
              <GhostButton className="h-12 w-full border-white/20 text-white hover:bg-white/10">
                Voir la galerie
              </GhostButton>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Availability Section */}
      <section className="px-4 pt-6">
        {(() => {
          const open = isOpenNow()
          const hours = settings.openingHours
          const now = new Date()
          const DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'] as const
          const todayKey = DAYS[now.getDay()]
          const todayHours = hours ? hours[todayKey] : null
          const reservationOn = settings.reservationEnabled

          return (
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-card">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`flex h-2.5 w-2.5 rounded-full ring-4 ${
                    open
                      ? 'bg-success ring-success/20'
                      : 'bg-danger ring-danger/20'
                  }`} />
                  <span className="font-semibold text-primary">
                    {open ? 'Ouvert maintenant' : 'Fermé actuellement'}
                  </span>
                </div>
                {todayHours && !todayHours.closed && (
                  <span className="text-xs text-gray-400">
                    {todayHours.open} – {todayHours.close}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-6 pt-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4 text-accent" />
                  <span>
                    {barberCount === null
                      ? 'Chargement...'
                      : barberCount === 0
                        ? 'Aucun coiffeur'
                        : `${barberCount} coiffeur${barberCount > 1 ? 's' : ''} disponible${barberCount > 1 ? 's' : ''}`}
                  </span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${
                  reservationOn ? 'text-gray-600' : 'text-gray-400 line-through'
                }`}>
                  <Clock className={`h-4 w-4 ${reservationOn ? 'text-accent' : 'text-gray-300'}`} />
                  <span>Réservation {reservationOn ? 'en ligne' : 'désactivée'}</span>
                </div>
              </div>
            </div>
          )
        })()}
      </section>

      {/* Subscription Banner (Conditional) */}
      {isSubActive && activeSub && (
        <section className="px-4 pt-6">
          <Link to={ROUTES.SUBSCRIPTIONS}>
            <motion.div
              whileTap={{ scale: 0.97 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-gray-800 p-5 shadow-md"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Crown className="h-4 w-4 text-accent" /> Pass VIP Actif
                  </h3>
                  <p className="mt-1 text-xs text-white/70">
                    Il vous reste {activeSub.remainingHaircuts} coupe{activeSub.remainingHaircuts > 1 ? 's' : ''} • {daysRemaining}j restants
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 shadow-inner">
                  <ArrowRight className="h-5 w-5 text-accent" />
                </div>
              </div>
              <Crown className="absolute -right-4 -top-4 h-24 w-24 text-white/5" />
            </motion.div>
          </Link>
        </section>
      )}

      {/* Loyalty Banner (Conditional) */}
      {isLoyaltyEnabled && customer && (
        <section className="px-4 pt-6">
          <Link to={ROUTES.LOYALTY}>
            <motion.div
              whileTap={{ scale: 0.97 }}
              className={`relative overflow-hidden rounded-2xl p-5 shadow-md ${
                hasReward ? 'bg-gradient-to-br from-[#C59D5F] to-[#b5952f]' : 'bg-accent'
              }`}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-primary">
                    {hasReward ? '🎉 Coupe gratuite disponible !' : 'Programme de Fidélité'}
                  </h3>
                  <p className="mt-1 text-xs text-primary/80">
                    {hasReward
                      ? 'Présentez votre QR code au coiffeur.'
                      : loyaltyCount === 0
                        ? 'Gagnez une coupe gratuite après 5 visites.'
                        : `Encore ${loyaltyTarget - loyaltyCount} coupe${loyaltyTarget - loyaltyCount > 1 ? 's' : ''} pour une gratuite !`}
                  </p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-full shadow-inner ${
                  hasReward ? 'bg-white/20' : 'bg-primary'
                }`}>
                  {hasReward ? (
                    <Gift className="h-6 w-6 text-white" />
                  ) : (
                    <span className="font-heading font-bold text-accent">
                      {loyaltyCount}/{loyaltyTarget}
                    </span>
                  )}
                </div>
              </div>
              <Star className="absolute -right-4 -top-4 h-24 w-24 text-white/20" />
            </motion.div>
          </Link>
        </section>
      )}

      {/* Services Preview */}
      {services.length > 0 && (
        <section className="pt-8">
          <div className="mb-4 flex items-center justify-between px-6">
            <h2 className="font-heading text-lg font-bold text-primary">Nos Services</h2>
            <button
              onClick={() => navigate(ROUTES.RESERVATION)}
              className="text-xs font-semibold text-accent flex items-center gap-1"
            >
              Réserver <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="hide-scrollbar flex gap-4 overflow-x-auto px-6 pb-2">
            {services.map((srv) => {
              const Icon = getIconComponent(srv.icon)
              return (
                <div
                  key={srv.id}
                  className="flex w-60 shrink-0 flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <span className="font-semibold text-primary">{srv.price} DT</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">{srv.name}</h3>
                    <p className="text-xs text-gray-400">{srv.durationMinutes} min</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Gallery Preview — dynamic */}
      {galleryPreview.length > 0 && (
        <section className="pt-8">
          <div className="mb-4 flex items-center justify-between px-6">
            <div>
              <h2 className="font-heading text-lg font-bold text-primary">Notre Galerie</h2>
              <p className="text-xs text-gray-400 mt-0.5">Nos meilleures réalisations</p>
            </div>
            <Link to={ROUTES.GALLERY} className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/20">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="hide-scrollbar flex gap-3 overflow-x-auto px-6 pb-2">
            {galleryPreview.map((img) => (
              <Link to={ROUTES.GALLERY} key={img.id} className="shrink-0">
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  className="group relative h-52 w-40 overflow-hidden rounded-2xl bg-gray-100 shadow-sm"
                >
                  <img
                    src={img.imageUrl}
                    alt={`Coupe ${img.category}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Category badge */}
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                    {img.category}
                  </span>
                </motion.div>
              </Link>
            ))}
            {/* "See all" card at end */}
            <Link to={ROUTES.GALLERY} className="shrink-0">
              <div className="flex h-52 w-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:border-accent/40 hover:text-accent">
                <ArrowRight className="h-5 w-5" />
                <span className="text-[11px] font-semibold text-center leading-tight">Voir<br/>tout</span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Contact Preview */}
      <section className="px-4 pt-8 pb-4">
        <div className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 overflow-hidden">
              <img
                src={logoSrc}
                alt={shopName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).src = logoFallback
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-primary">{shopName}</h3>
              <p className="text-xs text-gray-500">{settings.address || 'Tunis, Tunisie'}</p>
            </div>
          </div>
          <Link to={ROUTES.CONTACT}>
            <button className="rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-gray-200">
              Infos
            </button>
          </Link>
        </div>
      </section>

      {/* Filler for bottom nav */}
      <div className="h-6" />
    </div>
  )
}

export default HomePage
