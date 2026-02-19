import { type ReactNode } from 'react'
import { type Node } from '@xyflow/react'
import { cn } from '@/lib/utils'
import { type LucideIcon, X } from 'lucide-react'

export type NodeData = {
  label: string
  config: Record<string, unknown>
}

export type BuilderNode = Node<NodeData>

export function BaseNode({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'w-65 rounded-md border bg-card shadow-sm',
        'hover:ring-1 hover:ring-border',
        '[.react-flow__node.selected_&]:ring-2 [.react-flow__node.selected_&]:ring-primary [.react-flow__node.selected_&]:shadow-lg',
        className
      )}
    >
      {children}
    </div>
  )
}

export function BaseNodeHeader({
  icon: Icon,
  label,
  onDelete,
}: {
  icon: LucideIcon
  label: string
  onDelete?: () => void
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-sm font-medium truncate flex-1">{label}</span>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="nodrag h-5 w-5 flex items-center justify-center rounded-sm text-muted-foreground opacity-0 group-hover/node:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-opacity"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

export function BaseNodeContent({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('px-3 py-2 space-y-2', className)}>{children}</div>
}
