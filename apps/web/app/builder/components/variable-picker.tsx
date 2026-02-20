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

export function VariablePicker({
  onInsert,
}: {
  onInsert: (template: string) => void
}) {
  const [open, setOpen] = useState(false)

  const groups = TEMPLATE_VARIABLES.reduce(
    (acc, v) => {
      ;(acc[v.group] ??= []).push(v)
      return acc
    },
    {} as Record<string, typeof TEMPLATE_VARIABLES>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="nodrag h-7 w-7 shrink-0"
          title="Insert variable"
        >
          <Braces className="h-3.5 w-3.5" />
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
            {vars.map((v) => (
              <button
                key={v.key}
                type="button"
                className="flex w-full items-center justify-between rounded-sm px-2 py-1 text-xs hover:bg-accent"
                onClick={() => {
                  onInsert(`{{ ${v.key} }}`)
                  setOpen(false)
                }}
              >
                <span className="font-mono text-foreground">{v.label}</span>
                <span className="text-muted-foreground">{v.example}</span>
              </button>
            ))}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}
