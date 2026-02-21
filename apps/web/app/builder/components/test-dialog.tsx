'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBuilderStore, useShallow } from '../store'

export function TestDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { testVariables, testsRemaining, testExecute } = useBuilderStore(
    useShallow((s) => ({
      testVariables: s.testVariables,
      testsRemaining: s.testsRemaining,
      testExecute: s.testExecute,
    }))
  )

  const [letters, setLetters] = useState(testVariables.letters)
  const [numbers, setNumbers] = useState(testVariables.numbers)

  const canRun =
    letters.length > 0 &&
    numbers.length > 0 &&
    testsRemaining !== 0

  const handleRun = () => {
    if (!canRun) return
    onOpenChange(false)
    testExecute({ letters, numbers })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Test Workflow</DialogTitle>
          <DialogDescription>
            Enter the plate values to test with.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="test-letters">Letters</Label>
            <Input
              id="test-letters"
              placeholder="AB"
              maxLength={2}
              value={letters}
              onChange={(e) => setLetters(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleRun()}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="test-numbers">Numbers</Label>
            <Input
              id="test-numbers"
              placeholder="1234"
              maxLength={4}
              inputMode="numeric"
              value={numbers}
              onChange={(e) =>
                setNumbers(e.target.value.replace(/\D/g, ''))
              }
              onKeyDown={(e) => e.key === 'Enter' && handleRun()}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleRun} disabled={!canRun} size="sm">
            <Play className="h-3.5 w-3.5" />
            Run Test
            {testsRemaining !== null && ` (${testsRemaining} left)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
