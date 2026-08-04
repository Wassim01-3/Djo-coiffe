import React from 'react'
import { TextInput, type TextInputProps } from './TextInput'

export const TimePicker: React.FC<TextInputProps> = (props) => {
  return <TextInput type="time" {...props} />
}
