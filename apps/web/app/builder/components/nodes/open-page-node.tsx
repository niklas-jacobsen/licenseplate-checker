import { Position, type NodeProps } from '@xyflow/react'
import { Globe } from 'lucide-react'
import { BaseNode, BaseNodeHeader, BaseNodeContent, type BuilderNode } from './base-node'
import { BaseHandle } from './base-handle'
import { useBuilderStore } from '../../store'

export function OpenPageNode({ id, data }: NodeProps<BuilderNode>) {
  const updateConfig = useBuilderStore((s) => s.updateNodeConfig)
  const removeNode = useBuilderStore((s) => s.removeNode)

  return (
    <BaseNode className="group/node">
      <BaseNodeHeader
        icon={Globe}
        label={data.label}
        onDelete={() => removeNode(id)}
      />
      <BaseNodeContent>
        <label className="text-xs text-muted-foreground">URL</label>
        <input
          className="nodrag w-full text-xs border rounded px-2 py-1 bg-background"
          value={(data.config as { url: string }).url}
          onChange={(e) => updateConfig(id, { url: e.target.value })}
          placeholder="https://example.com"
        />
      </BaseNodeContent>
      <BaseHandle type="target" position={Position.Top} id="in" />
      <BaseHandle type="source" position={Position.Bottom} id="next" />
    </BaseNode>
  )
}
