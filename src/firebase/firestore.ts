import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  type QueryConstraint,
  type DocumentData,
  type WithFieldValue,
  type UpdateData,
} from 'firebase/firestore'
import { db } from '@appFirebase/config'

// Generic CRUD helpers for Firestore

export async function getDocument<T>(
  collectionName: string,
  docId: string,
): Promise<T | null> {
  const ref = doc(db, collectionName, docId)
  const snap = await getDoc(ref)
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null
}

export async function getDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
): Promise<T[]> {
  const ref = collection(db, collectionName)
  const q = constraints.length > 0 ? query(ref, ...constraints) : query(ref)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T)
}

export async function createDocument<T extends DocumentData>(
  collectionName: string,
  data: WithFieldValue<T>,
): Promise<string> {
  const ref = collection(db, collectionName)
  const docRef = await addDoc(ref, data)
  return docRef.id
}

export async function updateDocument<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: UpdateData<T>,
): Promise<void> {
  const ref = doc(db, collectionName, docId)
  await updateDoc(ref, data)
}

export async function deleteDocument(
  collectionName: string,
  docId: string,
): Promise<void> {
  const ref = doc(db, collectionName, docId)
  await deleteDoc(ref)
}

export { where, orderBy, limit }
