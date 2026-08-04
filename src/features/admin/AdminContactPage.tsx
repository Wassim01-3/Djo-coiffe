import React, { useEffect, useState, useRef } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@appFirebase/config'
import { Save, UploadCloud } from 'lucide-react'
import { compressImage, uploadToCloudinary } from '@services/upload.service'

const AdminContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    shopName: 'Djo Coiffe',
    phone: '',
    whatsapp: '',
    facebook: '',
    instagram: '',
    address: '',
    mapsUrl: '',
    logoUrl: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'main')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setFormData((prev) => ({
            ...prev,
            shopName: data.shopName || '',
            phone: data.phone || '',
            whatsapp: data.whatsapp || '',
            facebook: data.facebook || '',
            instagram: data.instagram || '',
            address: data.address || '',
            mapsUrl: data.mapsUrl || '',
            logoUrl: data.logoUrl || '',
          }))
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setLogoFile(file)
      setFormData({ ...formData, logoUrl: URL.createObjectURL(file) })
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      let finalLogoUrl = formData.logoUrl
      if (logoFile) {
        const compressed = await compressImage(logoFile)
        finalLogoUrl = await uploadToCloudinary(compressed, 'logo')
      }

      const docRef = doc(db, 'settings', 'main')
      await setDoc(docRef, {
        shopName: formData.shopName,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        facebook: formData.facebook,
        instagram: formData.instagram,
        address: formData.address,
        mapsUrl: formData.mapsUrl,
        logoUrl: finalLogoUrl,
      }, { merge: true })
      
      alert('Informations de contact mises à jour.')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Erreur lors de la sauvegarde.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Chargement...</div>
  }

  return (
    <div className="p-4 md:p-6 pb-24 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-xl font-bold text-primary md:text-2xl">Contact & Réseaux</h1>
          <p className="mt-1 text-sm text-gray-500">Gérez les informations de contact affichées aux clients.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="hidden md:flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Logo Upload */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-heading text-lg font-bold text-primary">Logo</h2>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative flex h-32 w-32 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            {formData.logoUrl ? (
              <img src={formData.logoUrl} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <UploadCloud className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500">Cliquez pour modifier le logo (Format carré recommandé)</p>
        </div>

        {/* Info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="mb-2 font-heading text-lg font-bold text-primary">Informations générales</h2>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nom du salon</label>
            <input
              type="text"
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Adresse</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Lien Google Maps</label>
            <input
              type="url"
              value={formData.mapsUrl}
              onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Contact & Socials */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="mb-2 font-heading text-lg font-bold text-primary">Réseaux & Téléphone</h2>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Téléphone Principal</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Numéro WhatsApp</label>
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Lien Facebook</label>
            <input
              type="url"
              value={formData.facebook}
              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Lien Instagram</label>
            <input
              type="url"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Mobile floating save button */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4 md:hidden z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            type="submit"
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminContactPage
