'use client'

import { useState, useEffect, useMemo } from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@shared/lib/utils'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'
import { cityService, type City } from '../services/city.service'

interface CityPickerProps {
  value: string
  onChange: (cityId: string) => void
  error?: boolean
  disabled?: boolean
  cities?: City[]
}

export default function CityPicker({
  value,
  onChange,
  error,
  disabled,
  cities: externalCities,
}: CityPickerProps) {
  const [open, setOpen] = useState(false)
  const [internalCities, setInternalCities] = useState<City[]>([])
  const [loading, setLoading] = useState(!externalCities)

  useEffect(() => {
    if (externalCities) return
    const controller = new AbortController()
    cityService
      .getCities(controller.signal)
      .then((res) => {
        if (res.data?.cities) setInternalCities(res.data.cities)
      })
      .catch(() => {
        /* comment to satisfy linter */
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [externalCities])

  const allCities = externalCities ?? internalCities

  const cities = useMemo(
    () =>
      allCities
        .filter((c) => c.allowedDomains && c.allowedDomains.length > 0)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [allCities]
  )

  const selected = cities.find((c) => c.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || loading}
          className={cn(
            'w-full h-9 justify-between font-normal',
            error && 'border-red-500',
            !selected && 'text-muted-foreground'
          )}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading...
            </span>
          ) : selected ? (
            <span className="truncate">
              {selected.name}{' '}
              <span className="text-muted-foreground">({selected.id})</span>
            </span>
          ) : (
            'Select a city'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-(--radix-popover-trigger-width)"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search by name or code..." />
          <CommandList>
            <CommandEmpty>No matching city found.</CommandEmpty>
            <CommandGroup>
              {cities.map((city) => (
                <CommandItem
                  key={city.id}
                  value={`${city.name} ${city.id}`}
                  onSelect={() => {
                    onChange(city.id)
                    setOpen(false)
                  }}
                  className="flex items-center gap-3 py-2 cursor-pointer"
                >
                  <Check
                    className={cn(
                      'h-4 w-4 shrink-0',
                      value === city.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="flex-1 truncate">{city.name}</span>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {city.id}
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
