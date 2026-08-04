import React from 'react'
import { motion } from 'framer-motion'
import type { GalleryItem } from '@appTypes/gallery'

export interface GalleryCardProps {
  item: GalleryItem
  onClick?: () => void
}

export const GalleryCard: React.FC<GalleryCardProps> = React.memo(({ item, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="relative w-full cursor-pointer overflow-hidden rounded-[20px]"
    >
      <img
        src={item.imageUrl}
        alt={item.caption ?? item.category}
        loading="lazy"
        decoding="async"
        className="w-full object-cover transition-transform duration-300 hover:scale-105"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {item.category}
        </span>
      </div>
    </motion.div>
  )
})
GalleryCard.displayName = 'GalleryCard'
