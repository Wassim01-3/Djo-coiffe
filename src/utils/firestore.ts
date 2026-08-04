// Placeholder for Firestore-specific utilities (converters, timestamps, etc.)

import { Timestamp } from 'firebase/firestore'

/** Convert Firestore Timestamp to Date */
export function timestampToDate(ts: Timestamp): Date {
  return ts.toDate()
}

/** Convert Date to Firestore Timestamp */
export function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date)
}
