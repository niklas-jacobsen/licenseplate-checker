import { Handle, type HandleProps } from '@xyflow/react'
import { cn } from '@/lib/utils'

export function BaseHandle({
  className,
  ...props
}: HandleProps & { className?: string }) {
  const isTarget = props.type === 'target'

  return (
    <Handle
      className={cn(
        'h-2.75! w-2.75! rounded-full! border-2!',
        isTarget
          ? 'bg-emerald-100! border-emerald-400!'
          : 'bg-blue-100! border-blue-400!',
        className
      )}
      {...props}
    />
  )
}
