import React, { useState, useEffect } from 'react'
import { Crown, Scissors, Calendar } from 'lucide-react'
import { EmptyState } from '@components/ui'
import { getSubscriptionPlans } from '@services/subscription.service'
import type { SubscriptionPlan } from '@appTypes/models'

const SubscriptionsCatalogPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSubscriptionPlans()
      .then((data) => {
        setPlans(data.filter((p) => p.enabled))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

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
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                      <Crown className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-heading text-lg font-bold">{plan.name}</h3>
                  </div>
                  <div className="font-bold text-accent text-xl">
                    {plan.price} <span className="text-sm font-medium">DT</span>
                  </div>
                </div>

                <p className="mb-5 text-sm text-gray-300 leading-relaxed">
                  {plan.description}
                </p>

                <div className="flex gap-4">
                  <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 border border-white/10">
                    <Scissors className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-medium text-white/90">
                      {plan.haircutsIncluded} Coupes
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 border border-white/10">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-medium text-white/90">
                      {plan.validityDays} jours
                    </span>
                  </div>
                </div>
                
                <p className="mt-5 text-[10px] text-gray-400 text-center border-t border-white/10 pt-4 uppercase tracking-wider">
                  Demandez cet abonnement au salon
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SubscriptionsCatalogPage
