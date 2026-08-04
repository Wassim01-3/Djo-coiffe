import React from 'react'
import { motion } from 'framer-motion'
import type { Product } from '@appTypes/product'

export interface ProductCardProps {
  product: Product
  onClick?: () => void
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="w-full rounded-[20px] bg-white shadow-sm overflow-hidden cursor-pointer"
    >
      <div className="h-40 w-full bg-gray-100 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300 text-4xl">
            🧴
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-primary text-sm leading-snug">
          {product.name}
        </p>
        <p className="text-accent font-bold text-base mt-1">
          {product.price.toFixed(2)} TND
        </p>
      </div>
    </motion.div>
  )
})
ProductCard.displayName = 'ProductCard'
