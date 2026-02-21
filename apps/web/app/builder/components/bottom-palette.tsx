'use client'

import { useRef, useState } from 'react'
import {
  MousePointerClick,
  Keyboard,
  Globe,
  GitBranch,
  Clock,
  ListChecks,
  FlagTriangleRight,
  Play,
  Loader2,
  RotateCcw,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { CoreNodeType } from '@licenseplate-checker/shared/workflow-dsl/types'
import { PALETTE_NODES } from '../config'
import { useBuilderStore, useShallow } from '../store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TestDialog } from './test-dialog'

const NODE_ICONS: Record<string, LucideIcon> = {
  'core.click': MousePointerClick,
  'core.typeText': Keyboard,
  'core.openPage': Globe,
  'core.conditional': GitBranch,
  'core.wait': Clock,
  'core.selectOption': ListChecks,
  'core.end': FlagTriangleRight,
}

function PaletteItem({
  type,
  label,
  onAdd,
}: {
  type: CoreNodeType
  label: string
  onAdd: () => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const dragPreviewRef = useRef<HTMLDivElement>(null)
  const Icon = NODE_ICONS[type]

  return (
    <>
      <div
        ref={dragPreviewRef}
        className="pointer-events-none fixed -left-2499.75 flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm font-medium shadow-lg"
      >
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'rounded-full gap-1.5',
          isDragging && 'ring-2 ring-primary'
        )}
        draggable
        onClick={onAdd}
        onDragStart={(e) => {
          e.dataTransfer.setData(
            'application/reactflow',
            JSON.stringify({ type })
          )
          e.dataTransfer.effectAllowed = 'move'
          if (dragPreviewRef.current) {
            e.dataTransfer.setDragImage(dragPreviewRef.current, 0, 0)
          }
          setIsDragging(true)
        }}
        onDragEnd={() => setIsDragging(false)}
      >
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </Button>
    </>
  )
}

function TestButton() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { isExecuting, executionError, testsRemaining, resetExecution } =
    useBuilderStore(
      useShallow((s) => ({
        isExecuting: s.isExecuting,
        executionError: s.executionError,
        testsRemaining: s.testsRemaining,
        resetExecution: s.resetExecution,
      }))
    )

  if (isExecuting) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="rounded-full text-muted-foreground"
        disabled
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Running
      </Button>
    )
  }

  if (executionError) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="rounded-full text-muted-foreground"
        onClick={resetExecution}
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="rounded-full text-muted-foreground"
        onClick={() => setDialogOpen(true)}
        disabled={testsRemaining === 0}
      >
        <Play className="h-3.5 w-3.5" />
        Test{testsRemaining !== null && ` (${testsRemaining} left)`}
      </Button>
      <TestDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}

export function BottomPalette({
  onAdd,
}: {
  onAdd: (type: CoreNodeType) => void
}) {
  return (
    <Card className="nopan absolute bottom-6 left-1/2 z-20 flex w-fit -translate-x-1/2 flex-row items-center gap-2 rounded-full border bg-background/90 p-2 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-1">
        {PALETTE_NODES.map((node) => (
          <PaletteItem
            key={node.type}
            type={node.type}
            label={node.label}
            onAdd={() => onAdd(node.type)}
          />
        ))}
      </div>

      <div className="mx-0.5 h-8 w-px bg-border" />

      <TestButton />
    </Card>
  )
}
