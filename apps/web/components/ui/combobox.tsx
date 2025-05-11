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

// Placeholder cities
const germanCities = [
  { value: 'B', label: 'Berlin' },
  { value: 'M', label: 'München' },
  { value: 'K', label: 'Köln' },
  { value: 'F', label: 'Frankfurt' },
  { value: 'S', label: 'Stuttgart' },
  { value: 'D', label: 'Düsseldorf' },
  { value: 'HH', label: 'Hamburg' },
  { value: 'L', label: 'Leipzig' },
  { value: 'HB', label: 'Bremen' },
  { value: 'H', label: 'Hannover' },
  { value: 'DD', label: 'Dresden' },
  { value: 'N', label: 'Nürnberg' },
  { value: 'DO', label: 'Dortmund' },
  { value: 'E', label: 'Essen' },
  { value: 'BI', label: 'Bielefeld' },
  { value: 'BN', label: 'Bonn' },
  { value: 'WI', label: 'Wiesbaden' },
  { value: 'MS', label: 'Münster' },
  { value: 'AC', label: 'Aachen' },
  { value: 'KA', label: 'Karlsruhe' },
]

interface ComboboxProps {
  value: string
  onChange: (value: string) => void
  error?: boolean
}

export default function Combobox({ value, onChange, error }: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (newValue: string) => {
    const sanitizedValue = newValue.replace(/[^A-Za-z]/g, '')
    setInputValue(sanitizedValue)

    const matchingCity = germanCities.find(
      (city) => city.value === sanitizedValue
    )

    if (matchingCity) {
      onChange(matchingCity.value)
    } else {
      onChange(sanitizedValue)
    }
  }

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setOpen(false)
    inputRef.current?.focus()
  }

  const selectedCity = germanCities.find((city) => city.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full h-9 rounded-md border px-3 py-1 text-base shadow-xs flex justify-between items-center',
            error && 'border-red-500'
          )}
        >
          {selectedCity ? (
            <span>
              {selectedCity.label} (<strong>{selectedCity.value}</strong>)
            </span>
          ) : (
            'Select city...'
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
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
              {germanCities
                .filter(
                  (city) =>
                    city.value
                      .toLowerCase()
                      .includes(inputValue.toLowerCase()) ||
                    city.label.toLowerCase().includes(inputValue.toLowerCase())
                )
                .map((city) => (
                  <CommandItem
                    key={city.value}
                    value={city.value}
                    onSelect={() => handleSelect(city.value)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === city.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span>
                      {city.label} (<strong>{city.value}</strong>)
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
