import { useRef } from 'react'
import { Position, type NodeProps } from '@xyflow/react'
import { GitBranch } from 'lucide-react'
import type { ConditionalConfig } from '@licenseplate-checker/shared/workflow-dsl/config'
import { BaseNode, BaseNodeHeader, BaseNodeContent, type BuilderNode } from './base-node'
import { BaseHandle } from './base-handle'
import { useBuilderStore } from '../../store'
import { VariablePicker } from '../variable-picker'
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
  const valueRef = useRef<HTMLInputElement>(null)

  const insertVariable = (template: string) => {
    if (config.operator !== 'textIncludes') return
    const input = valueRef.current
    if (!input) {
      updateConfig(id, { value: config.value + template })
      return
    }
    const start = input.selectionStart ?? input.value.length
    const end = input.selectionEnd ?? start
    const value = input.value.slice(0, start) + template + input.value.slice(end)
    updateConfig(id, { value })
    requestAnimationFrame(() => {
      input.focus()
      input.setSelectionRange(start + template.length, start + template.length)
    })
  }

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
            <div className="flex items-center gap-1">
              <input
                ref={valueRef}
                className="nodrag w-full text-xs border rounded px-2 py-1 bg-background"
                value={config.value}
                onChange={(e) => updateConfig(id, { value: e.target.value })}
                placeholder="expected text"
              />
              <VariablePicker onInsert={insertVariable} />
            </div>
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
