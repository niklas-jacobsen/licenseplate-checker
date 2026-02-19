'use client'

import { useRef, useState } from 'react'
import {
  MousePointerClick,
  Keyboard,
  Globe,
  GitBranch,
  Clock,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { CoreNodeType } from '@licenseplate-checker/shared/workflow-dsl/types'
import { PALETTE_NODES } from '../config'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NODE_ICONS: Record<string, LucideIcon> = {
  'core.click': MousePointerClick,
  'core.typeText': Keyboard,
  'core.openPage': Globe,
  'core.conditional': GitBranch,
  'core.wait': Clock,
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

      <div className="mx-2 h-6 w-px bg-border" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full text-muted-foreground"
        >
          Test
        </Button>
      </div>
    </Card>
  )
}
