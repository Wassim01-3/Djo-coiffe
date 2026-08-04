import { doc, getDoc } from 'firebase/firestore'
import { db } from '@appFirebase/config'
import type { AppSettings } from '@appTypes/models'
import { MOCK_APP_SETTINGS } from './mock.service'

/**
 * Fetches the full app settings from Firestore.
 * Falls back to MOCK_APP_SETTINGS if the document is missing.
 */
export const getAppSettings = async (): Promise<AppSettings> => {
  try {
    const snap = await getDoc(doc(db, 'settings', 'main'))
    if (snap.exists()) {
      const data = snap.data()
      return {
        id: 'main',
        shopName: data.shopName ?? MOCK_APP_SETTINGS.shopName,
        logoUrl: data.logoUrl ?? '',
        phone: data.phone ?? '',
        whatsapp: data.whatsapp ?? '',
        facebook: data.facebook ?? '',
        instagram: data.instagram ?? '',
        address: data.address ?? '',
        googleMapsUrl: data.googleMapsUrl ?? data.mapsUrl ?? '',
        latitude: data.latitude ?? 0,
        longitude: data.longitude ?? 0,
        openingHours: data.openingHours ?? MOCK_APP_SETTINGS.openingHours,
        activeSeats: data.activeSeats ?? MOCK_APP_SETTINGS.activeSeats,
        reservationEnabled: data.reservationEnabled !== false,
        galleryEnabled: data.galleryEnabled !== false,
        productsEnabled: data.productsEnabled !== false,
        loyaltyEnabled: data.loyaltyEnabled !== false,
        subscriptionEnabled: data.subscriptionEnabled !== false,
        maintenanceMode: data.maintenanceMode ?? false,
        iosAppMessageEnabled: data.iosAppMessageEnabled ?? false,
        androidApkUrl: data.androidApkUrl ?? '',
        version: data.version ?? '1.0',
      } as AppSettings
    }
  } catch (error) {
    console.warn('Failed to fetch app settings from Firestore, using defaults.', error)
  }
  return MOCK_APP_SETTINGS
}
