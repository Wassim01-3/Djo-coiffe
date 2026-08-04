import React from 'react'
import { TextInput, type TextInputProps } from './TextInput'

export const NumberInput: React.FC<TextInputProps> = (props) => {
  return <TextInput type="number" {...props} />
}
