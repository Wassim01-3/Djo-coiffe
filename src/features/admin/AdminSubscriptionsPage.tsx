import React, { useState, useEffect } from 'react'
import { Plus, Crown, Edit2, Trash2, Search, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PrimaryButton } from '@components/buttons/PrimaryButton'
import { GhostButton } from '@components/buttons/GhostButton'
import { getSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan, assignSubscription, findUserByPhone } from '@services/subscription.service'
import type { SubscriptionPlan, User as AppUser } from '@appTypes/models'
import { useAuthContext } from '@contexts/AuthContext'

const AdminSubscriptionsPage: React.FC = () => {
  const { adminUser } = useAuthContext()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  
  // Plan Form State
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [planForm, setPlanForm] = useState({
    name: '',
    price: 0,
    haircutsIncluded: 0,
    validityDays: 30,
    description: '',
    enabled: true,
    displayOrder: 0
  })

  // Assign Form State
  const [phoneSearch, setPhoneSearch] = useState('')
  const [foundUser, setFoundUser] = useState<AppUser | null>(null)
  const [searchError, setSearchError] = useState('')
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)

  const loadPlans = async () => {
    setIsLoading(true)
    try {
      const data = await getSubscriptionPlans()
      setPlans(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPlans()
  }, [])

  const handleOpenPlanDialog = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlanId(plan.id)
      setPlanForm({
        name: plan.name,
        price: plan.price,
        haircutsIncluded: plan.haircutsIncluded,
        validityDays: plan.validityDays,
        description: plan.description,
        enabled: plan.enabled,
        displayOrder: plan.displayOrder
      })
    } else {
      setEditingPlanId(null)
      setPlanForm({
        name: '', price: 0, haircutsIncluded: 0, validityDays: 30, description: '', enabled: true, displayOrder: plans.length
      })
    }
    setIsPlanDialogOpen(true)
  }

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingPlanId) {
        await updateSubscriptionPlan(editingPlanId, planForm)
      } else {
        await createSubscriptionPlan(planForm)
      }
      setIsPlanDialogOpen(false)
      loadPlans()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeletePlan = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet abonnement ?')) {
      await deleteSubscriptionPlan(id)
      loadPlans()
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
      const plan = plans.find(p => p.id === selectedPlanId)
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
      alert('Erreur lors de l\'attribution.')
    } finally {
      setIsAssigning(false)
    }
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
                plan.enabled ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50 opacity-70'
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${plan.enabled ? 'bg-accent/10' : 'bg-gray-200'}`}>
                    <Crown className={`h-5 w-5 ${plan.enabled ? 'text-accent' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">{plan.name}</h3>
                    <p className="text-sm font-bold text-accent">{plan.price} DT</p>
                  </div>
                </div>
                {!plan.enabled && (
                  <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-600">
                    Désactivé
                  </span>
                )}
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Coupes incluses</span>
                  <span className="font-semibold text-primary">{plan.haircutsIncluded}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Validité</span>
                  <span className="font-semibold text-primary">{plan.validityDays} jours</span>
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

      {/* Plan Dialog */}
      <AnimatePresence>
        {isPlanDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            >
              <h2 className="mb-4 font-heading text-xl font-bold text-primary">
                {editingPlanId ? 'Modifier l\'offre' : 'Nouvelle offre'}
              </h2>
              <form onSubmit={handleSavePlan} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nom de l'offre</label>
                  <input
                    type="text"
                    required
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Prix (DT)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={planForm.price}
                      onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                      className="w-full rounded-xl border border-gray-300 p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Coupes incluses</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={planForm.haircutsIncluded}
                      onChange={(e) => setPlanForm({ ...planForm, haircutsIncluded: Number(e.target.value) })}
                      className="w-full rounded-xl border border-gray-300 p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Validité (jours)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={planForm.validityDays}
                      onChange={(e) => setPlanForm({ ...planForm, validityDays: Number(e.target.value) })}
                      className="w-full rounded-xl border border-gray-300 p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Ordre d'affichage</label>
                    <input
                      type="number"
                      required
                      value={planForm.displayOrder}
                      onChange={(e) => setPlanForm({ ...planForm, displayOrder: Number(e.target.value) })}
                      className="w-full rounded-xl border border-gray-300 p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={2}
                    value={planForm.description}
                    onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={planForm.enabled}
                    onChange={(e) => setPlanForm({ ...planForm, enabled: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
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

      {/* Assign Dialog */}
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
                    <label className="mb-1 block text-sm font-medium text-gray-700">Numéro de téléphone du client</label>
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
                    {searchError && <p className="mt-2 text-sm text-danger">{searchError}</p>}
                  </div>
                  <GhostButton
                    type="button"
                    onClick={() => setIsAssignDialogOpen(false)}
                    className="w-full border-gray-200 mt-4"
                  >
                    Annuler
                  </GhostButton>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                    <p className="text-sm text-gray-500">Client trouvé</p>
                    <p className="font-semibold text-primary">{foundUser.fullName}</p>
                    <p className="text-sm text-gray-600">{foundUser.phoneNumber}</p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Choisir l'offre</label>
                    <select
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Sélectionnez une offre...</option>
                      {plans.filter(p => p.enabled).map(plan => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} ({plan.haircutsIncluded} coupes / {plan.price} DT)
                        </option>
                      ))}
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
