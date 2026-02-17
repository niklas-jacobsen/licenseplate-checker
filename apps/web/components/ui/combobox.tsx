'use client'

import { useState, useRef } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@shared/lib/utils'
import { Button } from './button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

export interface ComboboxItem {
  value: string
  label: string
}

interface ComboboxProps {
  value: string
  onChange: (value: string) => void
  error?: boolean
  items: ComboboxItem[]
  placeholder?: string
}

export default function Combobox({ value, onChange, error, items, placeholder = 'Select ...' }: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (newValue: string) => {
    const sanitizedValue = newValue.replace(/[^A-Za-z]/g, '')
    setInputValue(sanitizedValue)

    const matchingItem = items.find(
      (item) => item.value === sanitizedValue
    )

    if (matchingItem) {
      onChange(matchingItem.value)
    } else {
      onChange(sanitizedValue)
    }
  }

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setOpen(false)
    inputRef.current?.focus()
  }

  const selectedItem = items.find((item) => item.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full h-9 rounded-md border px-3 py-1 text-base shadow-xs flex justify-between items-center overflow-hidden',
            error && 'border-red-500'
          )}
        >
          {selectedItem ? (
            <span className="truncate flex-1 text-left min-w-0">
              {selectedItem.label} (<strong>{selectedItem.value}</strong>)
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <Command>
          <CommandInput
            placeholder="Search city code..."
            value={inputValue}
            onValueChange={handleInputChange}
            ref={inputRef}
          />
          <CommandList>
            <CommandEmpty>No city found.</CommandEmpty>
            <CommandGroup>
              {items
                .filter(
                  (item) =>
                    item.value
                      .toLowerCase()
                      .includes(inputValue.toLowerCase()) ||
                    item.label.toLowerCase().includes(inputValue.toLowerCase())
                )
                .map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={() => handleSelect(item.value)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === item.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className="truncate">
                      {item.label} (<strong>{item.value}</strong>)
                    </span>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { Combobox }
