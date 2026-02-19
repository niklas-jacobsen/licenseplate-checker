import { Position, type NodeProps } from '@xyflow/react'
import { Play } from 'lucide-react'
import { BaseNode, BaseNodeHeader, type BuilderNode } from './base-node'
import { BaseHandle } from './base-handle'

export function StartNode({ data }: NodeProps<BuilderNode>) {
  return (
    <BaseNode>
      <BaseNodeHeader icon={Play} label={data.label} />
      <BaseHandle type="source" position={Position.Bottom} id="next" />
    </BaseNode>
  )
}
