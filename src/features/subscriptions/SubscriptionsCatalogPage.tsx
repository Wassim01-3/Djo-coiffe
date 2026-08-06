import React, { useState, useEffect } from 'react'
import { Crown, Scissors, Calendar } from 'lucide-react'
import { EmptyState } from '@components/ui'
import { getSubscriptionPlans } from '@services/subscription.service'
import { getActiveServices } from '@services/catalog.service'
import type { SubscriptionPlan, Service } from '@appTypes/models'

const SubscriptionsCatalogPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getSubscriptionPlans(), getActiveServices()])
      .then(([plansData, servicesData]) => {
        setPlans(plansData.filter((p) => p.enabled))
        setServices(servicesData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const serviceName = (id: string) =>
    services.find((s) => s.id === id)?.name ?? id

  return (
    <div className="flex min-h-screen flex-col bg-background pt-4">
      {/* Header */}
      <div className="px-6 mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary mb-1">
          Abonnements
        </h1>
        <p className="text-sm text-gray-500">
          Découvrez nos offres d'abonnement pour des avantages exclusifs.
        </p>
      </div>

      {/* Plans List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          icon={Crown}
          title="Aucune offre disponible"
          message="Revenez plus tard pour voir nos abonnements."
        />
      ) : (
        <div className="flex flex-col gap-5 px-4 pb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111827] to-[#1f2937] p-6 text-white shadow-2xl"
            >
              <div className="relative z-10">
                {/* Header */}
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                      <Crown className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-heading text-lg font-bold">
                      {plan.name}
                    </h3>
                  </div>
                  <div className="font-bold text-accent text-xl">
                    {plan.price}{' '}
                    <span className="text-sm font-medium">DT</span>
                  </div>
                </div>

                {/* Description */}
                {plan.description && (
                  <p className="mb-5 text-sm text-gray-300 leading-relaxed">
                    {plan.description}
                  </p>
                )}

                {/* Services */}
                {(plan.servicesIncluded ?? []).length > 0 && (
                  <div className="mb-5 space-y-2.5">
                    {(plan.servicesIncluded ?? []).map((entry) => (
                      <div
                        key={entry.serviceId}
                        className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-2.5 border border-white/10"
                      >
                        <Scissors className="h-4 w-4 text-accent shrink-0" />
                        <span className="text-sm text-white/90">
                          <span className="font-bold text-accent">
                            {entry.count}×
                          </span>{' '}
                          {serviceName(entry.serviceId)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Validity badge */}
                <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 border border-white/10 w-fit">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-medium text-white/90">
                    {plan.validityDays} jours
                  </span>
                </div>

                <p className="mt-5 text-[10px] text-gray-400 text-center border-t border-white/10 pt-4 uppercase tracking-wider">
                  Demandez cet abonnement au salon
                </p>
              </div>

              {/* Background glow */}
              <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-accent opacity-10 blur-[80px]" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SubscriptionsCatalogPage
