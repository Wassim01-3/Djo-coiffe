import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Dialog } from './Dialog'
import { BottomSheet } from './BottomSheet'
import {
  ConfirmationDialog,
  DeleteDialog,
  SuccessDialog,
  ErrorDialog,
} from './Dialogs'
import { PrimaryButton } from '../buttons/PrimaryButton'

const meta: Meta = {
  title: 'Components/Dialogs & BottomSheet',
  parameters: { layout: 'centered' },
}
export default meta

export const AllDialogs: StoryObj = {
  render: () => {
    const [open, setOpen] = useState<string | null>(null)
    return (
      <div className="flex flex-col gap-3 w-80 p-4 bg-background rounded-3xl">
        <PrimaryButton onClick={() => setOpen('confirm')}>
          Confirmation Dialog
        </PrimaryButton>
        <PrimaryButton onClick={() => setOpen('delete')}>
          Delete Dialog
        </PrimaryButton>
        <PrimaryButton onClick={() => setOpen('success')}>
          Success Dialog
        </PrimaryButton>
        <PrimaryButton onClick={() => setOpen('error')}>
          Error Dialog
        </PrimaryButton>
        <PrimaryButton onClick={() => setOpen('sheet')}>
          Bottom Sheet
        </PrimaryButton>
        <PrimaryButton onClick={() => setOpen('basic')}>
          Basic Dialog
        </PrimaryButton>

        <Dialog
          isOpen={open === 'basic'}
          onClose={() => setOpen(null)}
          title="Titre du dialog"
        >
          <p className="text-sm text-gray-500">
            Contenu du dialog. Peut contenir n'importe quoi.
          </p>
        </Dialog>
        <ConfirmationDialog
          isOpen={open === 'confirm'}
          onClose={() => setOpen(null)}
          onConfirm={() => setOpen(null)}
          title="Confirmer la réservation"
          message="Voulez-vous vraiment confirmer cette réservation?"
        />
        <DeleteDialog
          isOpen={open === 'delete'}
          onClose={() => setOpen(null)}
          onDelete={() => setOpen(null)}
          itemName="cette réservation"
        />
        <SuccessDialog
          isOpen={open === 'success'}
          onClose={() => setOpen(null)}
          title="Réservation confirmée!"
          message="Votre réservation a été enregistrée avec succès."
        />
        <ErrorDialog
          isOpen={open === 'error'}
          onClose={() => setOpen(null)}
          message="Une erreur s'est produite. Veuillez réessayer."
          onRetry={() => setOpen(null)}
        />
        <BottomSheet
          isOpen={open === 'sheet'}
          onClose={() => setOpen(null)}
          title="Détails du service"
        >
          <p className="text-sm text-gray-500">
            Contenu du bottom sheet ici. Peut scroller si nécessaire.
          </p>
        </BottomSheet>
      </div>
    )
  },
}
