import { useState } from 'react'

/** Hook for controlling BottomSheet visibility */
export function useBottomSheet() {
  const [isOpen, setIsOpen] = useState(false)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen((v) => !v)
  return { isOpen, open, close, toggle }
}
