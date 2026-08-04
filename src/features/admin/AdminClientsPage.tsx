import React, { useEffect, useState, useMemo } from 'react'
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '@appFirebase/config'
import { Search, UserCircle, Phone, Ban, CheckCircle2, Crown } from 'lucide-react'
import type { User } from '@appTypes/models'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@constants/routes'

const AdminClientsPage: React.FC = () => {
  const navigate = useNavigate()
  const [clients, setClients] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const data = snap.docs.map((d) => d.data() as User)
      setClients(data)
      setIsLoading(false)
    })
    return () => unsub()
  }, [])

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients
    const lower = search.toLowerCase()
    return clients.filter(
      (c) =>
        c.fullName.toLowerCase().includes(lower) ||
        c.phoneNumber.toLowerCase().includes(lower)
    )
  }, [clients, search])

  const toggleBlockStatus = async (client: User) => {
    try {
      await updateDoc(doc(db, 'users', client.id), {
        isBlocked: !client.isBlocked,
      })
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la mise à jour.')
    }
  }

  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Chargement...</div>
  }

  return (
    <div className="p-4 md:p-6 pb-24 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-xl font-bold text-primary md:text-2xl">Clients</h1>
        <p className="mt-1 text-sm text-gray-500">Gérez la base de données clients et les blocages.</p>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom ou numéro..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-gray-500">Aucun client trouvé.</p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <div
              key={client.id}
              className={`flex flex-col rounded-2xl border p-4 shadow-sm transition-all ${
                client.isBlocked ? 'border-danger/30 bg-danger/5 opacity-70' : 'border-gray-200 bg-white hover:border-accent/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <UserCircle className="h-7 w-7 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary">{client.fullName || 'Sans nom'}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone className="h-3 w-3" />
                      {client.phoneNumber}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-gray-50 p-2 text-center">
                  <p className="font-bold text-primary">{client.completedHaircuts || 0}</p>
                  <p className="text-gray-500">Coupes</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-2 text-center">
                  <p className="font-bold text-accent">{client.loyaltyCounter || 0}/5</p>
                  <p className="text-gray-500">Fidélité</p>
                </div>
              </div>

              {/* Status Row */}
              <div className="mt-3 flex flex-wrap gap-2">
                {client.rewardAvailable && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[10px] font-bold text-success">
                    <CheckCircle2 className="h-3 w-3" />
                    Récompense Dispo
                  </span>
                )}
                {client.activeSubscriptionId && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-[10px] font-bold text-accent">
                    <Crown className="h-3 w-3" />
                    VIP
                  </span>
                )}
                {client.isBlocked && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2 py-1 text-[10px] font-bold text-danger">
                    <Ban className="h-3 w-3" />
                    Bloqué
                  </span>
                )}
              </div>

              <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
                <button
                  onClick={() => toggleBlockStatus(client)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-colors ${
                    client.isBlocked
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-danger/10 text-danger hover:bg-danger hover:text-white'
                  }`}
                >
                  <Ban className="h-3.5 w-3.5" />
                  {client.isBlocked ? 'Débloquer' : 'Bloquer'}
                </button>
                <button
                  onClick={() => navigate(ROUTES.ADMIN_SUBSCRIPTIONS)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-100 py-2 text-xs font-semibold text-primary transition-colors hover:bg-gray-200"
                >
                  <Crown className="h-3.5 w-3.5" />
                  Abo
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AdminClientsPage
