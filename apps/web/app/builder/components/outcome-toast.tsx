'use client'

import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBuilderStore, useShallow } from '../store'

const OUTCOME_LABELS: Record<string, string> = {
  available: 'Available',
  unavailable: 'Not Available',
  unknown: 'Unknown',
}

export function OutcomeToast() {
  const { lastOutcome, confirmOutcome, rejectOutcome } = useBuilderStore(
    useShallow((s) => ({
      lastOutcome: s.lastOutcome,
      confirmOutcome: s.confirmOutcome,
      rejectOutcome: s.rejectOutcome,
    }))
  )

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (lastOutcome) {
      // trigger enter animation
      requestAnimationFrame(() => setVisible(true))

      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(rejectOutcome, 300)
      }, 10000)

      return () => clearTimeout(timer)
    }
    setVisible(false)
  }, [lastOutcome, rejectOutcome])

  if (!lastOutcome) return null

  const label = OUTCOME_LABELS[lastOutcome.outcome] ?? lastOutcome.outcome
  const failed = lastOutcome.status === 'FAILED'

  const handleFeedback = (expected: boolean) => {
    setVisible(false)
    setTimeout(expected ? confirmOutcome : rejectOutcome, 300)
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg transition-all duration-300 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-2 opacity-0'
      }`}
    >
      <div className="text-sm">
        <span className="font-medium">
          {failed ? 'Execution failed' : `Outcome: ${label}`}
        </span>
        <span className="ml-2 text-muted-foreground">
          Was this expected?
        </span>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={() => handleFeedback(true)}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => handleFeedback(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
