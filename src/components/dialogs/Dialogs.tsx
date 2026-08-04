import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Dialog } from './Dialog'
import { PrimaryButton } from '../buttons/PrimaryButton'
import { GhostButton } from '../buttons/GhostButton'
import { DangerButton } from '../buttons/DangerButton'

export interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  isLoading,
}) => (
  <Dialog isOpen={isOpen} onClose={onClose} title={title}>
    <p className="text-sm text-gray-500 mb-6">{message}</p>
    <div className="flex flex-col gap-3">
      <PrimaryButton onClick={onConfirm} isLoading={isLoading}>
        {confirmLabel}
      </PrimaryButton>
      <GhostButton onClick={onClose}>{cancelLabel}</GhostButton>
    </div>
  </Dialog>
)

export interface DeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
  itemName?: string
  isLoading?: boolean
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  onClose,
  onDelete,
  itemName,
  isLoading,
}) => (
  <Dialog isOpen={isOpen} onClose={onClose}>
    <div className="flex flex-col items-center text-center mb-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 mb-4">
        <AlertTriangle size={32} className="text-danger" />
      </div>
      <h2 className="text-lg font-bold text-primary">
        Supprimer {itemName ?? 'cet élément'}?
      </h2>
      <p className="text-sm text-gray-500 mt-2">
        Cette action est irréversible.
      </p>
    </div>
    <div className="flex flex-col gap-3">
      <DangerButton onClick={onDelete} isLoading={isLoading}>
        Supprimer
      </DangerButton>
      <GhostButton onClick={onClose}>Annuler</GhostButton>
    </div>
  </Dialog>
)

export interface SuccessDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  actionLabel?: string
}

export const SuccessDialog: React.FC<SuccessDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  actionLabel = 'OK',
}) => (
  <Dialog isOpen={isOpen} onClose={onClose} showCloseButton={false}>
    <div className="flex flex-col items-center text-center mb-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-4 text-4xl">
        ✅
      </div>
      <h2 className="text-lg font-bold text-primary">{title}</h2>
      <p className="text-sm text-gray-500 mt-2">{message}</p>
    </div>
    <PrimaryButton onClick={onClose}>{actionLabel}</PrimaryButton>
  </Dialog>
)

export interface ErrorDialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  onRetry?: () => void
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({
  isOpen,
  onClose,
  title = 'Une erreur est survenue',
  message,
  onRetry,
}) => (
  <Dialog isOpen={isOpen} onClose={onClose} showCloseButton={false}>
    <div className="flex flex-col items-center text-center mb-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 mb-4 text-4xl">
        ❌
      </div>
      <h2 className="text-lg font-bold text-primary">{title}</h2>
      <p className="text-sm text-gray-500 mt-2">{message}</p>
    </div>
    <div className="flex flex-col gap-3">
      {onRetry && <PrimaryButton onClick={onRetry}>Réessayer</PrimaryButton>}
      <GhostButton onClick={onClose}>Fermer</GhostButton>
    </div>
  </Dialog>
)

export interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  url: string
  title?: string
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  url,
  title,
}) => {
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ url, title })
    } else {
      await navigator.clipboard.writeText(url)
    }
    onClose()
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Partager">
      <p className="text-sm text-gray-500 mb-4 break-all bg-gray-50 rounded-[12px] px-3 py-2">
        {url}
      </p>
      <div className="flex flex-col gap-3">
        <PrimaryButton onClick={handleShare}>Partager</PrimaryButton>
        <GhostButton onClick={onClose}>Fermer</GhostButton>
      </div>
    </Dialog>
  )
}
