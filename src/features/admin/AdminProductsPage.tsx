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
} from 'firebase/firestore'
import { db } from '@appFirebase/config'
import { Plus, Edit2, Trash2, X, AlertTriangle, Image as ImageIcon, UploadCloud } from 'lucide-react'
import type { Product } from '@appTypes/models'
import { DragDropList } from '@components/admin/DragDropList'
import { compressImage, uploadToCloudinary } from '@services/upload.service'

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    enabled: true,
  })
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      const data = snap.docs.map((d) => d.data() as Product)
      data.sort((a, b) => a.displayOrder - b.displayOrder)
      setProducts(data)
      setIsLoading(false)
    })
    return () => unsub()
  }, [])

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        price: product.price,
        description: product.description,
        enabled: product.enabled,
      })
      setImageUrl(product.imageUrl)
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        price: 0,
        description: '',
        enabled: true,
      })
      setImageUrl('')
    }
    setImageFile(null)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingProduct(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setImageFile(file)
      setImageUrl(URL.createObjectURL(file))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      let finalImageUrl = imageUrl
      if (imageFile) {
        const compressed = await compressImage(imageFile)
        finalImageUrl = await uploadToCloudinary(compressed, 'products')
      }

      const productId = editingProduct?.id || doc(collection(db, 'products')).id
      const productData: Partial<Product> = {
        id: productId,
        ...formData,
        imageUrl: finalImageUrl,
        displayOrder: editingProduct ? editingProduct.displayOrder : products.length,
        updatedAt: serverTimestamp() as any,
      }
      if (!editingProduct) {
        productData.createdAt = serverTimestamp() as any
      }

      await setDoc(doc(db, 'products', productId), productData, { merge: true })
      handleCloseDialog()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde. Assurez-vous que l\'image est valide.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id))
      setDeleteConfirmId(null)
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression.')
    }
  }

  const handleReorder = async (newProducts: Product[]) => {
    setProducts(newProducts)
    try {
      const batch = writeBatch(db)
      newProducts.forEach((product, index) => {
        batch.update(doc(db, 'products', product.id), { displayOrder: index })
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-xl font-bold text-primary md:text-2xl">Produits</h1>
          <p className="text-sm text-gray-500">Gérez les produits de la boutique.</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      <div className="mb-4 rounded-xl bg-accent/10 p-4 border border-accent/20">
        <p className="text-sm font-semibold text-accent">Produits actifs : {products.filter(p => p.enabled).length}</p>
        <p className="text-xs text-gray-600">Faites glisser les éléments pour modifier l'ordre d'affichage.</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-gray-300 bg-gray-50">
          <p className="text-gray-500 font-medium">Aucun produit trouvé.</p>
        </div>
      ) : (
        <DragDropList
          items={products}
          onReorder={handleReorder}
          renderItem={(product) => (
            <div className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className={`font-semibold ${!product.enabled ? 'text-gray-400 line-through' : 'text-primary'}`}>
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {product.price} TND
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenDialog(product)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(product.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10 text-danger transition-colors hover:bg-danger hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
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
                Êtes-vous sûr de vouloir supprimer ce produit ? L'image restera sur Cloudinary.
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

      {/* Create/Edit Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleCloseDialog}
            />
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="font-heading text-lg font-bold text-primary">
                  {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                </h2>
                <button
                  onClick={handleCloseDialog}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="overflow-y-auto px-6 py-4">
                <form id="product-form" onSubmit={handleSave} className="space-y-4">
                  {/* Image Upload Area */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative flex h-40 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    ) : (
                      <>
                        <UploadCloud className="mb-2 h-8 w-8 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">Ajouter une image (Optionnel)</span>
                      </>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Nom</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Prix (TND)</label>
                    <input
                      required
                      type="number"
                      min={0}
                      step="0.1"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      required
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                    <span className="text-sm font-medium text-primary">Actif</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.enabled}
                      onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${
                        formData.enabled ? 'bg-accent' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                          formData.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </form>
              </div>

              <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                <button
                  type="submit"
                  form="product-form"
                  disabled={isSaving}
                  className="flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-primary/90 disabled:opacity-60"
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminProductsPage
