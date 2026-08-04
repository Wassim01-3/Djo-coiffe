import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export interface ImageViewerProps {
  isOpen: boolean
  onClose: () => void
  images: string[]
  initialIndex?: number
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}) => {
  const [current, setCurrent] = React.useState(initialIndex)

  const prev = () => setCurrent((i) => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setCurrent((i) => (i === images.length - 1 ? 0 : i + 1))

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
        >
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <X size={20} />
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={next}
                className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
          <motion.img
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            src={images[current]}
            alt={`Image ${current + 1}`}
            className="max-h-[85vh] max-w-[90vw] rounded-[20px] object-contain"
          />
          <div className="absolute bottom-6 text-white/60 text-sm">
            {current + 1} / {images.length}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
