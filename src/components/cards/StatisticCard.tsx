import React from 'react'
import { motion } from 'framer-motion'

export interface StatisticCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}

export const StatisticCard: React.FC<StatisticCardProps> = ({
  label,
  value,
  icon,
  trend,
  trendValue,
}) => {
  const trendColor =
    trend === 'up'
      ? 'text-success'
      : trend === 'down'
        ? 'text-danger'
        : 'text-gray-500'
  const trendPrefix = trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-[20px] bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        {icon && <div className="text-accent">{icon}</div>}
      </div>
      <p className="text-2xl font-bold text-primary">{value}</p>
      {trendValue && (
        <p className={`text-xs font-medium mt-1 ${trendColor}`}>
          {trendPrefix} {trendValue}
        </p>
      )}
    </motion.div>
  )
}
