import { Position, type NodeProps } from '@xyflow/react'
import { GitBranch } from 'lucide-react'
import type { ConditionalConfig } from '@licenseplate-checker/shared/workflow-dsl/config'
import { BaseNode, BaseNodeHeader, BaseNodeContent, type BuilderNode } from './base-node'
import { BaseHandle } from './base-handle'
import { useBuilderStore } from '../../store'
import { VariableField } from '../variable-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function ConditionalNode({ id, data }: NodeProps<BuilderNode>) {
  const updateConfig = useBuilderStore((s) => s.updateNodeConfig)
  const removeNode = useBuilderStore((s) => s.removeNode)
  const config = data.config as ConditionalConfig

  return (
    <BaseNode className="group/node">
      <BaseNodeHeader
        icon={GitBranch}
        label={data.label}
        onDelete={() => removeNode(id)}
      />
      <BaseNodeContent>
        <div>
          <label className="text-xs text-muted-foreground">Condition</label>
          <Select
            value={config.operator}
            onValueChange={(v) => {
              if (v === 'exists') {
                updateConfig(id, { operator: 'exists', value: undefined })
              } else {
                updateConfig(id, { operator: v, value: '' })
              }
            }}
          >
            <SelectTrigger className="nodrag w-full h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="exists">Element exists</SelectItem>
              <SelectItem value="textIncludes">Text includes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Selector</label>
          <input
            className="nodrag w-full text-xs border rounded px-2 py-1 bg-background"
            value={config.selector}
            onChange={(e) => updateConfig(id, { selector: e.target.value })}
            placeholder="#element"
          />
        </div>
        {config.operator === 'textIncludes' && (
          <div>
            <label className="text-xs text-muted-foreground">
              Contains text
            </label>
            <VariableField
              value={config.value}
              onChange={(value) => updateConfig(id, { value })}
              placeholder="expected text"
              nodeId={id}
              configKey="value"
            />
          </div>
        )}
      </BaseNodeContent>
      <BaseHandle type="target" position={Position.Top} id="in" />
      <BaseHandle
        type="source"
        position={Position.Bottom}
        id="true"
        className="bg-emerald-100! border-emerald-500! left-[35%]!"
      />
      <BaseHandle
        type="source"
        position={Position.Bottom}
        id="false"
        className="bg-red-100! border-red-400! left-[65%]!"
      />
    </BaseNode>
  )
}
