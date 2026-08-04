export const TIME_SLOT_DURATION_MINUTES = 30

export const TIME_SLOTS: string[] = (() => {
  const slots: string[] = []
  let hour = 9
  let minute = 0
  while (hour < 19) {
    const h = String(hour).padStart(2, '0')
    const m = String(minute).padStart(2, '0')
    slots.push(`${h}:${m}`)
    minute += TIME_SLOT_DURATION_MINUTES
    if (minute >= 60) {
      minute = 0
      hour += 1
    }
  }
  return slots
})()
