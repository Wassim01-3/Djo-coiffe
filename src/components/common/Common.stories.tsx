import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Badge,
  SuccessBadge,
  DangerBadge,
  ReservedBadge,
  WaitlistBadge,
  NewBadge,
  UnreadBadge,
  RewardBadge,
} from './Badge'
import { Chip } from './Chip'
import { Avatar } from './Avatar'

const meta: Meta = {
  title: 'Components/Common',
  parameters: { layout: 'centered' },
}
export default meta

export const Badges: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4 w-80 p-4 bg-background rounded-3xl">
      <h3 className="text-sm font-semibold text-gray-500">Badges</h3>
      <div className="flex flex-wrap gap-2">
        <SuccessBadge />
        <DangerBadge />
        <ReservedBadge />
        <Badge variant="unavailable" />
        <Badge variant="subscription" />
        <RewardBadge />
        <WaitlistBadge />
        <NewBadge />
        <UnreadBadge count={3} />
        <UnreadBadge count={120} />
      </div>
      <h3 className="text-sm font-semibold text-gray-500">Chips</h3>
      <div className="flex flex-wrap gap-2">
        <Chip label="Coupe" selected />
        <Chip label="Barbe" />
        <Chip label="Adulte" />
        <Chip label="Enfant" />
        <Chip label="En attente" />
      </div>
      <h3 className="text-sm font-semibold text-gray-500">Avatars</h3>
      <div className="flex items-center gap-4">
        <Avatar size="sm" name="Djo Coiffe" />
        <Avatar size="md" name="Ahmed Ben" />
        <Avatar size="lg" name="Mohamed Ali" />
        <Avatar size="md" src="https://placehold.co/100x100" name="Photo" />
      </div>
    </div>
  ),
}
