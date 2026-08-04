import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@constants/routes'
import { Crown, AlertTriangle, Scissors } from 'lucide-react'
import { motion } from 'framer-motion'
import { EmptyState } from '@components/ui'
import { useAuthContext } from '@contexts/AuthContext'
import { getActiveSubscription } from '@services/subscription.service'
import { getActiveServices } from '@services/catalog.service'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@appFirebase/config'
import type { Subscription, SubscriptionPlan, Service } from '@appTypes/models'

const SubscriptionSkeleton = () => (
  <div className="px-4">
    <div className="relative overflow-hidden rounded-2xl bg-primary p-6 shadow-lg animate-pulse">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-white/10" />
          <div className="h-5 w-32 rounded bg-white/10" />
        </div>
        <div className="h-6 w-12 rounded-full bg-white/10" />
      </div>
      <div className="space-y-4">
        <div>
          <div className="h-3 w-24 rounded bg-white/10 mb-2" />
          <div className="h-8 w-12 rounded bg-white/10" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <div className="h-3 w-16 rounded bg-white/10" />
            <div className="h-3 w-24 rounded bg-white/10" />
          </div>
          <div className="h-2 w-full rounded-full bg-white/10" />
          <div className="mt-2 h-4 w-40 rounded bg-white/10" />
        </div>
      </div>
    </div>
  </div>
)

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate()
  const { customer } = useAuthContext()
  const [activeSub, setActiveSub] = useState<Subscription | null>(null)
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscription = useCallback(async () => {
    if (!customer?.id) return
    setIsLoading(true)
    setError(null)

    try {
      const [sub, servicesData] = await Promise.all([
        getActiveSubscription(customer.id),
        getActiveServices(),
      ])
      setActiveSub(sub)
      setServices(servicesData)

      if (sub) {
        const planRef = doc(db, 'subscriptionPlans', sub.planId)
        const planSnap = await getDoc(planRef)
        if (planSnap.exists()) {
          setPlan(planSnap.data() as SubscriptionPlan)
        }
      }
    } catch (err) {
      console.error('Failed to load subscription:', err)
      setError("Erreur lors du chargement de l'abonnement.")
    } finally {
      setIsLoading(false)
    }
  }, [customer?.id])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  // Calculate days remaining
  let daysRemaining = 0
  if (activeSub) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expDate = new Date(activeSub.expirationDate)
    const diffTime = Math.max(0, expDate.getTime() - today.getTime())
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Calculate percentage used for the progress bar based on time
  const timeProgress =
    plan && activeSub
      ? Math.max(0, 100 - (daysRemaining / plan.validityDays) * 100)
      : 0

  // Build service remaining list
  const serviceEntries =
    activeSub && plan
      ? (plan.servicesIncluded ?? []).map((entry) => ({
          name:
            services.find((s) => s.id === entry.serviceId)?.name ??
            entry.serviceId,
          total: entry.count,
          remaining:
            activeSub.remainingServices?.[entry.serviceId] ?? 0,
        }))
      : []

  return (
    <div className="flex min-h-screen flex-col bg-background pt-4 pb-28">
      <div className="px-6 mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary">
          Abonnement
        </h1>
        <p className="mt-1 text-sm text-gray-500">Gérez votre pass VIP.</p>
      </div>

      {isLoading ? (
        <SubscriptionSkeleton />
      ) : error ? (
        <div className="px-4">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-danger/10 p-6 text-center">
            <AlertTriangle className="mb-2 h-8 w-8 text-danger" />
            <p className="text-sm font-medium text-danger">{error}</p>
          </div>
        </div>
      ) : !activeSub || !plan ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <EmptyState
            icon={Crown}
            title="Aucun abonnement actif"
            message="Souscrivez à un abonnement en salon pour profiter d'avantages exclusifs et de coupes illimitées."
            actionLabel="Voir les offres"
            onAction={() => navigate(ROUTES.SUBSCRIPTIONS_CATALOG)}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="px-4"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111827] to-[#1f2937] p-6 text-white shadow-2xl">
            <div className="relative z-10">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur">
                    <Crown className="h-5 w-5 text-accent" />
                  </div>
                  <span className="font-heading text-lg font-bold">
                    {plan.name}
                  </span>
                </div>
                <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent border border-accent/20">
                  Actif
                </span>
              </div>
              
              <div className="space-y-6">
                {/* Per-service remaining */}
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-3">Services restants</p>
                  <div className="space-y-3">
                    {serviceEntries.map((entry) => {
                      const usedPct =
                        entry.total > 0
                          ? ((entry.total - entry.remaining) / entry.total) * 100
                          : 100
                      return (
                        <div key={entry.name}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Scissors className="h-3.5 w-3.5 text-accent" />
                              <span className="text-sm text-white/80">{entry.name}</span>
                            </div>
                            <span className="text-sm font-bold">
                              {entry.remaining}
                              <span className="text-xs text-gray-400 font-normal"> / {entry.total}</span>
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, usedPct)}%` }}
                              transition={{ duration: 0.8, delay: 0.1 }}
                              className="h-full bg-gradient-to-r from-accent to-[#d4af37] rounded-full"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-2 font-medium">
                    <span>Expiration</span>
                    <span className={daysRemaining <= 3 ? 'text-danger font-bold' : ''}>
                      {daysRemaining} Jours restants
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${timeProgress}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-accent to-[#d4af37] rounded-full" 
                    />
                  </div>
                  <p className="mt-2 text-sm font-medium text-white/90">
                    Valable jusqu'au {new Date(activeSub.expirationDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Background design */}
            <Crown className="absolute -bottom-10 -right-10 h-64 w-64 text-white/5" />
            <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-accent opacity-20 blur-[80px]" />
            <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white opacity-5 blur-[80px]" />
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default SubscriptionPage
