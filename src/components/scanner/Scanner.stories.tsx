import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  ScannerOverlay,
  TorchButton,
  SwitchCameraButton,
  ScannerResult,
} from './Scanner'

const meta: Meta = {
  title: 'Components/Scanner',
  parameters: { layout: 'fullscreen' },
}
export default meta

export const ScannerUI: StoryObj = {
  render: () => {
    const [torch, setTorch] = useState(false)
    const [result, setResult] = useState<'success' | 'error' | null>(null)
    return (
      <div className="relative h-screen w-full bg-black flex flex-col">
        {/* Simulated camera */}
        <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
          <p className="text-white/30 text-sm">Aperçu caméra simulé</p>
          <ScannerOverlay />
          {result && (
            <ScannerResult
              status={result}
              message={
                result === 'success'
                  ? 'Réservation vérifiée!'
                  : 'QR invalide ou expiré'
              }
              isVisible
            />
          )}
        </div>
        {/* Controls */}
        <div className="flex justify-center gap-6 pb-12 pt-6 bg-black">
          <TorchButton enabled={torch} onToggle={() => setTorch((t) => !t)} />
          <SwitchCameraButton onSwitch={() => {}} />
        </div>
        {/* Test buttons */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <button
            onClick={() => setResult('success')}
            className="text-xs bg-success text-white px-3 py-1 rounded-full"
          >
            Succès
          </button>
          <button
            onClick={() => setResult('error')}
            className="text-xs bg-danger text-white px-3 py-1 rounded-full"
          >
            Erreur
          </button>
          <button
            onClick={() => setResult(null)}
            className="text-xs bg-white/20 text-white px-3 py-1 rounded-full"
          >
            Reset
          </button>
        </div>
      </div>
    )
  },
}
