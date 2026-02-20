import { Position, type NodeProps } from '@xyflow/react'
import { Keyboard } from 'lucide-react'
import {
  BaseNode,
  BaseNodeHeader,
  BaseNodeContent,
  type BuilderNode,
} from './base-node'
import { BaseHandle } from './base-handle'
import { useBuilderStore } from '../../store'
import { VariableField } from '../variable-input'

export function TypeTextNode({ id, data }: NodeProps<BuilderNode>) {
  const updateConfig = useBuilderStore((s) => s.updateNodeConfig)
  const removeNode = useBuilderStore((s) => s.removeNode)
  const config = data.config as { selector: string; text: string }

  return (
    <BaseNode className="group/node">
      <BaseNodeHeader
        icon={Keyboard}
        label={data.label}
        onDelete={() => removeNode(id)}
      />
      <BaseNodeContent>
        <div>
          <label className="text-xs text-muted-foreground">Selector</label>
          <input
            className="nodrag w-full text-xs border rounded px-2 py-1 bg-background"
            value={config.selector}
            onChange={(e) => updateConfig(id, { selector: e.target.value })}
            placeholder="#input-field"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Text</label>
          <VariableField
            value={config.text}
            onChange={(text) => updateConfig(id, { text })}
            placeholder="Text to type..."
            nodeId={id}
            configKey="text"
          />
        </div>
      </BaseNodeContent>
      <BaseHandle type="target" position={Position.Top} id="in" />
      <BaseHandle type="source" position={Position.Bottom} id="next" />
    </BaseNode>
  )
}
