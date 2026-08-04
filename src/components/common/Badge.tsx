import React from 'react'

type BadgeVariant =
  | 'success'
  | 'danger'
  | 'reserved'
  | 'unavailable'
  | 'subscription'
  | 'reward'
  | 'waitlist'
  | 'new'
  | 'unread'

export interface BadgeProps {
  variant: BadgeVariant
  children?: React.ReactNode
  count?: number
}

const BADGE_STYLES: Record<BadgeVariant, string> = {
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  reserved: 'bg-reserved/10 text-reserved',
  unavailable: 'bg-unavailable/10 text-unavailable',
  subscription: 'bg-accent/10 text-accent',
  reward: 'bg-accent text-white',
  waitlist: 'bg-yellow-50 text-yellow-700',
  new: 'bg-blue-50 text-blue-700',
  unread: 'bg-accent text-white',
}

const BADGE_LABELS: Record<BadgeVariant, string> = {
  success: 'Confirmé',
  danger: 'Annulé',
  reserved: 'Réservé',
  unavailable: 'Indisponible',
  subscription: 'Abonné',
  reward: 'Récompense',
  waitlist: "Liste d'attente",
  new: 'Nouveau',
  unread: '',
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, count }) => {
  if (variant === 'unread' && count !== undefined) {
    return (
      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold text-white">
        {count > 99 ? '99+' : count}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${BADGE_STYLES[variant]}`}
    >
      {children ?? BADGE_LABELS[variant]}
    </span>
  )
}

// Named exports for each badge variant
export const SuccessBadge: React.FC<{ children?: React.ReactNode }> = (p) => (
  <Badge variant="success" {...p} />
)
export const DangerBadge: React.FC<{ children?: React.ReactNode }> = (p) => (
  <Badge variant="danger" {...p} />
)
export const ReservedBadge: React.FC<{ children?: React.ReactNode }> = (p) => (
  <Badge variant="reserved" {...p} />
)
export const UnavailableBadge: React.FC<{ children?: React.ReactNode }> = (
  p,
) => <Badge variant="unavailable" {...p} />
export const SubscriptionBadge: React.FC<{ children?: React.ReactNode }> = (
  p,
) => <Badge variant="subscription" {...p} />
export const RewardBadge: React.FC<{ children?: React.ReactNode }> = (p) => (
  <Badge variant="reward" {...p} />
)
export const WaitlistBadge: React.FC<{ children?: React.ReactNode }> = (p) => (
  <Badge variant="waitlist" {...p} />
)
export const NewBadge: React.FC<{ children?: React.ReactNode }> = (p) => (
  <Badge variant="new" {...p} />
)
export const UnreadBadge: React.FC<{ count: number }> = ({ count }) => (
  <Badge variant="unread" count={count} />
)
