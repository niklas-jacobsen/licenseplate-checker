import { Position, type NodeProps } from '@xyflow/react'
import { Flag } from 'lucide-react'
import { BaseNode, BaseNodeHeader, type BuilderNode } from './base-node'
import { BaseHandle } from './base-handle'

export function EndNode({ data }: NodeProps<BuilderNode>) {
  return (
    <BaseNode>
      <BaseNodeHeader icon={Flag} label={data.label} />
      <BaseHandle type="target" position={Position.Top} id="in" />
    </BaseNode>
  )
}
