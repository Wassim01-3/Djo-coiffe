import React from 'react'
import { motion } from 'framer-motion'

type ChipVariant = 'service' | 'category' | 'status' | 'filter' | 'selection'

export interface ChipProps {
  label: string
  variant?: ChipVariant
  selected?: boolean
  onSelect?: () => void
  icon?: React.ReactNode
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onSelect,
  icon,
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onSelect}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
        selected
          ? 'bg-accent text-white shadow-sm'
          : 'bg-white border border-border text-gray-600 hover:border-accent hover:text-accent'
      }`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </motion.button>
  )
}

export const ServiceChip: React.FC<Omit<ChipProps, 'variant'>> = (p) => (
  <Chip variant="service" {...p} />
)
export const CategoryChip: React.FC<Omit<ChipProps, 'variant'>> = (p) => (
  <Chip variant="category" {...p} />
)
export const StatusChip: React.FC<Omit<ChipProps, 'variant'>> = (p) => (
  <Chip variant="status" {...p} />
)
export const FilterChip: React.FC<Omit<ChipProps, 'variant'>> = (p) => (
  <Chip variant="filter" {...p} />
)
export const SelectionChip: React.FC<Omit<ChipProps, 'variant'>> = (p) => (
  <Chip variant="selection" {...p} />
)
