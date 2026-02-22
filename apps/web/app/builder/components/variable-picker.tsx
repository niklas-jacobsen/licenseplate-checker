'use client'

import { Braces } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { TEMPLATE_VARIABLES } from '@licenseplate-checker/shared/template-variables'
import { useState } from 'react'
import { useAuth } from '@/components/auth-context'

const USER_KEY_TO_FIELD: Record<string, string> = {
  'user.salutation': 'salutation',
  'user.firstname': 'firstname',
  'user.lastname': 'lastname',
  'user.birthdate': 'birthdate',
  'user.street': 'street',
  'user.streetNumber': 'streetNumber',
  'user.zipcode': 'zipcode',
  'user.city': 'city',
}

export function VariablePicker({
  onInsert,
  disabledKeys,
  disabled,
}: {
  onInsert: (template: string) => void
  disabledKeys?: Set<string>
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  const groups = TEMPLATE_VARIABLES.reduce(
    (acc, v) => {
      ;(acc[v.group] ??= []).push(v)
      return acc
    },
    {} as Record<string, typeof TEMPLATE_VARIABLES>
  )

  function previewFor(v: (typeof TEMPLATE_VARIABLES)[number]): string {
    const field = USER_KEY_TO_FIELD[v.key]
    if (field && user) {
      const val = (user as unknown as Record<string, unknown>)[field]
      if (val != null && val !== '') return String(val)
    }
    return v.example
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="nodrag h-6 w-6 shrink-0"
          title="Insert variable"
          disabled={disabled}
        >
          <Braces className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-2"
        side="right"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {Object.entries(groups).map(([group, vars]) => (
          <div key={group}>
            <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
              {group}
            </p>
            {vars.map((v) => {
              const isDisabled = disabledKeys?.has(v.key) ?? false
              const preview = previewFor(v)
              return (
                <button
                  key={v.key}
                  type="button"
                  className="flex w-full items-center justify-between rounded-sm px-2 py-1 text-xs hover:bg-accent disabled:opacity-40 disabled:pointer-events-none"
                  disabled={isDisabled}
                  onClick={() => {
                    onInsert(`{{ ${v.key} }}`)
                    setOpen(false)
                  }}
                >
                  <span className="font-mono text-foreground">{v.label}</span>
                  <span className="text-muted-foreground">
                    {isDisabled ? 'In use' : preview}
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}
