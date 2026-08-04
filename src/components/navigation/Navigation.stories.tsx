import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { PageHeader } from './PageHeader'
import { BottomNavigation } from './BottomNavigation'
import { AdminDrawer } from './AdminDrawer'
import { Timeline } from './Timeline'
import { PrimaryButton } from '../buttons/PrimaryButton'

const meta: Meta = {
  title: 'Components/Navigation',
  parameters: { layout: 'fullscreen' },
}
export default meta

export const Header: StoryObj = {
  render: () => (
    <MemoryRouter>
      <div className="bg-background min-h-[200px]">
        <PageHeader
          title="Réservations"
          showBack
          rightAction={<Bell size={20} className="text-primary" />}
        />
        <div className="p-4 text-sm text-gray-500">
          Contenu de la page ici...
        </div>
      </div>
    </MemoryRouter>
  ),
}

export const BottomNav: StoryObj = {
  render: () => (
    <MemoryRouter initialEntries={['/']}>
      <div className="relative h-32 bg-background" />
      <BottomNavigation unreadNotifications={3} />
    </MemoryRouter>
  ),
}

export const Drawer: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <MemoryRouter initialEntries={['/admin']}>
        <div className="p-4 bg-background min-h-screen">
          <PrimaryButton onClick={() => setOpen(true)}>
            Ouvrir le menu admin
          </PrimaryButton>
          <AdminDrawer isOpen={open} onClose={() => setOpen(false)} />
        </div>
      </MemoryRouter>
    )
  },
}

export const TimelineStory: StoryObj = {
  render: () => (
    <div className="p-4 bg-background w-80">
      <Timeline
        items={[
          {
            id: '1',
            label: 'Service',
            sublabel: 'Coupe + Barbe',
            completed: true,
          },
          { id: '2', label: 'Coiffeur', sublabel: 'Djo', completed: true },
          { id: '3', label: 'Date', sublabel: 'Lundi 3 février', active: true },
          { id: '4', label: 'Horaire', sublabel: '10:30' },
          { id: '5', label: 'Confirmation' },
        ]}
      />
    </div>
  ),
}
