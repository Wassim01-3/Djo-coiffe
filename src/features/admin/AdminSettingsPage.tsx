import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@appFirebase/config'
import {
  Save,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { AppSettings, OpeningHours } from '@appTypes/models'

// ─── Constants ───────────────────────────────────────────────────────────────
const SETTINGS_DOC_ID = 'main'

const DAYS: Array<{ key: keyof OpeningHours; label: string }> = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
]

const DEFAULT_SETTINGS: Omit<AppSettings, 'id'> = {
  shopName: 'Djo Coiffe',
  logoUrl: '',
  phone: '',
  whatsapp: '',
  facebook: '',
  instagram: '',
  address: '',
  googleMapsUrl: '',
  latitude: 0,
  longitude: 0,
  openingHours: {
    monday: { open: '08:00', close: '20:00', closed: false },
    tuesday: { open: '08:00', close: '20:00', closed: false },
    wednesday: { open: '08:00', close: '20:00', closed: false },
    thursday: { open: '08:00', close: '20:00', closed: false },
    friday: { open: '08:00', close: '20:00', closed: false },
    saturday: { open: '08:00', close: '18:00', closed: false },
    sunday: { open: '08:00', close: '12:00', closed: true },
  },
  activeSeats: 4,
  reservationEnabled: true,
  galleryEnabled: true,
  productsEnabled: true,
  loyaltyEnabled: true,
  subscriptionEnabled: true,
  maintenanceMode: false,
  iosAppMessageEnabled: false,
  androidApkUrl: '',
  version: '1.0.0',
}

// ─── Toggle Row ───────────────────────────────────────────────────────────────
interface ToggleRowProps {
  label: string
  description?: string
  value: boolean
  onChange: (v: boolean) => void
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, description, value, onChange }) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
    <div>
      <p className="text-sm font-medium text-primary">{label}</p>
      {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${
        value ? 'bg-accent' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
)

// ─── Section Card ─────────────────────────────────────────────────────────────
interface SectionProps {
  title: string
  children: React.ReactNode
  collapsible?: boolean
}

const Section: React.FC<SectionProps> = ({ title, children, collapsible = false }) => {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => collapsible && setOpen((v) => !v)}
        className={`flex w-full items-center justify-between px-5 py-4 ${collapsible ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <h2 className="font-heading text-base font-bold text-primary">{title}</h2>
        {collapsible &&
          (open ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ))}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Omit<AppSettings, 'id'>>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const fetchSettings = useCallback(async () => {
    setIsLoading(true)
    try {
      const snap = await getDoc(doc(db, 'settings', SETTINGS_DOC_ID))
      if (snap.exists()) {
        const data = snap.data() as AppSettings
        // Remove the id from the state since we track it separately
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...rest } = data
        setSettings(rest)
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveStatus('idle')
    try {
      await setDoc(doc(db, 'settings', SETTINGS_DOC_ID), {
        id: SETTINGS_DOC_ID,
        ...settings,
      })
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (err) {
      console.error('Failed to save settings:', err)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const setField = <K extends keyof Omit<AppSettings, 'id'>>(
    key: K,
    value: Omit<AppSettings, 'id'>[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const setHours = (
    day: keyof OpeningHours,
    field: 'open' | 'close' | 'closed',
    value: string | boolean,
  ) => {
    setSettings((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value,
        },
      },
    }))
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 md:p-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-48 rounded-2xl bg-gray-100" />
        <div className="h-64 rounded-2xl bg-gray-100" />
        <div className="h-96 rounded-2xl bg-gray-100" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="p-4 space-y-4 pb-24 md:p-6 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-primary md:text-2xl">Paramètres</h1>
          <p className="mt-1 text-sm text-gray-500">Configuration générale de l'application.</p>
        </div>
        <motion.button
          type="submit"
          disabled={isSaving}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </motion.button>
      </div>

      {/* Save status */}
      {saveStatus === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm font-medium text-success"
        >
          ✓ Paramètres sauvegardés avec succès.
        </motion.div>
      )}
      {saveStatus === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
        >
          <AlertTriangle className="h-4 w-4" />
          Erreur lors de la sauvegarde. Réessayez.
        </motion.div>
      )}

      {/* General toggles */}
      <Section title="Général">
        <ToggleRow
          label="Mode Maintenance"
          description="Désactive l'application pour les clients."
          value={settings.maintenanceMode}
          onChange={(v) => setField('maintenanceMode', v)}
        />
        <ToggleRow
          label="Réservations activées"
          value={settings.reservationEnabled}
          onChange={(v) => setField('reservationEnabled', v)}
        />
        <ToggleRow
          label="Galerie activée"
          value={settings.galleryEnabled}
          onChange={(v) => setField('galleryEnabled', v)}
        />
        <ToggleRow
          label="Produits activés"
          value={settings.productsEnabled}
          onChange={(v) => setField('productsEnabled', v)}
        />
        <ToggleRow
          label="Programme de fidélité"
          value={settings.loyaltyEnabled}
          onChange={(v) => setField('loyaltyEnabled', v)}
        />
        <ToggleRow
          label="Abonnements"
          value={settings.subscriptionEnabled}
          onChange={(v) => setField('subscriptionEnabled', v)}
        />
        <ToggleRow
          label="Message installation iOS"
          value={settings.iosAppMessageEnabled}
          onChange={(v) => setField('iosAppMessageEnabled', v)}
        />
      </Section>

      {/* Shop details */}
      <Section title="Informations du salon">
        <div className="space-y-4">
          {[
            { key: 'shopName' as const, label: 'Nom du salon' },
            { key: 'phone' as const, label: 'Téléphone' },
            { key: 'whatsapp' as const, label: 'WhatsApp' },
            { key: 'facebook' as const, label: 'Facebook' },
            { key: 'instagram' as const, label: 'Instagram' },
            { key: 'address' as const, label: 'Adresse' },
            { key: 'googleMapsUrl' as const, label: 'Google Maps URL' },
            { key: 'androidApkUrl' as const, label: 'URL APK Android' },
            { key: 'version' as const, label: 'Version de l\'application' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
              <input
                type="text"
                value={String(settings[key] ?? '')}
                onChange={(e) => setField(key, e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Chaises actives (1–4)
            </label>
            <input
              type="number"
              min={1}
              max={4}
              value={settings.activeSeats}
              onChange={(e) => setField('activeSeats', Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </Section>

      {/* Opening hours */}
      <Section title="Horaires d'ouverture" collapsible>
        <div className="space-y-3">
          {DAYS.map(({ key, label }) => {
            const day = settings.openingHours[key]
            return (
              <div
                key={key}
                className={`rounded-xl border p-3 transition-colors ${
                  day.closed ? 'border-gray-100 bg-gray-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-primary w-24">{label}</p>
                  <ToggleRow
                    label={day.closed ? 'Fermé' : 'Ouvert'}
                    value={!day.closed}
                    onChange={(v) => setHours(key, 'closed', !v)}
                  />
                </div>
                {!day.closed && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-gray-500">Ouverture</label>
                      <input
                        type="time"
                        value={day.open}
                        onChange={(e) => setHours(key, 'open', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-gray-500">Fermeture</label>
                      <input
                        type="time"
                        value={day.close}
                        onChange={(e) => setHours(key, 'close', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Section>

      {/* Mobile floating save button */}
      <div className="fixed bottom-6 left-0 right-0 mx-4 md:hidden">
        <motion.button
          type="submit"
          disabled={isSaving}
          whileTap={{ scale: 0.97 }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-bold text-white shadow-xl disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
        </motion.button>
      </div>
    </form>
  )
}

export default AdminSettingsPage
