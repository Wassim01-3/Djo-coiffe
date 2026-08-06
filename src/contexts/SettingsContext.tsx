import type { ReactNode } from 'react'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@appFirebase/config'
import type { OpeningHours } from '@appTypes/models'

interface ShopSettings {
  shopName: string
  logoUrl: string
  phone: string
  whatsapp: string
  facebook: string
  instagram: string
  address: string
  mapsUrl: string
  openingHours: OpeningHours
  reservationEnabled: boolean
  subscriptionEnabled: boolean
  androidApkUrl: string
}

const DEFAULT_OPENING_HOURS: OpeningHours = {
  monday: { open: '08:00', close: '19:00', closed: false },
  tuesday: { open: '08:00', close: '19:00', closed: false },
  wednesday: { open: '08:00', close: '19:00', closed: false },
  thursday: { open: '08:00', close: '19:00', closed: false },
  friday: { open: '08:00', close: '19:00', closed: false },
  saturday: { open: '08:00', close: '19:00', closed: false },
  sunday: { open: '00:00', close: '00:00', closed: true },
}

const DEFAULT_SETTINGS: ShopSettings = {
  shopName: 'Djo Coiffe',
  logoUrl: '',
  phone: '',
  whatsapp: '',
  facebook: '',
  instagram: '',
  address: '',
  mapsUrl: '',
  openingHours: DEFAULT_OPENING_HOURS,
  reservationEnabled: true,
  subscriptionEnabled: false,
  androidApkUrl: '',
}

interface SettingsContextValue {
  settings: ShopSettings
  isLoading: boolean
  /** Returns true if the shop is currently open based on admin settings */
  isOpenNow: () => boolean
  /** Returns the DayKey ('monday','tuesday', etc.) for a given YYYY-MM-DD string */
  isDayClosed: (dateStr: string) => boolean
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

const DAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

type DayKey = (typeof DAY_KEYS)[number]

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'main'), (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        setSettings({
          shopName: data.shopName || DEFAULT_SETTINGS.shopName,
          logoUrl: data.logoUrl || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          facebook: data.facebook || '',
          instagram: data.instagram || '',
          address: data.address || '',
          mapsUrl: data.mapsUrl || data.googleMapsUrl || '',
          openingHours: (data.openingHours as OpeningHours) || DEFAULT_OPENING_HOURS,
          reservationEnabled: data.reservationEnabled !== false,
          subscriptionEnabled: data.subscriptionEnabled === true,
          androidApkUrl: data.androidApkUrl || '',
        })
      }
      setIsLoading(false)
    })
    return () => unsub()
  }, [])

  const isOpenNow = (): boolean => {
    const hours = settings.openingHours || DEFAULT_OPENING_HOURS
    const now = new Date()
    const dayKey = DAY_KEYS[now.getDay()] as DayKey
    const dayHours = hours[dayKey]
    if (!dayHours || dayHours.closed) return false

    const currentMins = now.getHours() * 60 + now.getMinutes()
    const [openH, openM] = dayHours.open.split(':').map(Number)
    const [closeH, closeM] = dayHours.close.split(':').map(Number)
    const openMins = openH * 60 + openM
    const closeMins = closeH * 60 + closeM
    return currentMins >= openMins && currentMins < closeMins
  }

  const isDayClosed = (dateStr: string): boolean => {
    const hours = settings.openingHours || DEFAULT_OPENING_HOURS
    const d = new Date(dateStr)
    const dayKey = DAY_KEYS[d.getDay()] as DayKey
    const dayHours = hours[dayKey]
    return !dayHours || dayHours.closed
  }

  return (
    <SettingsContext.Provider value={{ settings, isLoading, isOpenNow, isDayClosed }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettingsContext = (): SettingsContextValue => {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettingsContext must be used inside SettingsProvider')
  return ctx
}
