import type { Meta, StoryObj } from '@storybook/react-vite'
import { Users } from 'lucide-react'
import { BarberCard } from './BarberCard'
import { ProductCard } from './ProductCard'
import { GalleryCard } from './GalleryCard'
import { NotificationCard } from './NotificationCard'
import { InformationCard } from './InformationCard'
import { StatisticCard } from './StatisticCard'
import { LoyaltyCard } from './LoyaltyCard'

const meta: Meta = {
  title: 'Components/Cards',
  parameters: { layout: 'centered' },
}
export default meta

const mockBarber = {
  id: '1',
  name: 'Djo',
  bio: '',
  specialties: [],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}
const mockProduct = {
  id: '1',
  name: 'Cire Premium',
  description: 'Top qualité',
  price: 24.9,
  category: 'Coiffure',
  isAvailable: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}
const mockGalleryItem = {
  id: '1',
  imageUrl: 'https://placehold.co/300x400',
  category: 'Adulte',
  createdAt: new Date(),
  updatedAt: new Date(),
}
const mockNotification = {
  id: '1',
  userId: '1',
  type: 'reservation_confirmed' as const,
  title: 'Réservation confirmée!',
  body: 'Votre rendez-vous est confirmé pour demain à 10h30.',
  isRead: false,
  createdAt: new Date(),
}

export const AllCards: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6 w-96 p-4 bg-background rounded-3xl">
      <div>
        <h3 className="text-xs text-gray-400 font-semibold uppercase mb-2">
          Barber Card
        </h3>
        <BarberCard barber={mockBarber} nextSlot="10:30" />
      </div>
      <div>
        <h3 className="text-xs text-gray-400 font-semibold uppercase mb-2">
          Product Card
        </h3>
        <ProductCard product={mockProduct} />
      </div>
      <div>
        <h3 className="text-xs text-gray-400 font-semibold uppercase mb-2">
          Gallery Card
        </h3>
        <GalleryCard item={mockGalleryItem} />
      </div>
      <div>
        <h3 className="text-xs text-gray-400 font-semibold uppercase mb-2">
          Notification Card (Unread)
        </h3>
        <NotificationCard notification={mockNotification} />
      </div>
      <div>
        <h3 className="text-xs text-gray-400 font-semibold uppercase mb-2">
          Information Card
        </h3>
        <div className="flex flex-col gap-2">
          <InformationCard
            title="Infomation"
            message="Votre séance est dans 2 heures."
            variant="info"
          />
          <InformationCard
            title="Succès"
            message="Réservation effectuée."
            variant="success"
          />
          <InformationCard
            title="Attention"
            message="Abonnement expirant bientôt."
            variant="warning"
          />
        </div>
      </div>
      <div>
        <h3 className="text-xs text-gray-400 font-semibold uppercase mb-2">
          Statistic Card
        </h3>
        <StatisticCard
          label="Total Réservations"
          value={142}
          icon={<Users size={18} />}
          trend="up"
          trendValue="+12% ce mois"
        />
      </div>
      <div>
        <h3 className="text-xs text-gray-400 font-semibold uppercase mb-2">
          Loyalty Card
        </h3>
        <LoyaltyCard
          points={75}
          pointsThreshold={100}
          totalVisits={8}
          hasReward={false}
        />
      </div>
    </div>
  ),
}
