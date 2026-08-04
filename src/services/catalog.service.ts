import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@appFirebase/config'
import type { Barber, Service } from '@appTypes/models'

export const getActiveBarbers = async (): Promise<Barber[]> => {
  const q = query(collection(db, 'barbers'), where('enabled', '==', true))
  const snap = await getDocs(q)
  const barbers = snap.docs.map(d => d.data() as Barber)
  return barbers.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
}

export const getActiveServices = async (): Promise<Service[]> => {
  const q = query(collection(db, 'services'), where('enabled', '==', true))
  const snap = await getDocs(q)
  const services = snap.docs.map(d => d.data() as Service)
  return services.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
}
