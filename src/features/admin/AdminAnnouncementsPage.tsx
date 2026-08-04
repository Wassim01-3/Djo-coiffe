import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { db } from '@appFirebase/config'
import { Megaphone, Send, Users, X } from 'lucide-react'
import { createAnnouncement } from '@services/notification.service'
import type { Notification } from '@appTypes/models'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

const AdminAnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ title: '', message: '' })

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(50),
    )
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map((d) => d.data() as Notification)
      // Show only General / announcements
      setAnnouncements(all.filter((n) => n.type === 'General' || n.customerId === 'ALL'))
      setIsLoading(false)
    })
    return () => unsub()
  }, [])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.message.trim()) return
    setIsSending(true)
    try {
      await createAnnouncement(formData.title.trim(), formData.message.trim())
      toast.success('Annonce envoyée à tous les clients !')
      setFormData({ title: '', message: '' })
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error("Erreur lors de l'envoi de l'annonce.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="p-4 md:p-6 pb-24 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-primary md:text-2xl">Annonces</h1>
          <p className="mt-1 text-sm text-gray-500">
            Envoyez des annonces générales à tous vos clients.
          </p>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
          Nouvelle annonce
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 rounded-2xl border border-accent/20 bg-accent/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
            <Users className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-accent">
              {announcements.length} annonce{announcements.length !== 1 ? 's' : ''} envoyée{announcements.length !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-600">Chaque annonce est visible par tous les clients connectés.</p>
          </div>
        </div>
      </div>

      {/* Announcements list */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-16">
          <Megaphone className="mb-3 h-10 w-10 text-gray-300" />
          <p className="font-medium text-gray-500">Aucune annonce envoyée.</p>
          <p className="mt-1 text-sm text-gray-400">Créez votre première annonce pour vos clients.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {announcements.map((ann) => {
            const ms = ann.createdAt?.toMillis?.() ?? Date.now()
            return (
              <div key={ann.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Megaphone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-heading text-sm font-bold text-primary">{ann.title}</p>
                      <span className="text-[11px] text-gray-400">
                        {format(new Date(ms), 'd MMM yyyy, HH:mm', { locale: fr })}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">{ann.message}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                        <Users className="h-2.5 w-2.5" />
                        TOUS LES CLIENTS
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsDialogOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-md rounded-t-3xl bg-white px-6 pb-10 pt-5 shadow-2xl"
            >
              <div className="mb-1 flex h-1 w-10 rounded-full bg-gray-300 mx-auto" />
              <div className="mb-5 flex items-center justify-between pt-2">
                <h2 className="font-heading text-lg font-bold text-primary">Nouvelle annonce</h2>
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Titre</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Fermeture exceptionnelle"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Ex: Le salon sera fermé le samedi 15 pour cause de travaux."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
                  <p className="text-xs text-gray-600">
                    ⚡ Cette annonce sera envoyée et visible par <strong>tous les clients</strong> connectés dans leur centre de notifications.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-primary/90 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {isSending ? 'Envoi...' : 'Envoyer l\'annonce'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminAnnouncementsPage
