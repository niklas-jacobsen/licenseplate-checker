'use client'

import { AlertTriangle, X } from 'lucide-react'
import { useBuilderStore, useShallow } from '../store'

export function ExecutionErrorBanner() {
  const { executionError, resetExecution } = useBuilderStore(
    useShallow((s) => ({
      executionError: s.executionError,
      resetExecution: s.resetExecution,
    }))
  )

  if (!executionError) return null

  return (
    <div className="nopan absolute bottom-24 left-1/2 z-20 w-fit max-w-md -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="rounded-lg border border-destructive/30 bg-background/95 px-4 py-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-foreground">
              {executionError.message}
            </p>
            {executionError.issues && executionError.issues.length > 0 && (
              <ul className="space-y-0.5">
                {executionError.issues.map((issue, i) => (
                  <li
                    key={i}
                    className="text-xs text-muted-foreground"
                  >
                    {issue}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            onClick={resetExecution}
            className="shrink-0 rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
