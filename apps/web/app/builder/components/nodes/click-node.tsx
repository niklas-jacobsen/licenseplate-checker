import { Position, type NodeProps } from '@xyflow/react'
import { MousePointerClick } from 'lucide-react'
import { BaseNode, BaseNodeHeader, BaseNodeContent, type BuilderNode } from './base-node'
import { BaseHandle } from './base-handle'
import { useBuilderStore } from '../../store'

export function ClickNode({ id, data }: NodeProps<BuilderNode>) {
  const updateConfig = useBuilderStore((s) => s.updateNodeConfig)
  const removeNode = useBuilderStore((s) => s.removeNode)

  return (
    <BaseNode className="group/node">
      <BaseNodeHeader
        icon={MousePointerClick}
        label={data.label}
        onDelete={() => removeNode(id)}
      />
      <BaseNodeContent>
        <label className="text-xs text-muted-foreground">Selector</label>
        <input
          className={`nodrag w-full text-xs border rounded px-2 py-1 bg-background ${!(data.config as { selector: string }).selector ? 'border-destructive' : ''}`}
          value={(data.config as { selector: string }).selector}
          onChange={(e) => updateConfig(id, { selector: e.target.value })}
          placeholder="#submit-btn"
        />
      </BaseNodeContent>
      <BaseHandle type="target" position={Position.Top} id="in" />
      <BaseHandle type="source" position={Position.Bottom} id="next" />
    </BaseNode>
  )
}
