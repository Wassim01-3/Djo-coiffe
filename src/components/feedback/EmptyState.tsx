import React from 'react'
import { PrimaryButton } from '../buttons/PrimaryButton'

export interface EmptyStateProps {
  illustration?: string
  title: string
  message?: string
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  illustration,
  title,
  message,
  actionLabel,
  onAction,
}) => (
  <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
    <div className="text-7xl mb-2">{illustration ?? '📭'}</div>
    <h3 className="text-lg font-bold text-primary">{title}</h3>
    {message && <p className="text-sm text-gray-500 max-w-xs">{message}</p>}
    {actionLabel && onAction && (
      <div className="mt-2 w-full max-w-xs">
        <PrimaryButton onClick={onAction}>{actionLabel}</PrimaryButton>
      </div>
    )}
  </div>
)

// Pre-configured empty states
export const EmptyReservations: React.FC<{ onAction?: () => void }> = ({
  onAction,
}) => (
  <EmptyState
    illustration="📅"
    title="Aucune réservation"
    message="Vous n'avez pas encore de réservation. Prenez rendez-vous maintenant!"
    actionLabel="Réserver maintenant"
    onAction={onAction}
  />
)
export const EmptyGallery: React.FC<{ onAction?: () => void }> = ({
  onAction,
}) => (
  <EmptyState
    illustration="🖼️"
    title="Galerie vide"
    message="Aucune photo pour le moment."
    actionLabel="Voir les services"
    onAction={onAction}
  />
)
export const EmptyProducts: React.FC<{ onAction?: () => void }> = ({
  onAction,
}) => (
  <EmptyState
    illustration="🧴"
    title="Aucun produit"
    message="Aucun produit disponible pour le moment."
    actionLabel="Réserver"
    onAction={onAction}
  />
)
export const EmptyNotifications: React.FC = () => (
  <EmptyState
    illustration="🔕"
    title="Aucune notification"
    message="Vous n'avez aucune notification pour l'instant."
  />
)
export const EmptySubscription: React.FC<{ onAction?: () => void }> = ({
  onAction,
}) => (
  <EmptyState
    illustration="💎"
    title="Pas d'abonnement"
    message="Souscrivez à un abonnement pour bénéficier de tarifs préférentiels."
    actionLabel="Voir les abonnements"
    onAction={onAction}
  />
)
export const EmptyLoyalty: React.FC<{ onAction?: () => void }> = ({
  onAction,
}) => (
  <EmptyState
    illustration="⭐"
    title="Fidélité"
    message="Commencez à accumuler des points à chaque visite!"
    actionLabel="Réserver"
    onAction={onAction}
  />
)
export const EmptySearch: React.FC = () => (
  <EmptyState
    illustration="🔍"
    title="Aucun résultat"
    message="Aucun élément ne correspond à votre recherche."
  />
)
