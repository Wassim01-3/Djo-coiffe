import React from 'react'
import { Search } from 'lucide-react'

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const SearchInput: React.FC<SearchInputProps> = ({
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <div className="relative w-full">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="search"
          placeholder="Rechercher..."
          className="min-h-[48px] w-full rounded-[16px] border border-border bg-white pl-12 pr-4 py-3 text-primary placeholder-gray-400 outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-danger font-medium">{error}</span>
      )}
    </div>
  )
}
