import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  setDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@appFirebase/config'
import { Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react'
import type { Barber } from '@appTypes/models'
import { DragDropList } from '@components/admin/DragDropList'

const AdminBarbersPage: React.FC = () => {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    seatNumber: 1,
    enabled: true,
  })
  const [isSaving, setIsSaving] = useState(false)

  // Delete dialog state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'barbers'), (snap) => {
      const data = snap.docs.map((d) => d.data() as Barber)
      data.sort((a, b) => a.displayOrder - b.displayOrder)
      setBarbers(data)
      setIsLoading(false)
    })
    return () => unsub()
  }, [])

  const handleOpenDialog = (barber?: Barber) => {
    if (barber) {
      setEditingBarber(barber)
      setFormData({
        name: barber.name,
        phone: barber.phone,
        seatNumber: barber.seatNumber,
        enabled: barber.enabled,
      })
    } else {
      setEditingBarber(null)
      setFormData({ name: '', phone: '', seatNumber: 1, enabled: true })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingBarber(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const barberId = editingBarber?.id || doc(collection(db, 'barbers')).id
      const barberData: Partial<Barber> = {
        id: barberId,
        name: formData.name,
        phone: formData.phone,
        seatNumber: formData.seatNumber,
        enabled: formData.enabled,
        displayOrder: editingBarber ? editingBarber.displayOrder : barbers.length,
        updatedAt: serverTimestamp() as any,
      }
      if (!editingBarber) {
        barberData.createdAt = serverTimestamp() as any
      }

      await setDoc(doc(db, 'barbers', barberId), barberData, { merge: true })
      handleCloseDialog()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'barbers', id))
      setDeleteConfirmId(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression.')
    }
  }

  const handleReorder = async (newBarbers: Barber[]) => {
    // Optimistic UI update
    setBarbers(newBarbers)
    // Batch update to Firestore
    try {
      const batch = writeBatch(db)
      newBarbers.forEach((barber, index) => {
        batch.update(doc(db, 'barbers', barber.id), { displayOrder: index })
      })
      await batch.commit()
    } catch (error) {
      console.error('Erreur lors du réordonnancement:', error)
      alert('Erreur lors du réordonnancement.')
    }
  }

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Chargement...</div>
  }

  return (
    <div className="p-4 md:p-6 pb-24 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-xl font-bold text-primary md:text-2xl">Coiffeurs</h1>
          <p className="text-sm text-gray-500">Gérez l'équipe et leur ordre d'affichage.</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      <div className="mb-4 rounded-xl bg-accent/10 p-4 border border-accent/20">
        <p className="text-sm font-semibold text-accent">Coiffeurs actifs : {barbers.filter(b => b.enabled).length}</p>
        <p className="text-xs text-gray-600">Faites glisser les éléments pour modifier l'ordre d'affichage sur l'application client.</p>
      </div>

      {barbers.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-gray-300 bg-gray-50">
          <p className="text-gray-500 font-medium">Aucun coiffeur trouvé.</p>
        </div>
      ) : (
        <DragDropList
          items={barbers}
          onReorder={handleReorder}
          renderItem={(barber) => (
            <div className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div>
                <p className={`font-semibold ${!barber.enabled ? 'text-gray-400 line-through' : 'text-primary'}`}>
                  {barber.name}
                </p>
                <p className="text-xs text-gray-500">
                  Tél: {barber.phone} • Chaise {barber.seatNumber}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenDialog(barber)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(barber.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10 text-danger transition-colors hover:bg-danger hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        />
      )}

      {/* ─── Delete Confirmation Dialog ─── */}
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
                Êtes-vous sûr de vouloir supprimer ce coiffeur ? Cette action est irréversible.
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

      {/* ─── Create/Edit Dialog ─── */}
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
                  {editingBarber ? 'Modifier le coiffeur' : 'Nouveau coiffeur'}
                </h2>
                <button
                  onClick={handleCloseDialog}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="overflow-y-auto px-6 py-4">
                <form id="barber-form" onSubmit={handleSave} className="space-y-4">
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
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Téléphone</label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Numéro de chaise</label>
                    <input
                      required
                      type="number"
                      min={1}
                      max={10}
                      value={formData.seatNumber}
                      onChange={(e) => setFormData({ ...formData, seatNumber: parseInt(e.target.value) || 1 })}
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
                  form="barber-form"
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

export default AdminBarbersPage
