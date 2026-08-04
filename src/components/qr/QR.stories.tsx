import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  QRCodeGenerator,
  QRCodeCard,
  ReservationQRCode,
  RewardQRCode,
} from './QRCode'

const meta: Meta = {
  title: 'Components/QR',
  parameters: { layout: 'centered' },
}
export default meta

export const AllQR: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6 w-80 p-4 bg-background rounded-3xl">
      <div>
        <h3 className="text-xs text-gray-400 font-semibold uppercase mb-2">
          QR Generator
        </h3>
        <QRCodeGenerator value="https://djocoiffe.com" />
      </div>
      <div>
        <h3 className="text-xs text-gray-400 font-semibold uppercase mb-2">
          QR Card
        </h3>
        <QRCodeCard
          value="reservation:abc123"
          title="Réservation"
          subtitle="Lundi 3 fév à 10:30"
        />
      </div>
      <div>
        <h3 className="text-xs text-gray-400 font-semibold uppercase mb-2">
          Reservation QR
        </h3>
        <ReservationQRCode
          reservationId="res_001"
          date="Lundi 3 fév"
          time="10:30"
        />
      </div>
      <div>
        <h3 className="text-xs text-gray-400 font-semibold uppercase mb-2">
          Reward QR
        </h3>
        <RewardQRCode rewardId="reward_001" />
      </div>
    </div>
  ),
}
