import React, { useState, useEffect } from 'react'
import { Search, PackageOpen } from 'lucide-react'
import { EmptyState } from '@components/ui'
import { getActiveProducts } from '@services/product.service'
import type { Product } from '@appTypes/models'

const ProductsPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActiveProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen flex-col bg-background pt-4">
      {/* Header & Search */}
      <div className="px-6 mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary mb-4">
          Produits
        </h1>
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            strokeWidth={1.5}
          />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-gray-100 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 shadow-sm"
          />
        </div>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="Aucun produit trouvé"
          message="Essayez une autre recherche."
        />
      ) : (
        <div className="flex flex-col gap-4 px-4 pb-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="flex gap-4 rounded-2xl bg-white p-3 shadow-card"
            >
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <PackageOpen className="h-8 w-8 text-gray-300" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <h3 className="font-semibold text-primary">{product.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-gray-500 leading-relaxed">
                  {product.description}
                </p>
                <div className="mt-2 font-bold text-primary">
                  {product.price} DT
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductsPage
