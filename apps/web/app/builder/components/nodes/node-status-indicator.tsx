import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type NodeStatus = 'idle' | 'loading' | 'success' | 'error'

export function NodeStatusIndicator({
  status = 'idle',
  children,
}: {
  status?: NodeStatus
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-md',
        status === 'loading' && 'animate-status-loading ring-2 ring-blue-400',
        status === 'success' && 'ring-2 ring-emerald-500',
        status === 'error' && 'ring-2 ring-red-400'
      )}
    >
      {children}
    </div>
  )
}
