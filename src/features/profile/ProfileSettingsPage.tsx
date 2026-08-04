import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Phone, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@appFirebase/config'
import { useAuthContext } from '@contexts/AuthContext'
import { ROUTES } from '@constants/routes'
import toast from 'react-hot-toast'

const ProfileSettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const { customer, updateCustomerState } = useAuthContext()

  const [fullName, setFullName] = useState(customer?.fullName || '')
  const [isSaving, setIsSaving] = useState(false)

  if (!customer) {
    return null
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fullName.trim()) {
      toast.error('Veuillez entrer votre nom')
      return
    }

    if (fullName.trim() === customer.fullName) {
      navigate(ROUTES.PROFILE)
      return
    }

    setIsSaving(true)
    try {
      const userRef = doc(db, 'users', customer.id)
      await updateDoc(userRef, { fullName: fullName.trim() })
      
      updateCustomerState({ ...customer, fullName: fullName.trim() })
      toast.success('Profil mis à jour avec succès')
      navigate(ROUTES.PROFILE)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-4 bg-white/80 px-4 py-4 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-600 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-lg font-bold text-primary">
          Paramètres
        </h1>
      </div>

      <div className="px-4 pt-6">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-card"
          >
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Nom Complet
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-gray-100 bg-gray-50 py-3 pl-11 pr-4 text-sm font-medium text-primary outline-none transition-colors focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/10"
                  placeholder="Votre nom complet"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Téléphone (Non modifiable)
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={customer.phoneNumber}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-gray-100 bg-gray-100 py-3 pl-11 pr-4 text-sm font-medium text-gray-500 opacity-70 outline-none"
                />
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Le numéro de téléphone sert d'identifiant et ne peut pas être modifié.
              </p>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-4 text-sm font-bold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent/90 disabled:opacity-70"
          >
            {isSaving ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Enregistrer les modifications
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  )
}

export default ProfileSettingsPage
