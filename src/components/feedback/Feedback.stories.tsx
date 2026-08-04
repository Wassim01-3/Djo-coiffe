import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  SkeletonCard,
  SkeletonList,
  SkeletonProfile,
  SkeletonGallery,
  SkeletonProduct,
} from './Skeletons'
import {
  EmptyReservations,
  EmptyNotifications,
  EmptySearch,
} from './EmptyState'
import { ErrorState } from './ErrorState'

const meta: Meta = {
  title: 'Components/Feedback',
  parameters: { layout: 'centered' },
}
export default meta

export const Skeletons: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6 w-96 p-4 bg-background rounded-3xl">
      <div>
        <h3 className="text-xs text-gray-400 font-semibold uppercase mb-2">
          Skeleton Card
        </h3>
        <SkeletonCard />
      </div>
      <div>
        <h3 className="text-xs text-gray-400 font-semibold uppercase mb-2">
          Skeleton List
        </h3>
        <SkeletonList count={2} />
      </div>
      <div>
        <h3 className="text-xs text-gray-400 font-semibold uppercase mb-2">
          Skeleton Gallery
        </h3>
        <SkeletonGallery />
      </div>
      <div>
        <h3 className="text-xs text-gray-400 font-semibold uppercase mb-2">
          Skeleton Product
        </h3>
        <SkeletonProduct />
      </div>
      <div>
        <h3 className="text-xs text-gray-400 font-semibold uppercase mb-2">
          Skeleton Profile
        </h3>
        <SkeletonProfile />
      </div>
    </div>
  ),
}

export const EmptyStates: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4 w-96 p-4 bg-background rounded-3xl">
      <EmptyReservations onAction={() => alert('Réserver!')} />
      <hr className="border-divider" />
      <EmptyNotifications />
      <hr className="border-divider" />
      <EmptySearch />
      <hr className="border-divider" />
      <ErrorState onRetry={() => alert('Retry!')} />
    </div>
  ),
}
