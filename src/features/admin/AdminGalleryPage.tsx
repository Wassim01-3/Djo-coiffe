import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  setDoc,
  writeBatch,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '@appFirebase/config'
import { Trash2, AlertTriangle, UploadCloud } from 'lucide-react'
import type { GalleryImage, GalleryCategory } from '@appTypes/models'
import { DragDropList } from '@components/admin/DragDropList'
import { compressImage, uploadToCloudinary } from '@services/upload.service'

const CATEGORIES: GalleryCategory[] = ['Enfant', 'Jeune', 'Adulte']

const AdminGalleryPage: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory>('Enfant')
  
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'gallery'), orderBy('displayOrder')), (snap) => {
      const data = snap.docs.map((d) => d.data() as GalleryImage)
      setImages(data)
      setIsLoading(false)
    })
    return () => unsub()
  }, [])

  const filteredImages = images.filter((img) => img.category === selectedCategory).sort((a,b) => a.displayOrder - b.displayOrder)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setIsUploading(true)
      try {
        const compressed = await compressImage(file)
        const imageUrl = await uploadToCloudinary(compressed, 'gallery')
        
        const imageId = doc(collection(db, 'gallery')).id
        const imageData: GalleryImage = {
          id: imageId,
          category: selectedCategory,
          imageUrl,
          displayOrder: filteredImages.length,
          enabled: true,
          createdAt: serverTimestamp() as any,
          updatedAt: serverTimestamp() as any,
        }
        await setDoc(doc(db, 'gallery', imageId), imageData)
      } catch (error) {
        console.error('Erreur:', error)
        alert('Erreur lors de l\'upload de l\'image.')
      } finally {
        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'gallery', id))
      setDeleteConfirmId(null)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression.')
    }
  }

  const handleReorder = async (newImages: GalleryImage[]) => {
    // Optimistic UI updates
    const otherImages = images.filter((img) => img.category !== selectedCategory)
    setImages([...otherImages, ...newImages])

    try {
      const batch = writeBatch(db)
      newImages.forEach((img, index) => {
        batch.update(doc(db, 'gallery', img.id), { displayOrder: index })
      })
      await batch.commit()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors du réordonnancement.')
    }
  }

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Chargement...</div>
  }

  return (
    <div className="p-4 md:p-6 pb-24 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-xl font-bold text-primary md:text-2xl">Galerie</h1>
          <p className="text-sm text-gray-500">Gérez les photos pour chaque catégorie.</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-60"
        >
          <UploadCloud className="h-4 w-4" />
          {isUploading ? 'Upload en cours...' : 'Ajouter une photo'}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {/* Categories */}
      <div className="mb-6 flex overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-accent text-primary'
                  : 'border border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 rounded-xl bg-accent/10 p-4 border border-accent/20">
        <p className="text-xs text-gray-600">Faites glisser les images pour modifier leur ordre d'affichage dans cette catégorie.</p>
      </div>

      {filteredImages.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-gray-300 bg-gray-50">
          <p className="text-gray-500 font-medium">Aucune image dans cette catégorie.</p>
        </div>
      ) : (
        <DragDropList
          items={filteredImages}
          onReorder={handleReorder}
          renderItem={(image) => (
            <div className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <img src={image.imageUrl} alt="Gallery item" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeleteConfirmId(image.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10 text-danger transition-colors hover:bg-danger hover:text-white"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        />
      )}

      {/* Delete Dialog */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setDeleteConfirmId(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
                <AlertTriangle className="h-6 w-6 text-danger" />
              </div>
              <h3 className="mb-2 font-heading text-lg font-bold text-primary">Confirmer la suppression</h3>
              <p className="mb-6 text-sm text-gray-500">
                Êtes-vous sûr de vouloir supprimer cette image ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 rounded-xl bg-danger py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-danger/90"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminGalleryPage
