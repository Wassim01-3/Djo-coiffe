import type { Meta, StoryObj } from '@storybook/react-vite'
import { Calendar, Phone } from 'lucide-react'
import { PrimaryButton } from './PrimaryButton'
import { SecondaryButton } from './SecondaryButton'
import { DangerButton } from './DangerButton'
import { GhostButton } from './GhostButton'
import { IconButton } from './IconButton'
import { FloatingActionButton } from './FloatingActionButton'

const meta: Meta = {
  title: 'Components/Buttons',
  parameters: {
    layout: 'centered',
  },
}

export default meta

export const AllButtons: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6 w-96 p-4 bg-background rounded-3xl">
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-2">
          Primary Button
        </h3>
        <PrimaryButton>Réserver maintenant</PrimaryButton>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-2">
          Primary Button (Icon, Loading & Disabled)
        </h3>
        <div className="flex flex-col gap-2">
          <PrimaryButton icon={<Calendar size={18} />}>
            Choisir un créneau
          </PrimaryButton>
          <PrimaryButton isLoading>Chargement</PrimaryButton>
          <PrimaryButton disabled>Désactivé</PrimaryButton>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-2">
          Secondary Button
        </h3>
        <SecondaryButton>Retour</SecondaryButton>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-2">
          Danger Button
        </h3>
        <DangerButton>Annuler la réservation</DangerButton>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-2">
          Ghost Button
        </h3>
        <GhostButton>Voir plus</GhostButton>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-2">
          Icon Button
        </h3>
        <IconButton icon={<Calendar size={20} />} />
      </div>
      <div className="relative h-20">
        <h3 className="text-sm font-semibold text-gray-500 mb-2">
          Floating Action Button (WhatsApp)
        </h3>
        <FloatingActionButton
          icon={<Phone size={24} />}
          variant="whatsapp"
          className="!absolute !bottom-0 !right-0"
        />
      </div>
    </div>
  ),
}
