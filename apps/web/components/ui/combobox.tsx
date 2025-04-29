'use client'

import * as React from 'react'
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

const germanCities = [
  { value: 'B', label: 'Berlin' },
  { value: 'M', label: 'München (Munich)' },
  { value: 'K', label: 'Köln (Cologne)' },
  { value: 'F', label: 'Frankfurt' },
  { value: 'S', label: 'Stuttgart' },
  { value: 'D', label: 'Düsseldorf' },
  { value: 'HH', label: 'Hamburg' },
  { value: 'L', label: 'Leipzig' },
  { value: 'HB', label: 'Bremen' },
  { value: 'H', label: 'Hannover' },
  { value: 'DD', label: 'Dresden' },
  { value: 'N', label: 'Nürnberg (Nuremberg)' },
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
  //   onChange: (value: string) => void
  //   onBlur?: () => void
  //   error?: boolean
}

export default function Combobox({ value }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [_inputValue, setInputValue] = React.useState(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? germanCities.find((city) => city.value === value)?.label
            : 'Select city...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search city..." />
          <CommandList>
            <CommandEmpty>No city found.</CommandEmpty>
            <CommandGroup>
              {germanCities.map((city) => (
                <CommandItem
                  key={city.value}
                  value={city.value}
                  onSelect={(currentValue) => {
                    setInputValue(currentValue === value ? '' : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === city.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {city.label}
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
