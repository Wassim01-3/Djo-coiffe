import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import QRCode from 'react-qr-code'
import { ChevronLeft, Download, Share2, AlertTriangle } from 'lucide-react'
import { useReservationContext } from '@contexts/ReservationContext'
import { PrimaryButton } from '@components/buttons/PrimaryButton'
import { GhostButton } from '@components/buttons/GhostButton'
import { ROUTES } from '@constants/routes'
import { getActiveServices, getActiveBarbers } from '@services/catalog.service'
import type { Barber, Service } from '@appTypes/models'

const ReservationQRPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { reservations, fetchMyReservations } = useReservationContext()
  const [downloading, setDownloading] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const [barbers, setBarbers] = useState<Barber[]>([])
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    if (reservations.length === 0) {
      fetchMyReservations()
    }
    Promise.all([getActiveBarbers(), getActiveServices()]).then(([b, s]) => {
      setBarbers(b)
      setServices(s)
    })
  }, [reservations.length, fetchMyReservations])

  const reservation = reservations.find((r) => r.id === id)

  if (!reservation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
        <AlertTriangle className="mb-4 h-12 w-12 text-gray-400" />
        <h1 className="font-heading text-xl font-bold text-primary text-center">Réservation introuvable</h1>
        <p className="mt-2 text-center text-sm text-gray-500">Cette réservation n'existe pas ou a été supprimée.</p>
        <PrimaryButton onClick={() => navigate(ROUTES.MY_RESERVATIONS)} className="mt-8">
          Retour aux réservations
        </PrimaryButton>
      </div>
    )
  }

  const service = services.find((s) => s.id === reservation.serviceId)
  const barber = barbers.find((b) => b.id === reservation.barberId)

  const formattedDate = new Date(reservation.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const downloadQR = async () => {
    if (!qrRef.current) return
    setDownloading(true)
    
    try {
      // Create a canvas specifically for the QR code SVG
      const svg = qrRef.current.querySelector('svg')
      if (!svg) throw new Error("SVG introuvable")

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      const xml = new XMLSerializer().serializeToString(svg)
      const svg64 = btoa(unescape(encodeURIComponent(xml)))
      const b64Start = 'data:image/svg+xml;base64,'
      const image64 = b64Start + svg64

      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        // Add white background
        if (ctx) {
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
        }

        const pngUrl = canvas.toDataURL('image/png')
        const downloadLink = document.createElement('a')
        downloadLink.href = pngUrl
        downloadLink.download = `QR_Reservation_${reservation.id.slice(0, 8)}.png`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
      }
      img.src = image64
    } catch (err) {
      console.error('Download failed', err)
    } finally {
      setTimeout(() => setDownloading(false), 500)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5 text-primary" />
        </button>
        <h1 className="flex-1 font-heading font-bold text-primary text-center pr-10">
          Votre QR Code
        </h1>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-card"
        >
          <div className="bg-primary p-6 text-center">
            <h2 className="font-heading text-lg font-bold text-accent">
              {service?.name || 'Service'}
            </h2>
            <p className="mt-1 text-sm text-white/70">
              avec {barber?.name || 'Coiffeur'}
            </p>
          </div>

          <div className="p-8 pb-4 text-center">
            <p className="text-sm font-semibold text-primary">{formattedDate}</p>
            <p className="text-sm text-gray-500 mb-6">{reservation.startTime} - {reservation.endTime}</p>

            {reservation.status === 'pending' || reservation.status === 'confirmed' ? (
              <div 
                ref={qrRef}
                className="mx-auto flex w-48 h-48 items-center justify-center rounded-2xl bg-white p-2 shadow-sm border border-gray-50"
              >
                {reservation.qrToken ? (
                  <QRCode
                    value={reservation.qrToken}
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                  />
                ) : (
                  <div className="text-gray-300 text-sm">QR non disponible</div>
                )}
              </div>
            ) : (
              <div className="mx-auto flex h-48 w-48 flex-col items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-xs font-medium text-gray-500">
                  Ce QR Code n'est plus valide ({reservation.status})
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex gap-3">
            <GhostButton 
              className="flex-1 h-12 text-sm gap-2" 
              onClick={downloadQR} 
              disabled={reservation.status !== 'pending' && reservation.status !== 'confirmed' || downloading}
            >
              {downloading ? 'Chargement...' : <><Download className="h-4 w-4" /> Sauvegarder</>}
            </GhostButton>
            <GhostButton className="flex-1 h-12 text-sm gap-2">
              <Share2 className="h-4 w-4" /> Partager
            </GhostButton>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ReservationQRPage
