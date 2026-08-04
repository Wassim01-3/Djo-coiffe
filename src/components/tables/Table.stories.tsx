import type { Meta, StoryObj } from '@storybook/react-vite'
import { Table } from './Table'
import { SuccessBadge, DangerBadge } from '../common/Badge'

const meta: Meta = {
  title: 'Components/Tables',
  parameters: { layout: 'fullscreen' },
}
export default meta

interface MockRow {
  id: string
  client: string
  service: string
  date: string
  status: string
}

const MOCK_DATA: MockRow[] = [
  {
    id: '1',
    client: 'Ahmed Ben',
    service: 'Coupe + Barbe',
    date: '2026-08-03 10:30',
    status: 'confirmed',
  },
  {
    id: '2',
    client: 'Mohamed Ali',
    service: 'Coupe simple',
    date: '2026-08-03 11:00',
    status: 'pending',
  },
  {
    id: '3',
    client: 'Sami Kamel',
    service: 'Coupe enfant',
    date: '2026-08-03 11:30',
    status: 'completed',
  },
  {
    id: '4',
    client: 'Yassine Mrad',
    service: 'Barbe',
    date: '2026-08-03 12:00',
    status: 'cancelled',
  },
]

export const AdminTable: StoryObj = {
  render: () => (
    <div className="p-6 bg-background min-h-screen">
      <Table<MockRow>
        columns={[
          { key: 'client', label: 'Client', sortable: true },
          { key: 'service', label: 'Service', sortable: true },
          { key: 'date', label: 'Date & Heure', sortable: true },
          {
            key: 'status',
            label: 'Statut',
            render: (val) =>
              val === 'confirmed' || val === 'completed' ? (
                <SuccessBadge>{String(val)}</SuccessBadge>
              ) : (
                <DangerBadge>{String(val)}</DangerBadge>
              ),
          },
        ]}
        data={MOCK_DATA}
      />
    </div>
  ),
}

export const LoadingTable: StoryObj = {
  render: () => (
    <div className="p-6 bg-background min-h-screen">
      <Table<MockRow>
        columns={[
          { key: 'client', label: 'Client' },
          { key: 'service', label: 'Service' },
          { key: 'date', label: 'Date' },
          { key: 'status', label: 'Statut' },
        ]}
        data={[]}
        isLoading
      />
    </div>
  ),
}
