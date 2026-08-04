import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  setDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@appFirebase/config'
import { Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react'
import type { Service } from '@appTypes/models'
import { DragDropList } from '@components/admin/DragDropList'
import { AVAILABLE_ICONS, getIconComponent } from '@utils/iconMap'

const SEED_SERVICES = [
  // Homme
  { name: '[Homme] Coupe Classique', price: 10, durationMinutes: 30, description: 'Coupe classique pour homme', icon: 'Scissors', enabled: true },
  { name: '[Homme] Coupe Tendance', price: 20, durationMinutes: 45, description: 'Coupe tendance et stylisée', icon: 'Sparkles', enabled: true },
  { name: '[Homme] Barbe', price: 10, durationMinutes: 15, description: 'Taille de barbe', icon: 'CircleDot', enabled: true },
  { name: '[Homme] Coupe et Barbe', price: 15, durationMinutes: 45, description: 'Coupe et taille de barbe', icon: 'User', enabled: true },
  { name: '[Homme] Soin du Visage', price: 25, durationMinutes: 30, description: 'Soin du visage complet', icon: 'Droplets', enabled: true },
  { name: '[Homme] Soin Visage, Protéine & Coupe', price: 120, durationMinutes: 120, description: 'Soin visage, soin protéiné et coupe', icon: 'Star', enabled: true },
  // Enfant
  { name: '[Enfant] Coupe Classique', price: 10, durationMinutes: 30, description: 'Coupe classique pour enfant', icon: 'Baby', enabled: true },
  { name: '[Enfant] Coupe Tendance', price: 15, durationMinutes: 40, description: 'Coupe tendance pour enfant', icon: 'Star', enabled: true },
  { name: '[Enfant] Rasage Complet (Tête)', price: 5, durationMinutes: 15, description: 'Rasage à blanc', icon: 'CircleDot', enabled: true }
]

const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    durationMinutes: 30,
    description: '',
    enabled: true,
    icon: 'Scissors',
  })
  const [isSaving, setIsSaving] = useState(false)

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'services'), (snap) => {
      const data = snap.docs.map((d) => d.data() as Service)
      data.sort((a, b) => a.displayOrder - b.displayOrder)
      setServices(data)
      setIsLoading(false)
    })
    return () => unsub()
  }, [])

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service)
      setFormData({
        name: service.name,
        price: service.price,
        durationMinutes: service.durationMinutes,
        description: service.description,
        enabled: service.enabled,
        icon: service.icon,
      })
    } else {
      setEditingService(null)
      setFormData({
        name: '',
        price: 0,
        durationMinutes: 30,
        description: '',
        enabled: true,
        icon: 'Scissors',
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingService(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const serviceId = editingService?.id || doc(collection(db, 'services')).id
      const serviceData: Service = {
        id: serviceId,
        ...formData,
        displayOrder: editingService ? editingService.displayOrder : services.length,
      }
      await setDoc(doc(db, 'services', serviceId), serviceData)
      handleCloseDialog()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'services', id))
      setDeleteConfirmId(null)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression.')
    }
  }

  const handleReorder = async (newServices: Service[]) => {
    setServices(newServices)
    try {
      const batch = writeBatch(db)
      newServices.forEach((service, index) => {
        batch.update(doc(db, 'services', service.id), { displayOrder: index })
      })
      await batch.commit()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors du réordonnancement.')
    }
  }

  const handleSeed = async () => {
    try {
      setIsSaving(true)
      const batch = writeBatch(db)
      SEED_SERVICES.forEach((service, index) => {
        const ref = doc(collection(db, 'services'))
        batch.set(ref, {
          id: ref.id,
          ...service,
          displayOrder: index
        })
      })
      await batch.commit()
      alert('Services ajoutés avec succès !')
    } catch (error) {
      console.error(error)
      alert('Erreur lors de l\'ajout des services')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Chargement...</div>
  }

  return (
    <div className="p-4 md:p-6 pb-24 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-xl font-bold text-primary md:text-2xl">Services</h1>
          <p className="text-sm text-gray-500">Gérez les prestations et leurs prix.</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      <div className="mb-4 rounded-xl bg-accent/10 p-4 border border-accent/20 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-accent">Services actifs : {services.filter(s => s.enabled).length}</p>
          <p className="text-xs text-gray-600">Faites glisser les éléments pour modifier l'ordre d'affichage.</p>
        </div>
        {services.length === 0 && (
          <button
            onClick={handleSeed}
            disabled={isSaving}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-primary shadow-sm transition hover:bg-accent/90"
          >
            {isSaving ? 'Ajout en cours...' : 'Générer la liste par défaut'}
          </button>
        )}
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-gray-300 bg-gray-50">
          <p className="text-gray-500 font-medium">Aucun service trouvé.</p>
        </div>
      ) : (
        <DragDropList
          items={services}
          onReorder={handleReorder}
          renderItem={(service) => {
            const Icon = getIconComponent(service.icon)
            return (
              <div className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className={`font-semibold ${!service.enabled ? 'text-gray-400 line-through' : 'text-primary'}`}>
                      {service.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {service.price} TND • {service.durationMinutes} min
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenDialog(service)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(service.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10 text-danger transition-colors hover:bg-danger hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          }}
        />
      )}

      {/* Delete Dialog */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setDeleteConfirmId(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
                <AlertTriangle className="h-6 w-6 text-danger" />
              </div>
              <h3 className="mb-2 font-heading text-lg font-bold text-primary">Confirmer la suppression</h3>
              <p className="mb-6 text-sm text-gray-500">
                Êtes-vous sûr de vouloir supprimer ce service ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 rounded-xl bg-danger py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-danger/90"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create/Edit Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleCloseDialog}
            />
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="font-heading text-lg font-bold text-primary">
                  {editingService ? 'Modifier le service' : 'Nouveau service'}
                </h2>
                <button
                  onClick={handleCloseDialog}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="overflow-y-auto px-6 py-4">
                <form id="service-form" onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Nom</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-medium text-gray-700">Prix (TND)</label>
                      <input
                        required
                        type="number"
                        min={0}
                        step="0.1"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-medium text-gray-700">Durée (min)</label>
                      <input
                        required
                        type="number"
                        min={5}
                        step={5}
                        value={formData.durationMinutes}
                        onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 30 })}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Icône du service</label>
                    <div className="grid grid-cols-4 gap-2">
                      {AVAILABLE_ICONS.map((item) => {
                        const IconComponent = item.icon
                        const isSelected = formData.icon === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, icon: item.id })}
                            className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2 transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                : 'border-gray-100 bg-white text-gray-400 hover:border-gray-300'
                            }`}
                          >
                            <IconComponent className="h-5 w-5" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      required
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                    <span className="text-sm font-medium text-primary">Actif</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.enabled}
                      onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${
                        formData.enabled ? 'bg-accent' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                          formData.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </form>
              </div>

              <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                <button
                  type="submit"
                  form="service-form"
                  disabled={isSaving}
                  className="flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-primary/90 disabled:opacity-60"
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminServicesPage
