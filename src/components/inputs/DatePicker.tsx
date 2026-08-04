import React from 'react'
import { TextInput, type TextInputProps } from './TextInput'

export const DatePicker: React.FC<TextInputProps> = (props) => {
  return <TextInput type="date" {...props} />
}
