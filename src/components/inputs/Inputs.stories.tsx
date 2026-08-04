import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TextInput } from './TextInput'
import { PhoneInput } from './PhoneInput'
import { SearchInput } from './SearchInput'
import { SelectInput } from './SelectInput'
import { TextArea } from './TextArea'
import { Switch } from './Switch'
import { Checkbox } from './Checkbox'
import { RadioGroup } from './RadioGroup'

const meta: Meta = {
  title: 'Components/Inputs',
  parameters: { layout: 'centered' },
}
export default meta

export const AllInputs: StoryObj = {
  render: () => {
    const [checked, setChecked] = useState(false)
    const [checkboxVal, setCheckboxVal] = useState(false)
    const [radio, setRadio] = useState('adulte')

    return (
      <div className="flex flex-col gap-6 w-96 p-4 bg-background rounded-3xl">
        <TextInput label="Nom complet" placeholder="Djo Coiffe" />
        <TextInput
          label="Erreur"
          placeholder="..."
          error="Ce champ est requis"
        />
        <TextInput label="Succès" placeholder="..." success />
        <PhoneInput label="Téléphone" />
        <SearchInput placeholder="Rechercher un service..." />
        <SelectInput
          label="Coiffeur"
          options={[
            { value: '1', label: 'Barber 1' },
            { value: '2', label: 'Barber 2' },
          ]}
        />
        <TextArea label="Notes" placeholder="Vos remarques..." />
        <Switch
          label="Recevoir les notifications"
          checked={checked}
          onChange={setChecked}
        />
        <Checkbox
          label="J'accepte les conditions"
          checked={checkboxVal}
          onChange={setCheckboxVal}
        />
        <RadioGroup
          name="category"
          label="Catégorie"
          value={radio}
          onChange={setRadio}
          options={[
            { value: 'enfant', label: 'Enfant' },
            { value: 'jeune', label: 'Jeune' },
            { value: 'adulte', label: 'Adulte' },
          ]}
        />
      </div>
    )
  },
}
