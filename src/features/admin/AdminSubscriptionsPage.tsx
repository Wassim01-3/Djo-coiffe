import React, { useState, useEffect } from 'react'
import { Plus, Crown, Edit2, Trash2, Search, User, Scissors, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PrimaryButton } from '@components/buttons/PrimaryButton'
import { GhostButton } from '@components/buttons/GhostButton'
import {
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  assignSubscription,
  findUserByPhone,
} from '@services/subscription.service'
import { getActiveServices } from '@services/catalog.service'
import type {
  SubscriptionPlan,
  SubscriptionIncludedService,
  Service,
  User as AppUser,
} from '@appTypes/models'
import { useAuthContext } from '@contexts/AuthContext'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanFormState {
  name: string
  price: number
  servicesIncluded: SubscriptionIncludedService[]
  validityDays: number
  description: string
  enabled: boolean
  displayOrder: number
}

const emptyForm = (displayOrder = 0): PlanFormState => ({
  name: '',
  price: 0,
  servicesIncluded: [],
  validityDays: 30,
  description: '',
  enabled: true,
  displayOrder,
})

// ─── Service Entry Row ────────────────────────────────────────────────────────

const ServiceRow: React.FC<{
  entry: SubscriptionIncludedService
  services: Service[]
  usedServiceIds: string[]
  onChange: (entry: SubscriptionIncludedService) => void
  onRemove: () => void
}> = ({ entry, services, usedServiceIds, onChange, onRemove }) => {
  const available = services.filter(
    (s) => s.id === entry.serviceId || !usedServiceIds.includes(s.id),
  )

  return (
    <div className="flex items-center gap-2">
      <select
        value={entry.serviceId}
        onChange={(e) => onChange({ ...entry, serviceId: e.target.value })}
        className="flex-1 rounded-xl border border-gray-300 p-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        required
      >
        <option value="">-- Service --</option>
        {available.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        min="1"
        value={entry.count}
        onChange={(e) => onChange({ ...entry, count: Number(e.target.value) })}
        className="w-20 rounded-xl border border-gray-300 p-2.5 text-center text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        required
      />
      <button
        type="button"
        onClick={onRemove}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-danger/20 text-danger hover:bg-danger/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminSubscriptionsPage: React.FC = () => {
  const { adminUser } = useAuthContext()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)

  // Plan Form State
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [planForm, setPlanForm] = useState<PlanFormState>(emptyForm())

  // Assign Form State
  const [phoneSearch, setPhoneSearch] = useState('')
  const [foundUser, setFoundUser] = useState<AppUser | null>(null)
  const [searchError, setSearchError] = useState('')
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [plansData, servicesData] = await Promise.all([
        getSubscriptionPlans(),
        getActiveServices(),
      ])
      setPlans(plansData)
      setServices(servicesData)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenPlanDialog = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlanId(plan.id)
      setPlanForm({
        name: plan.name,
        price: plan.price,
        servicesIncluded: plan.servicesIncluded ?? [],
        validityDays: plan.validityDays,
        description: plan.description,
        enabled: plan.enabled,
        displayOrder: plan.displayOrder,
      })
    } else {
      setEditingPlanId(null)
      setPlanForm(emptyForm(plans.length))
    }
    setIsPlanDialogOpen(true)
  }

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    const validEntries = planForm.servicesIncluded.filter(
      (s) => s.serviceId && s.count > 0,
    )
    if (validEntries.length === 0) {
      alert('Ajoutez au moins un service à cet abonnement.')
      return
    }
    try {
      const payload = { ...planForm, servicesIncluded: validEntries }
      if (editingPlanId) {
        await updateSubscriptionPlan(editingPlanId, payload)
      } else {
        await createSubscriptionPlan(payload)
      }
      setIsPlanDialogOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeletePlan = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet abonnement ?')) {
      await deleteSubscriptionPlan(id)
      loadData()
    }
  }

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearchError('')
    setFoundUser(null)
    if (!phoneSearch) return
    try {
      const user = await findUserByPhone(phoneSearch)
      if (user) {
        setFoundUser(user)
      } else {
        setSearchError('Client introuvable avec ce numéro.')
      }
    } catch (err) {
      console.error(err)
      setSearchError('Erreur lors de la recherche.')
    }
  }

  const handleAssign = async () => {
    if (!foundUser || !selectedPlanId || !adminUser?.uid) return
    setIsAssigning(true)
    try {
      const plan = plans.find((p) => p.id === selectedPlanId)
      if (plan) {
        await assignSubscription(foundUser.id, plan, adminUser.uid)
        alert('Abonnement attribué avec succès !')
        setIsAssignDialogOpen(false)
        setPhoneSearch('')
        setFoundUser(null)
        setSelectedPlanId('')
      }
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'attribution.")
    } finally {
      setIsAssigning(false)
    }
  }

  // helper: service name by id
  const serviceName = (id: string) =>
    services.find((s) => s.id === id)?.name ?? id

  // used service ids in current form (to prevent duplicates)
  const usedServiceIds = planForm.servicesIncluded.map((s) => s.serviceId)

  const addServiceEntry = () => {
    setPlanForm((prev) => ({
      ...prev,
      servicesIncluded: [
        ...prev.servicesIncluded,
        { serviceId: '', count: 1 },
      ],
    }))
  }

  const updateServiceEntry = (
    index: number,
    entry: SubscriptionIncludedService,
  ) => {
    const updated = [...planForm.servicesIncluded]
    updated[index] = entry
    setPlanForm((prev) => ({ ...prev, servicesIncluded: updated }))
  }

  const removeServiceEntry = (index: number) => {
    const updated = planForm.servicesIncluded.filter((_, i) => i !== index)
    setPlanForm((prev) => ({ ...prev, servicesIncluded: updated }))
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary">
            Abonnements
          </h1>
          <p className="text-sm text-gray-500">
            Gérez les offres d'abonnement et attribuez-les aux clients.
          </p>
        </div>
        <div className="flex gap-3">
          <PrimaryButton
            onClick={() => setIsAssignDialogOpen(true)}
            className="flex items-center gap-2 bg-accent hover:bg-accent/90"
          >
            <User className="h-4 w-4" />
            Attribuer à un client
          </PrimaryButton>
          <PrimaryButton
            onClick={() => handleOpenPlanDialog()}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouvelle offre
          </PrimaryButton>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 w-full rounded-2xl bg-gray-100" />
          <div className="h-32 w-full rounded-2xl bg-gray-100" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative overflow-hidden rounded-2xl border p-6 ${
                plan.enabled
                  ? 'border-gray-200 bg-white'
                  : 'border-gray-200 bg-gray-50 opacity-70'
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${plan.enabled ? 'bg-accent/10' : 'bg-gray-200'}`}
                  >
                    <Crown
                      className={`h-5 w-5 ${plan.enabled ? 'text-accent' : 'text-gray-400'}`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">{plan.name}</h3>
                    <p className="text-sm font-bold text-accent">
                      {plan.price} DT
                    </p>
                  </div>
                </div>
                {!plan.enabled && (
                  <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-600">
                    Désactivé
                  </span>
                )}
              </div>

              {/* Services list */}
              <div className="mb-4 space-y-1.5">
                {(plan.servicesIncluded ?? []).map((entry) => (
                  <div
                    key={entry.serviceId}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Scissors className="h-3.5 w-3.5 text-accent shrink-0" />
                    <span className="text-gray-700 font-medium">
                      {entry.count}×
                    </span>
                    <span className="text-gray-500">
                      {serviceName(entry.serviceId)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-1 border-t border-gray-100 mt-2">
                  <span className="text-gray-500">Validité</span>
                  <span className="font-semibold text-primary">
                    {plan.validityDays} jours
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <GhostButton
                  onClick={() => handleOpenPlanDialog(plan)}
                  className="flex-1 border-gray-200"
                >
                  <Edit2 className="h-4 w-4 mr-2" /> Modifier
                </GhostButton>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-danger/20 text-danger hover:bg-danger/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Plan Dialog ── */}
      <AnimatePresence>
        {isPlanDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
              onClick={() => setIsPlanDialogOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative my-8 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            >
              <h2 className="mb-4 font-heading text-xl font-bold text-primary">
                {editingPlanId ? "Modifier l'offre" : 'Nouvelle offre'}
              </h2>
              <form onSubmit={handleSavePlan} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Nom de l'offre
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.name}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Price + Validity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Prix (DT)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={planForm.price}
                      onChange={(e) =>
                        setPlanForm({
                          ...planForm,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-gray-300 p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Validité (jours)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={planForm.validityDays}
                      onChange={(e) =>
                        setPlanForm({
                          ...planForm,
                          validityDays: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-gray-300 p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Services Included */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Services inclus
                    </label>
                    <button
                      type="button"
                      onClick={addServiceEntry}
                      disabled={
                        usedServiceIds.length >= services.length
                      }
                      className="flex items-center gap-1 rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent hover:bg-accent/20 disabled:opacity-40"
                    >
                      <Plus className="h-3 w-3" />
                      Ajouter
                    </button>
                  </div>

                  {planForm.servicesIncluded.length === 0 && (
                    <p className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-400">
                      Aucun service ajouté. Cliquez sur "Ajouter".
                    </p>
                  )}

                  <div className="space-y-2">
                    {planForm.servicesIncluded.map((entry, idx) => (
                      <ServiceRow
                        key={idx}
                        entry={entry}
                        services={services}
                        usedServiceIds={usedServiceIds.filter(
                          (_, i) => i !== idx,
                        )}
                        onChange={(e) => updateServiceEntry(idx, e)}
                        onRemove={() => removeServiceEntry(idx)}
                      />
                    ))}
                  </div>

                  <p className="mt-1 text-xs text-gray-400">
                    Le nombre indique combien de fois ce service est inclus.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={planForm.description}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, description: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-300 p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Display order */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    required
                    value={planForm.displayOrder}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        displayOrder: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-gray-300 p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Enabled */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={planForm.enabled}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, enabled: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="enabled"
                    className="text-sm font-medium text-gray-700"
                  >
                    Offre active
                  </label>
                </div>

                <div className="mt-6 flex gap-3">
                  <GhostButton
                    type="button"
                    onClick={() => setIsPlanDialogOpen(false)}
                    className="flex-1 border-gray-200"
                  >
                    Annuler
                  </GhostButton>
                  <PrimaryButton type="submit" className="flex-1">
                    Enregistrer
                  </PrimaryButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Assign Dialog ── */}
      <AnimatePresence>
        {isAssignDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
              onClick={() => setIsAssignDialogOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            >
              <h2 className="mb-4 font-heading text-xl font-bold text-primary">
                Attribuer un abonnement
              </h2>

              {!foundUser ? (
                <form onSubmit={handleSearchUser} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Numéro de téléphone du client
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        required
                        value={phoneSearch}
                        onChange={(e) => setPhoneSearch(e.target.value)}
                        placeholder="Ex: 55123456"
                        className="flex-1 rounded-xl border border-gray-300 p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <PrimaryButton type="submit" className="px-4">
                        <Search className="h-5 w-5" />
                      </PrimaryButton>
                    </div>
                    {searchError && (
                      <p className="mt-2 text-sm text-danger">{searchError}</p>
                    )}
                  </div>
                  <GhostButton
                    type="button"
                    onClick={() => setIsAssignDialogOpen(false)}
                    className="mt-4 w-full border-gray-200"
                  >
                    Annuler
                  </GhostButton>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                    <p className="text-sm text-gray-500">Client trouvé</p>
                    <p className="font-semibold text-primary">
                      {foundUser.fullName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {foundUser.phoneNumber}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Choisir l'offre
                    </label>
                    <select
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Sélectionnez une offre...</option>
                      {plans
                        .filter((p) => p.enabled)
                        .map((plan) => {
                          const total = (plan.servicesIncluded ?? []).reduce(
                            (s, e) => s + e.count,
                            0,
                          )
                          return (
                            <option key={plan.id} value={plan.id}>
                              {plan.name} ({total} service(s) / {plan.price} DT)
                            </option>
                          )
                        })}
                    </select>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <GhostButton
                      onClick={() => {
                        setFoundUser(null)
                        setSelectedPlanId('')
                      }}
                      className="flex-1 border-gray-200"
                    >
                      Retour
                    </GhostButton>
                    <PrimaryButton
                      onClick={handleAssign}
                      disabled={!selectedPlanId || isAssigning}
                      className="flex-1"
                    >
                      {isAssigning ? 'Attribution...' : 'Confirmer'}
                    </PrimaryButton>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminSubscriptionsPage
