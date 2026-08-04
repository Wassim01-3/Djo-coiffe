import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@appFirebase/config'
import type { Product } from '@appTypes/models'

export const getActiveProducts = async (): Promise<Product[]> => {
  const q = query(collection(db, 'products'), where('enabled', '==', true))
  const snap = await getDocs(q)
  const products = snap.docs.map(d => d.data() as Product)
  return products.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
}
