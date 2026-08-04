import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@appFirebase/config'
import { EmptyState } from '@components/ui'
import type { GalleryImage, GalleryCategory } from '@appTypes/models'
import { ListSkeleton } from '@components/ui'

const CATEGORIES: ('Tous' | GalleryCategory)[] = ['Tous', 'Enfant', 'Jeune', 'Adulte']

const GalleryPage: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<'Tous' | GalleryCategory>('Tous')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('displayOrder'))
    const unsub = onSnapshot(q, (snap) => {
      setImages(snap.docs.map((d) => d.data() as GalleryImage))
      setIsLoading(false)
    })
    return () => unsub()
  }, [])

  const filteredImages = images.filter(
    (img) => activeCategory === 'Tous' || img.category === activeCategory,
  )

  return (
    <div className="flex min-h-screen flex-col bg-background pt-4">
      {/* Header & Filters */}
      <div className="px-6 mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary mb-4">
          Galerie
        </h1>
        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="px-4">
          <ListSkeleton />
        </div>
      ) : filteredImages.length === 0 ? (
        <EmptyState
          icon={X}
          title="Aucune photo"
          message="Il n'y a pas encore de photos dans cette catégorie."
        />
      ) : (
        <div className="columns-2 gap-4 px-4 space-y-4 pb-8">
          {filteredImages.map((img, i) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="break-inside-avoid"
              onClick={() => setSelectedImage(img.imageUrl)}
            >
              <img
                src={img.imageUrl}
                alt="Haircut style"
                className="w-full rounded-2xl bg-gray-100 object-cover shadow-sm"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage}
              alt="Fullscreen"
              className="max-h-full max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GalleryPage
