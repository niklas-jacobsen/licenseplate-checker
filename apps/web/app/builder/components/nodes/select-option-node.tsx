import { Position, type NodeProps } from '@xyflow/react'
import { ListChecks } from 'lucide-react'
import type { SelectOptionConfig } from '@licenseplate-checker/shared/workflow-dsl/config'
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

export function SelectOptionNode({ id, data }: NodeProps<BuilderNode>) {
  const updateConfig = useBuilderStore((s) => s.updateNodeConfig)
  const removeNode = useBuilderStore((s) => s.removeNode)
  const config = data.config as SelectOptionConfig

  return (
    <BaseNode className="group/node">
      <BaseNodeHeader
        icon={ListChecks}
        label={data.label}
        onDelete={() => removeNode(id)}
      />
      <BaseNodeContent>
        <div>
          <label className="text-xs text-muted-foreground">Mode</label>
          <Select
            value={config.mode}
            onValueChange={(v) => {
              if (v === 'text') {
                updateConfig(id, {
                  mode: 'text',
                  selector: config.selector,
                  text: '',
                  value: undefined,
                  index: undefined,
                })
              } else if (v === 'value') {
                updateConfig(id, {
                  mode: 'value',
                  selector: config.selector,
                  value: '',
                  text: undefined,
                  index: undefined,
                })
              } else {
                updateConfig(id, {
                  mode: 'index',
                  selector: config.selector,
                  index: 0,
                  text: undefined,
                  value: undefined,
                })
              }
            }}
          >
            <SelectTrigger className="nodrag w-full h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">By visible text</SelectItem>
              <SelectItem value="value">By value attribute</SelectItem>
              <SelectItem value="index">By index</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Selector</label>
          <input
            className={`nodrag w-full text-xs border rounded px-2 py-1 bg-background ${!config.selector ? 'border-destructive' : ''}`}
            value={config.selector}
            onChange={(e) => updateConfig(id, { selector: e.target.value })}
            placeholder="select#dropdown"
          />
        </div>

        {config.mode === 'text' && (
          <div>
            <label className="text-xs text-muted-foreground">Option text</label>
            <VariableField
              value={config.text}
              onChange={(text) => updateConfig(id, { text })}
              placeholder="Option label..."
              nodeId={id}
              configKey="text"
              error={!config.text}
            />
          </div>
        )}

        {config.mode === 'value' && (
          <div>
            <label className="text-xs text-muted-foreground">Option value</label>
            <VariableField
              value={config.value}
              onChange={(value) => updateConfig(id, { value })}
              placeholder="option-value"
              nodeId={id}
              configKey="value"
              error={!config.value}
            />
          </div>
        )}

        {config.mode === 'index' && (
          <div>
            <label className="text-xs text-muted-foreground">
              Option index (0-based)
            </label>
            <input
              type="number"
              min={0}
              className="nodrag w-full text-xs border rounded px-2 py-1 bg-background"
              value={config.index}
              onChange={(e) =>
                updateConfig(id, { index: Number(e.target.value) })
              }
            />
          </div>
        )}
      </BaseNodeContent>
      <BaseHandle type="target" position={Position.Top} id="in" />
      <BaseHandle type="source" position={Position.Bottom} id="next" />
    </BaseNode>
  )
}
