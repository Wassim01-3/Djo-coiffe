import { Scissors, Star, Package, Droplets, Sparkles, User, Baby, CircleDot } from 'lucide-react'

export const AVAILABLE_ICONS = [
  { id: 'Scissors', icon: Scissors, label: 'Ciseaux' },
  { id: 'Star', icon: Star, label: 'Étoile' },
  { id: 'Package', icon: Package, label: 'Pack' },
  { id: 'Droplets', icon: Droplets, label: 'Soin / Eau' },
  { id: 'Sparkles', icon: Sparkles, label: 'Premium' },
  { id: 'User', icon: User, label: 'Homme' },
  { id: 'Baby', icon: Baby, label: 'Enfant' },
  { id: 'CircleDot', icon: CircleDot, label: 'Rasage' },
]

export const getIconComponent = (iconName: string) => {
  const match = AVAILABLE_ICONS.find(i => i.id === iconName)
  return match ? match.icon : Scissors
}
